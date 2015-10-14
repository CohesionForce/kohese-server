/**
 *
 */


function ItemRepository(Item, Category, Decision, Action, KoheseUser, socket, $rootScope) {
    var _ = require('underscore');
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
    tree.root.item = {};
    tree.root.item.id = "ROOT";
    tree.root.item.name = "Root of Knowledge Tree";
    tree.root.children = [];
    tree.proxyMap[tree.root.item.id] = tree.root;
    tree.parentOf = {};

    // Create Lost And Found Node
    var lostAndFound = {};
    lostAndFound.item = new Item;
    lostAndFound.item.id = "LOST+FOUND";
    lostAndFound.item.name = "Lost-And-Found";
    lostAndFound.item.description = "Collection of node(s) that are no longer connected.";
    lostAndFound.children = [];
    tree.proxyMap[lostAndFound.item.id] = lostAndFound;

    fetchItems();

    // Register the listeners for the Item kinds that are being tracked
    for (var modelName in itemModel) {
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

    return {
        modelTypes: itemModel,
        itemModel: itemModel,
        getTreeRoot: getTreeRoot,
        getItemProxy: getItem,
        getAllItemProxies: getAllItemProxies,
        fetchItem: fetchItem,
        upsertItem: upsertItem,
        deleteItem: deleteItem,
        copyAttributes: copyAttributes,
        getChildByNameFrom: getChildByNameFrom,
        getDecendentsOf: getDecendentsOf
    };

    function fetchItems() {
        Item.find().$promise.then(function (itemResults) {
            Category.find().$promise.then(function (categoryResults) {
                Decision.find().$promise.then(function (decisionResults) {
                    Action.find().$promise.then(function (actionResults) {
                        KoheseUser.find().$promise.then(function (userResults) {
                            var results = itemResults.concat(categoryResults).concat(decisionResults).concat(actionResults).concat(userResults);
                            convertListToTree(results);
                            tree.root.initial = getAllItemProxies();
                            $rootScope.$broadcast('itemRepositoryReady')
                        });
                    });
                });
            });
        });
    }



    function copyAttributes(fromItem, toItem) {

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

            if (newKind !== proxy.kind) {
                console.log("::: Proxy kind changed from " + proxy.kind + " to " + newKind);
                proxy.kind = newKind;
            }

            // Copy the results into the current proxy
            copyAttributes(results, proxy.item);

            // Determine if the parent changed
            var parentProxy = tree.parentOf[results.id];
            var oldParentId = "";
            if (parentProxy) {
                oldParentId = parentProxy.item.id;
            }

            if (oldParentId !== results.parentId) {
                var newParentId = results.parentId;

                if (parentProxy) {
                    parentProxy.children = _.reject(parentProxy.children, function (childProxy) {
                        return childProxy.item.id === results.id;
                    });
                }

                var newParentProxy;

                if (newParentId === "") {
                    newParentProxy = tree.root;
                } else {
                    newParentProxy = getItem(newParentId);
                }

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
                        if (lostAndFound.children.length === 0) {
                            // This is the last child on lostAndFound, so make the node unavailable
                            tree.root.children = _.reject(tree.root.children, function (childProxy) {
                                return childProxy.item.id === lostAndFound.item.id;
                            });
                        }
                    }
                }
            }
        } else {
            addItemToTree(results);
        }
    }

    function fetchItemByModel(model, byId) {
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

    function getChildByNameFrom(proxy, name){
        for(var childIdx in proxy.children){
            var child = proxy.children[childIdx];
            if (child.item.name === name){
                return child;
            }
        }
        return null;
    }

    function getDecendentsOf(proxy){
        var proxyStack = [];
        for(var childIdx = proxy.children.length - 1; childIdx > -1; childIdx--){
            proxyStack.push(proxy.children[childIdx]);
        }

        var decendantList = [];
        var decendant = proxyStack.pop()
        while(decendant){
            decendantList.push(decendant);
            for(var childIdx = decendant.children.length - 1; childIdx > -1; childIdx--){
                proxyStack.push(decendant.children[childIdx]);
            }
            decendant = proxyStack.pop();
        }
        return decendantList;
    }

    function addItemToTree(item) {

        // Create the proxy and add it to tree structures
        createItemProxy(item);

    }

    function removeItemFromTree(byId) {
        var itemProxy = getItem(byId);
        var parentProxy = getItem(itemProxy.item.parentId);
        var children = itemProxy.children;

        if (!itemProxy.item.parentId){
          parentProxy = tree.root;
        }
        if (parentProxy) {
            parentProxy.children = _.reject(parentProxy.children, function (childProxy) {
                return childProxy.item.id === byId;
            });
        }

        delete tree.proxyMap[byId];

        // If there were children to the node that was deleted, add them to lostAndFound
        if (children.length) {
            var newLostNode = {};
            newLostNode.children = children;
            tree.proxyMap[byId] = newLostNode;
            attachToLostAndFound(byId);
        }
    }

    function createItemProxy(forItem) {
        var itemProxy = {};
        var itemId = forItem.id;
        if (angular.isDefined(tree.proxyMap[itemId])) {
            // Some forward declaration occurred, so copy the existing data
            itemProxy = tree.proxyMap[itemId];
        }
        itemProxy.kind = forItem.constructor.modelName;
        itemProxy.item = forItem;
        if (!itemProxy.children) {
            itemProxy.children = [];
        }
        tree.proxyMap[itemId] = itemProxy;
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

            tree.parentOf[itemId] = parent;

        } else {
            tree.root.children.push(itemProxy);
            tree.parentOf[itemId] = tree.root;
        }
    }

    function convertListToTree(dataList) {
        if (!dataList || dataList.length == 0)
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

        if (lostAndFound.children.length === 1) {
            // This is the first child on lostAndFound, so make the node available
            tree.root.children.push(lostAndFound);
        }
    }

    function getAllItemProxies() {
        var itemProxyList = [];
        for (var key in tree.proxyMap) {
            itemProxyList.push(tree.proxyMap[key]);
        }
        return itemProxyList;
    }

    function getTreeRoot() {
        return tree.root;
    }




}

export default () => {

    angular.module("app.services.itemservice", [])
        .service("ItemRepository", ItemRepository);

}