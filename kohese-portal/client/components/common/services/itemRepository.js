/**
 *
 */

export default () => {
    var _ = require('underscore');
    var module = angular.module("app.services.itemservice", []);

    module.service("ItemRepository", ['Item', 'Category', 'Decision', 'Action', 'KoheseUser', 'socket', '$rootScope', function (Item, Category, Decision, Action, KoheseUser, socket, $rootScope) {

        var itemModel = {
            Item: Item,
            Category: Category,
            Decision: Decision,
            Action: Action,
            KoheseUser: KoheseUser
        };
        
        var tree = {};
        tree.proxyMap = {};
        tree.root = {};
        tree.root.item = {name: "Root of Tree"};
        tree.root.children=[];
        tree.parentOf = {};
        tree.proxyMap[""]=tree.root;

        // Create Lost And Found Node
        var lostAndFound = {};
        lostAndFound.item = new Item;
        lostAndFound.item.name = "Lost-And-Found";
        lostAndFound.item.description = "Collection of node(s) that are no longer connected.";
        lostAndFound.item.id = "LOST+FOUND";
        lostAndFound.children = [];
        tree.proxyMap[lostAndFound.item.id] = lostAndFound;
        tree.root.children.push(lostAndFound);

        // Register the listeners for the Item kinds that are being tracked
        for(var modelName in itemModel){
          socket.on(modelName + '/create', function (notification) {
            console.log("::: Received notification of " + notification.model + " Created:  " + notification.id);
            fetchItemByModel(itemModel[notification.model], notification.id);
          });

          socket.on(modelName + '/update', function (notification) {
            console.log("::: Received notification of " + notification.model + " Updated:  " + notification.id);
            fetchItemByModel(itemModel[notification.model], notification.id);
          });

          socket.on(modelName + '/delete', function (notification) {
            console.log("::: Received notification of " + notification.model + " Deleted:  " + notification.id);
            removeItemFromTree(notification.id);
          });  
        }
        

        function fetchItems() {
            console.log('::: Fetching: ' + Date.now()/1000);
            Item.find().$promise.then(function (itemResults) {
              console.log('::: Received Items: ' + Date.now()/1000);
              Category.find().$promise.then(function (categoryResults) {
                console.log('::: Received Categories: ' + Date.now()/1000);
                Decision.find().$promise.then(function (decisionResults) {
                  console.log('::: Received Decisions: ' + Date.now()/1000);  
                  Action.find().$promise.then(function (actionResults) {
                    console.log('::: Received Actions: ' + Date.now()/1000);  
                    KoheseUser.find().$promise.then(function (userResults) {
                        console.log('::: Received Users: ' + Date.now()/1000);  
                        var results = itemResults.concat(categoryResults).concat(decisionResults).concat(actionResults).concat(userResults);
                        convertListToTree(results, 'id', 'parentId');
                        console.log('::: List converted: ' + Date.now()/1000);
                        $rootScope.$broadcast('itemRepositoryReady')
                    });
                  });
                });
              });
            });
        }

        fetchItems();

        function copyAttributes(fromItem, toItem){
          
          // Copy attributes proxy
          for (var key in fromItem) {
              if ((key.charAt(0) !== '$') && !_.isEqual(fromItem[key], toItem[key])) {
                toItem[key] = fromItem[key];
              }
          }          
        }
        
        function updateItemProxy(results) {
            var proxy = tree.proxyMap[results.id];

            if (angular.isDefined(proxy)) {

                // Determine if item kind changed
                var newKind = results.constructor.modelName;
              
                if (newKind !== proxy.kind){
                  console.log("::: Proxy kind changed from " + proxy.kind + " to " + newKind);
                  proxy.kind = newKind;
                }
            
                // Copy the results into the current proxy
                copyAttributes(results, proxy.item);

                // Determine if the parent changed
                var parentProxy = tree.parentOf[results.id];
                var oldParentId = "";
                if (parentProxy){
                  oldParentId = parentProxy.item.id;
                }
                
                if (oldParentId !== results.parentId) {
                    var newParentId = results.parentId;

                    if (parentProxy) {
                        parentProxy.children = _.reject(parentProxy.children, function (childProxy) {
                            return childProxy.item.id === results.id;
                        });
                    }

                    var newParentProxy = getItem(newParentId);

                    if (newParentProxy) {
                        newParentProxy.children.push(proxy);
                    } else {
                        // Parent not found, so create one
                        newParentProxy = {};
                        tree.proxyMap[newParentId] = newParentProxy;
                        newParentProxy.children = [proxy];
                        attachToLostAndFound(newParentId);
                    }
                    tree.parentOf[results.id] = newParentProxy;

                    // Determine if the old parent was in LostAndFound
                    if (parentProxy && (parentProxy.item.parentId === "LOST+FOUND")) {
                        if (parentProxy.children.length == 0) {
                            // All unallocated children have been moved or deleted
                            removeItemFromTree(parentProxy.item.id);
                        }
                    }
                }
            } else {
                addItemToTree(results);
            }
        }

        function fetchItemByModel(model,byId) {
          var promise = itemModel[model.modelName].findById({
            id: byId
          }).$promise;

          promise.then(function (results) {
            updateItemProxy(results, byId);
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

            promise.then(function (results) {
                updateItemProxy(results);
            });

            return promise;
        }

        function deleteItem(item) {
            console.log("::: Preparing to deleteById " + item.constructor.modelName)
            return item.constructor.deleteById(item).$promise
        }

        function getItem(byId) {
            return tree.proxyMap[byId];
        }

        function addItemToTree(item) {

            // Create the proxy and add it to tree structures
            createItemProxy(item);

        }

        function removeItemFromTree(byId) {
            var itemProxy = getItem(byId);
            var parentProxy = getItem(itemProxy.item.parentId);

            if (parentProxy) {
                parentProxy.children = _.reject(parentProxy.children, function (childProxy) {
                    return childProxy.item.id === byId;
                });
            }

            delete tree.proxyMap[byId];

        }

        function createItemProxy(forItem) {
            var itemProxy = {};
            var primaryKey = forItem.id;
            if (angular.isDefined(tree.proxyMap[primaryKey])) {
                // Some forward declaration occurred, so copy the existing data
                itemProxy = tree.proxyMap[primaryKey];
            }
            itemProxy.kind = forItem.constructor.modelName;
            itemProxy.item = forItem;
            if (!itemProxy.children){
              itemProxy.children = [];              
            }
            tree.proxyMap[primaryKey] = itemProxy;
            var parent = {};
            var parentId = itemProxy.item.parentId;

            if (parentId) {
                if (angular.isDefined(tree.proxyMap[parentId])) {
                    parent = tree.proxyMap[parentId];
                } else {
                    // Create the parent before it is found
                    parent = {};
                    tree.proxyMap[parentId] = parent;
                }

                if (parent.children) {
                    parent.children.push(itemProxy);
                } else {
                    parent.children = [itemProxy];
                }

                tree.parentOf[primaryKey] = parent;

            } else {
                tree.root.children.push(itemProxy);
            }
        }

        function convertListToTree(dataList, primaryIdFieldName, parentIdFieldName) {
            if (!dataList || dataList.length == 0 || !primaryIdFieldName || !parentIdFieldName)
                return [];

            for (var idx = 0; idx < dataList.length; idx++) {
                createItemProxy(dataList[idx]);
            }

            // Gather unconnected nodes into Lost And Found
            for (var id in tree.proxyMap) {
                if (angular.isUndefined(tree.proxyMap[id].item)) {
                    attachToLostAndFound(id);
                }
            }

        }

        function attachToLostAndFound(byId) {
            var lostProxy = tree.proxyMap[byId];
            lostProxy.item = new Item;
            lostProxy.item.name = "Lost Item: " + byId;
            lostProxy.item.description = "Found children nodes referencing this node as a parent.";
            lostProxy.item.id = byId;
            lostProxy.item.parentId = "LOST+FOUND";

            var lostAndFound = getItem(lostProxy.item.parentId)
            lostAndFound.children.push(lostProxy);
            tree.parentOf[byId] = lostAndFound;
        }

        var getAllItemProxies = function(){
          var itemProxyList = [];
          for(var key in tree.proxyMap){
            itemProxyList.push(tree.proxyMap[key]);
          }
          return itemProxyList;
        }

        var getTreeRoot = function(){
          return tree.root;
        }

        return {
            modelTypes: itemModel,
            itemModel: itemModel,
            getTreeRoot: getTreeRoot,
            getItemProxy: getItem,
            fetchItem: fetchItem,
            upsertItem: upsertItem,
            copyAttributes: copyAttributes,
            attachToLostAndFound: attachToLostAndFound
        }
    }
    ])
    ;

}