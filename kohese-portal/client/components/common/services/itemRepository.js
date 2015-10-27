/**
 *
 */

function ItemRepository(Item, Category, Decision, Action, Observation, Issue, KoheseUser, socket, $rootScope) {
    var _ = require('underscore');
    var ItemProxy = require('../../../../common/models/item-proxy');
    var modelTypes = {
        Item: Item,
        Category: Category,
        Decision: Decision,
        Action: Action,
        Observation: Observation,
        Issue: Issue,
        KoheseUser: KoheseUser
    };

    fetchItems();

    // Register the listeners for the Item kinds that are being tracked
    for (var modelName in modelTypes) {
        socket.on(modelName + '/create', function (notification) {
            console.log("::: Received notification of " + notification.model + " Created:  " + notification.id);
            fetchItemByModel(modelTypes[notification.model], notification.id);
        });

        socket.on(modelName + '/update', function (notification) {
            console.log("::: Received notification of " + notification.model + " Updated:  " + notification.id);
            fetchItemByModel(modelTypes[notification.model], notification.id);
        });

        socket.on(modelName + '/delete', function (notification) {
            console.log("::: Received notification of " + notification.model + " Deleted:  " + notification.id);
            var proxy = ItemProxy.getProxyFor(notification.id);
            proxy.deleteItem();
        });
    }

    return {
        modelTypes: modelTypes,
        getRootProxy: ItemProxy.getRootProxy,
        getProxyFor: ItemProxy.getProxyFor,
        getAllItemProxies: ItemProxy.getAllItemProxies,
        fetchItem: fetchItem,
        upsertItem: upsertItem,
        deleteItem: deleteItem,
        copyAttributes: copyAttributes,
    };

    function fetchItems() {
        Item.find().$promise.then(function (itemResults) {
          Category.find().$promise.then(function (categoryResults) {
            Decision.find().$promise.then(function (decisionResults) {
              Action.find().$promise.then(function (actionResults) {
                Observation.find().$promise.then(function (observationResults) {
                  Issue.find().$promise.then(function (issueResults) {
                    KoheseUser.find().$promise.then(function (userResults) {
                      var results = itemResults.concat(categoryResults).concat(decisionResults).concat(actionResults).concat(observationResults).concat(issueResults).concat(userResults);
                      convertListToTree(results);
                      $rootScope.$broadcast('itemRepositoryReady')
                    });
                  });
                });
              });
            });
          });
        });
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
          if (proxy.analysis){
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

}

export default () => {

    angular.module("app.services.itemservice", [])
        .service("ItemRepository", ItemRepository);

}