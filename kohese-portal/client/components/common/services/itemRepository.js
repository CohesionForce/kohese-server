/**
 *
 */

function ItemRepository(Repository, Item, Category, Decision, Action, Observation, Issue, Task, KoheseUser, KoheseIO, $rootScope, toastr) {
    var _ = require('underscore');
    var ItemProxy = require('../../../../common/models/item-proxy');
    var createStates = require('../../../../common/models/createStates');
    var shortProxyList = [];
    var modelTypes = {
        Repository: Repository,
        Item: Item,
        Decision: Decision,
        Action: Action,
        Task: Task,
        Observation: Observation,
        Issue: Issue,
        Category: Category,
        KoheseUser: KoheseUser
    };

    function registerKoheseIOListeners() {
        // Register the listeners for the Item kinds that are being tracked
        for (var modelName in modelTypes) {
            KoheseIO.socket.on(modelName + '/create', function (notification) {
                console.log("::: Received notification of " + notification.model + " Created:  " + notification.id);
                fetchItemByModel(modelTypes[notification.model], notification.id);
                var rootProxy = ItemProxy.getRootProxy();
                getStatusFor(rootProxy);
            });

            KoheseIO.socket.on(modelName + '/update', function (notification) {
                console.log("::: Received notification of " + notification.model + " Updated:  " + notification.id);
                fetchItemByModel(modelTypes[notification.model], notification.id);
                var rootProxy = ItemProxy.getRootProxy();
                getStatusFor(rootProxy);
            });

            KoheseIO.socket.on(modelName + '/delete', function (notification) {
                console.log("::: Received notification of " + notification.model + " Deleted:  " + notification.id);
                var proxy = ItemProxy.getProxyFor(notification.id);
                proxy.deleteItem();
                var rootProxy = ItemProxy.getRootProxy();
                getStatusFor(rootProxy);
            });
        }

        KoheseIO.socket.on('connect_error', function () {
            console.log("::: IR: Socket IO Connection Error");
            toastr.error('Disconnected from server', 'Connection Error');
        });

        KoheseIO.socket.on('reconnect', function () {
            fetchItems();
            toastr.success('Reconnected!', 'Server Connection!');
        });

    }

    if (KoheseIO.isAuthenticated) {
        console.log("::: IR: KoheseIO already connected");
        registerKoheseIOListeners();
        fetchItems();
    } else {
        console.log("::: IR: Listening for KoheseIO connection");
        var deregister = $rootScope.$on('KoheseIOConnected', function () {
            console.log("::: IR: KoheseIO Connected");
            registerKoheseIOListeners();
            fetchItems();
            deregister();
        });
    }

    return {
        getModelTypes: getModelTypes,
        modelTypes: modelTypes,
        getRootProxy: ItemProxy.getRootProxy,
        getProxyFor: ItemProxy.getProxyFor,
        getAllItemProxies: ItemProxy.getAllItemProxies,
        getRepositories: ItemProxy.getRepositories,
        getShortFormItemList : getShortFormItemList,
        fetchItem: fetchItem,
        upsertItem: upsertItem,
        deleteItem: deleteItem,
        copyAttributes: copyAttributes,
        generateHTMLReportFor: generateHTMLReportFor,
        generateDOCXReportFor: generateDOCXReportFor,
        getHistoryFor: getHistoryFor,
        getStatusFor: getStatusFor
    };

    function fetchItems() {
        Repository.find().$promise.then(function (repoResults) {
            Item.find().$promise.then(function (itemResults) {
                Category.find().$promise.then(function (categoryResults) {
                    Decision.find().$promise.then(function (decisionResults) {
                        Action.find().$promise.then(function (actionResults) {
                            Observation.find().$promise.then(function (observationResults) {
                                Issue.find().$promise.then(function (issueResults) {
                                    Task.find().$promise.then(function (taskResults) {
                                        KoheseUser.find().$promise.then(function (userResults) {
                                            var results = repoResults.concat(itemResults).concat(categoryResults).concat(decisionResults).concat(actionResults).concat(observationResults).concat(issueResults).concat(taskResults).concat(userResults);
                                            convertListToTree(results);
                                            $rootScope.$broadcast('itemRepositoryReady');
                                            var rootProxy = ItemProxy.getRootProxy();
                                            getStatusFor(rootProxy);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    function getModelTypes(){
        modelTypes.empty = {modelName: ''};
        return modelTypes;
    }

    function createShortFormItemList(){
        var proxies = ItemProxy.getAllItemProxies();
        shortProxyList=[];
        for (var i = 0; i < proxies.length; i++ ){
            shortProxyList.push({
                name: proxies[i].item.name,
                id: proxies[i].item.id
            })
        }
    }

    function getShortFormItemList(){
        createShortFormItemList();
        return shortProxyList;
    }

    function copyAttributes(fromItem, toItem) {
        // TBD: Need to remove
        console.log("### Deprecated call to copyAttributes");

        // Copy attributes proxy
        for (var key in fromItem) {
            if ((key.charAt(0) !== '$') && !_.isEqual(fromItem[key], toItem[key])) {
                toItem[key] = fromItem[key];
            }
        }
    }

    function updateItemProxy(withResults) {
        var proxy = ItemProxy.getProxyFor(withResults.id);

        if (proxy) {
            proxy.updateItem(withResults.constructor.modelName, withResults);
            if (proxy.analysis) {
                // delete the analysis in case some of the requisite data was updated
                delete proxy.analysis;
            }
        } else {
            proxy = new ItemProxy(withResults.constructor.modelName, withResults);
        }
    }

    function fetchItemByModel(model, byId) {
        //TBD:  why is the model only being used to the name?
        var promise = modelTypes[model.modelName].findById({
            id: byId
        }).$promise;

        promise.then(function (results) {
            updateItemProxy(results);
        });

        return promise;
    }

    function fetchItem(item) {
        var model = item.constructor;

        return fetchItemByModel(model, item.id);
    }

    function upsertItem(item) {
        console.log("::: Preparing to upsert " + item.constructor.modelName)
        var promise = item.constructor.upsert(item).$promise;

        promise.then(function (withResults) {
            updateItemProxy(withResults);
        });

        return promise;
    }

    function deleteItem(item) {
        console.log("::: Preparing to deleteById " + item.constructor.modelName)
        return item.constructor.deleteById(item).$promise
    }

    function createItemProxy(forItem) {
        var iProxy = new ItemProxy(forItem.constructor.modelName, forItem);
    }

    function convertListToTree(dataList) {
        if (!dataList || dataList.length == 0)
            return;

        for (var idx = 0; idx < dataList.length; idx++) {
            createItemProxy(dataList[idx]);
        }
    }
    
    function generateHTMLReportFor(proxy) {

      Item.generateHTMLReport({
          onId: proxy.item.id
      }).$promise.then(function (results) {
              console.log("::: Report results: " + results.data.html);
          });
    }

    function generateDOCXReportFor(proxy) {

      Item.generateDOCXReport({
          onId: proxy.item.id
      }).$promise.then(function (results) {
              console.log("::: Report results: " + results.data.docx);
          });
    }

    function getHistoryFor(proxy) {

      Item.getHistory({
          onId: proxy.item.id
      }).$promise.then(function (results) {
              if (!proxy.history) {
                  proxy.history = {};
              }
              proxy.history = results.data.history;
              console.log("::: History retrieved for: " + proxy.item.id + " - " + proxy.item.name);
          });
    }

    function getStatusFor(repo) {

      Item.getStatus({
          onId: repo.item.id
      }).$promise.then(function (results) {
          if (!repo.repoStatus) {
              repo.repoStatus = {};
          }
          repo.repoStatus = results.data;
          console.log("::: Status retrieved for: " + repo.item.id + " - " + repo.item.name);
          console.log(repo.repoStatus);
          for(var rIdx in repo.repoStatus) {
            var entry = repo.repoStatus[rIdx];
            console.log("+++ " + rIdx + " - " + entry.id + " - " + entry.status );

            var proxy = ItemProxy.getProxyFor(entry.id);
            if (proxy) {
              proxy.status = entry.status              
            } else {
              console.log("!!! Item not found for entry: " + rIdx + " - " + entry.id + " - " + entry.status );              
            }
            
          }
      });
    }

}

export default () => {

    angular.module("app.services.itemservice", [])
        .service("ItemRepository", ItemRepository);

}