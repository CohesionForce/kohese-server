/**
 *
 */

export default () => {
    var _ = require('underscore');
    var module = angular.module("app.services.itemservice", []);

    module.service("ItemRepository", ['Item', 'Category', 'KoheseUser', 'socket', '$rootScope', function (Item, Category, KoheseUser, socket, $rootScope) {

        var itemModel = {
            Item: Item,
            Category: Category,
            KoheseUser: KoheseUser
        };
        
        var tree = {};
        tree.proxyMap = {};

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
            Item.find().$promise.then(function (itemResults) {
                Category.find().$promise.then(function (categoryResults) {
                  KoheseUser.find().$promise.then(function (userResults) {
                  var results = itemResults.concat(categoryResults).concat(userResults);
                  convertListToTree(results, 'id', 'parentId');
                  $rootScope.$broadcast('itemRepositoryReady')
                  });
                });
            });
        }

        fetchItems();

        function updateItemProxy(results) {
            var proxy = tree.proxyMap[results.id];

            if (angular.isDefined(proxy)) {

                // Copy the results into the current proxy
                for (var key in proxy.item) {
                    if (!_.isEqual(proxy.item[key], results[key])) {
                        proxy.item[key] = results[key];
                    }
                }

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
                updateTreeRows();
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

            // Add the node to the tree rows
            updateTreeRows();

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

            updateTreeRows();
        }

        function createItemProxy(forItem) {
            var itemProxy = {};
            var primaryKey = forItem.id;
            if (angular.isDefined(tree.proxyMap[primaryKey])) {
                // Some forward declaration occurred, so copy the existing data
                itemProxy = tree.proxyMap[primaryKey];
            }
            itemProxy.item = forItem;
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
                tree.roots.push(itemProxy);
            }
        }

        function convertListToTree(dataList, primaryIdFieldName, parentIdFieldName) {
            if (!dataList || dataList.length == 0 || !primaryIdFieldName || !parentIdFieldName)
                return [];

            tree.roots = [];
            tree.parentOf = {};

            for (var idx = 0; idx < dataList.length; idx++) {
                createItemProxy(dataList[idx]);
            }

            // Create Lost And Found Node
            var lostAndFound = {};
            lostAndFound.item = new Item;
            lostAndFound.item.name = "Lost-And-Found";
            lostAndFound.item.description = "Collection of node(s) that are no longer connected.";
            lostAndFound.item.id = "LOST+FOUND";
            lostAndFound.children = [];
            tree.proxyMap[lostAndFound.item.id] = lostAndFound;
            tree.roots.push(lostAndFound);

            // Gather unconnected nodes into Lost And Found
            for (var id in tree.proxyMap) {
                if (angular.isUndefined(tree.proxyMap[id].item)) {
                    attachToLostAndFound(id);
                }
            }

            updateTreeRows();
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

        function updateTreeRows() {
            var rowStack = [];

            // Push the nodes onto the rowStack in reverse order
            for (var idx = tree.roots.length - 1; idx >= 0; idx--) {
                rowStack.push(tree.roots[idx]);
            }

            var newTreeRows = [];
            var node;

            // Process each node from the top of the stack.  This will behave like
            // a pre-ordered depth first iteration over the tree.
            while (node = rowStack.pop()) {
                var parentRef = getItem(node.item.parentId);
                if (angular.isDefined(parentRef)) {
                    node.level = parentRef.level + 1;
                } else {
                    node.level = 1;
                }
                newTreeRows.push(node);

                if (angular.isDefined(node.children)) {
                    for (var childIdx = node.children.length - 1; childIdx >= 0; childIdx--) {
                        rowStack.push(node.children[childIdx]);
                    }
                } else {
                    // Create an empty children list
                    node.children = [];
                }

                tree.rows = newTreeRows;
            }

            // Detect any remaining unconnected nodes
            for (var id in tree.proxyMap) {
                if (angular.isUndefined(tree.proxyMap[id].level)) {
                    console.log("Warning:  Node parent is missing for " + id);
                    console.log(tree.proxyMap[id]);
                }
                if (angular.isUndefined(tree.proxyMap[id].item)) {
                    console.log("Warning:  Found " + id);
                    console.log(tree.proxyMap[id]);
                }
            }

        }

        var lookup = {};
        lookup.CC = "Coordinating Conjuction";
        lookup.LS = "List Item";
        lookup.PRPS = "Possessive Pronoun";
        lookup.VBD = "Past Tense Verb";
        lookup.CD = "Cardinal Number";
        lookup.MD = "Modal";
        lookup.RB = "Adverb";
        lookup.VBG = "Present Participle Verb";
        lookup.DT = "Determiner";
        lookup.NN = "Noun";
        lookup.RBR = "Comparative Adverb";
        lookup.VBN = "Past Participle Verb";
        lookup.EX = "Existential There";
        lookup.NNS = "Plural Noun";
        lookup.RBS = "Superlative Adverb";
        lookup.VBP = "Non-3rd Present Verb";
        lookup.FW = "Foreign Word";
        lookup.NNP = "Proper Noun";
        lookup.RP = "Particle";
        lookup.VBZ = "3rd Person Present Verb";
        lookup.IN = "Preposition";
        lookup.NNPS = "Plural Proper Noun";
        lookup.SYM = "Symbol";
        lookup.WDT = "WH Determiner";
        lookup.JJ = "Adjective";
        lookup.PDT = "Predeterminer";
        lookup.TO = "To";
        lookup.WP = "WH Pronoun";
        lookup.JJR = "Comparative Adjective";
        lookup.POS = "Possessive Ending";
        lookup.UH = "Interjection";
        lookup.WPS = "Possessive WH Pronoun";
        lookup.JJS = "Superlative Adjective";
        lookup.PRP = "Personal Pronoun";
        lookup.VB = "Verb";
        lookup.WRB = "WH Adverb";
        lookup.ADJP = "Adjective";
        lookup.NP = "Noun Phrase";
        lookup.UCP = "Unlike Coordinated Phrase";
        lookup.ADVP = "Adverb";
        lookup.NX = "Head Noun";
        lookup.VP = "Verb Phrase";
        lookup.CONJP = "Conjunction";
        lookup.PP = "Prepositional";
        lookup.WHADJP = "WH Adjective";
        lookup.FRAG = "Fragment";
        lookup.PRN = "Parenthetical";
        lookup.WHAVP = "WH Adverb";
        lookup.INTJ = "Interjection";
        lookup.PRT = "Particle";
        lookup.WHNP = "WH Noun";
        lookup.LST = "List";
        lookup.QP = "Quantifier";
        lookup.WHPP = "WH Prepositional";
        lookup.NAC = "Not A Constituent";
        lookup.RRC = "Reduced Relative Clause";

        // Does this (X) really exist?
        lookup.X = "Unknown";

        return {
            deleteItem: deleteItem,
            upsertItem: upsertItem,
            internalTree: tree,
            getItemProxy: getItem,
            fetchItem: fetchItem,
            attachToLostAndFound: attachToLostAndFound
        }
    }
    ])
    ;

}