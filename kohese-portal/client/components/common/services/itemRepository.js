/**
 *
 */

function ItemRepository(KoheseIO, $rootScope, toastr) {
    var _ = require('underscore');
    var ItemProxy = require('../../../../common/models/item-proxy');
    var createStates = require('../../../../common/models/createStates');
    var shortProxyList = [];
    var modelTypes = {
        Repository: "Repository",
        Item: "Item",
        Decision: "Decision",
        Action: "Action",
        Task: "Task",
        Observation: "Observation",
        Issue: "Issue",
        Category: "Category",
        KoheseUser: "KoheseUser"
    };

    function registerKoheseIOListeners() {
        // Register the listeners for the Item kinds that are being tracked
        for (var modelName in modelTypes) {
            KoheseIO.socket.on(modelName + '/create', function (notification) {
                console.log("::: Received notification of " + notification.kind + " Created:  " + notification.item.id);
                var proxy = ItemProxy.getProxyFor(notification.item.id);
                if (proxy) {
                   proxy.updateItem(notification.kind, notification.item);
                } else {
                	proxy = new ItemProxy(notification.kind, notification.item);
                }

                proxy.status = notification.status;
                proxy.dirty = false;
            });

            KoheseIO.socket.on(modelName + '/update', function (notification) {
                console.log("::: Received notification of " + notification.kind + " Updated:  " + notification.item.id);
                var proxy = ItemProxy.getProxyFor(notification.item.id);
                if (proxy) {
                   proxy.updateItem(notification.kind, notification.item);
                } else {
                	proxy = new ItemProxy(notification.kind, notification.item);
                }

                proxy.status = notification.status;
                proxy.dirty = false;
            });
            
            KoheseIO.socket.on(modelName + '/delete', function (notification) {
                console.log("::: Received notification of " + notification.kind + " Deleted:  " + notification.id);
                var proxy = ItemProxy.getProxyFor(notification.id);
                proxy.deleteItem();
            });
        }
        
        KoheseIO.socket.on("VersionControl/statusUpdated", function (gitStatusMap) {
          for (var id in gitStatusMap) {
            var proxy = ItemProxy.getProxyFor(id);
            proxy.status = gitStatusMap[id];
          }
        });

        KoheseIO.socket.on('connect_error', function () {
            console.log("::: IR: Socket IO Connection Error");
            toastr.error('Disconnected from server', 'Connection Error');
        });

        KoheseIO.socket.on('reconnect', function () {
            if (KoheseIO.isAuthenticated) {
              console.log("::: IR: KoheseIO already authenticated");
              fetchItems();
              toastr.success('Reconnected!', 'Server Connection!');
            } else {
              console.log("::: IR: Listening for KoheseIO authentication");
              var deregister = $rootScope.$on('KoheseIOAuthenticated', function () {
                  console.log("::: IR: KoheseIO Authenticated");
                  fetchItems();
                  toastr.success('Reconnected!', 'Server Connection!');
                  deregister();
              });
            }
        });

    }

    if (KoheseIO.isAuthenticated) {
        console.log("::: IR: KoheseIO already connected");
        registerKoheseIOListeners();
        fetchItems();
    } else {
        console.log("::: IR: Listening for KoheseIO connection");
        var deregister = $rootScope.$on('KoheseIOAuthenticated', function () {
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
        getStatusFor: getStatusFor,
        performAnalysis: performAnalysis
    };

    function fetchItems() {
      KoheseIO.socket.emit('Item/getAll', {}, function (response) {
        console.log("::: Response for getAll");
        ItemProxy.loadModelDefinitions(response.modelDef);
        for(var kind in response.cache){
          console.log("--- Processing " + kind);
          var kindList = response.cache[kind];
          for (var index in kindList){
            var item = JSON.parse(kindList[index]);
            var iProxy = new ItemProxy(kind, item);
          }
        }

        $rootScope.$broadcast('itemRepositoryReady');
        var rootProxy = ItemProxy.getRootProxy();
        getStatusFor(rootProxy);

      });         
    }

    function getModelTypes(){
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
        } else {
            proxy = new ItemProxy(withResults.constructor.modelName, withResults);
        }
        proxy.dirty = false;
    }

    function fetchItem(proxy) {

      var promise = new Promise((resolve, reject) => {
        KoheseIO.socket.emit('Item/findById', {id: proxy.item.id}, function (response) {
          proxy.updateItem(response.kind, response.item);
          proxy.dirty = false;
          resolve(response);
        });         
      });

      return promise;
    }

    function upsertItem(proxy) {
        console.log("::: Preparing to upsert " + proxy.kind);
        
        var promise = new Promise((resolve, reject) => {
          KoheseIO.socket.emit('Item/upsert', {kind: proxy.kind, item:proxy.item}, function (response) {
            if (response.error){
              reject(response.error);
            } else {
              console.log(response);
              if(!proxy.updateItem){
                proxy.item = response.item;
                proxy = new ItemProxy(response.kind, response.item);
              } else {
                proxy.updateItem(response.kind, response.item);
              }
              proxy.dirty = false;
              resolve(proxy);              
            }
          });         
        });
        
        return promise;
    }

    function deleteItem(proxy) {
        console.log("::: Preparing to deleteById " + proxy.kind);
        
        var promise = new Promise((resolve, reject) => {
          KoheseIO.socket.emit('Item/deleteById', {kind: proxy.kind, id: proxy.item.id}, function (response) {
            if (response.error){
              reject(response.error);
            } else {
              resolve(response);              
            }
           });
        });
        
        return promise;

    }

    function generateHTMLReportFor(proxy) {

      KoheseIO.socket.emit('Item/generateReport', {onId: proxy.item.id, format: "html"}, function (results) {
        console.log("::: Report results: " + results.html);
      });

    }

    function generateDOCXReportFor(proxy) {

      KoheseIO.socket.emit('Item/generateReport', {onId: proxy.item.id, format: "docx"}, function (results) {
        console.log("::: Report results: " + results.docx);
      });

    }

    function getHistoryFor(proxy) {

      KoheseIO.socket.emit('Item/getHistory', {onId: proxy.item.id}, function (results) {
        if (!proxy.history) {
          proxy.history = {};
        }
        proxy.history = results.history;
        console.log("::: History retrieved for: " + proxy.item.id + " - " + proxy.item.name);
        console.log(results);
      });
    }

    function getStatusFor(repo) {

      KoheseIO.socket.emit('Item/getStatus', {repoId: repo.item.id}, function (results) {

          if (!repo.repoStatus) {
              repo.repoStatus = {};
          }
          repo.repoStatus = results;
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

    function performAnalysis (forProxy){
      console.log("::: Performing analysis for " + forProxy.id);
      
      var promise = new Promise((resolve, reject) => {
        KoheseIO.socket.emit('Item/performAnalysis', {kind: forProxy.kind, id:forProxy.item.id}, function (response) {
          if (response.error){
            reject(response.error);
          } else {
            resolve(response);              
          }
        });         
      });
      
      return promise;
      
    }
}

export default () => {

    angular.module("app.services.itemservice", [])
        .service("ItemRepository", ItemRepository);

}