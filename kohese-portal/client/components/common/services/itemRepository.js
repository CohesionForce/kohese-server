/**
 *
 */

export default () => {
    var _ = require('../../../../node_modules/underscore/underscore.js')
    var module = angular.module("app.services.itemservice", []);

    module.service("ItemRepository", ['Item', 'Analysis', 'socket', '$rootScope', function (Item, Analysis, socket, $rootScope) {

        var tree = {};
        tree.proxyMap = {};

        socket.on('item/create', function (notification) {
            console.log("::: Received notification of Item Created:  " + notification.id);
            fetchItem(notification.id);
        });

        socket.on('item/update', function (notification) {
            console.log("::: Received notification of Item Updated:  " + notification.id);
            fetchItem(notification.id);
        });

        socket.on('item/delete', function (notification) {
            console.log("::: Received notification of Item Deleted:  " + notification.id);
            removeItemFromTree(notification.id);
        });

        function fetchItems() {
            Item.find().$promise.then(function (results) {
                convertListToTree(results, 'id', 'parentId');
                $rootScope.$broadcast('itemRepositoryReady')
            });
        }

        fetchItems();


        function getChildren(ofId) {
            Item.children(ofId).$promise.then(function (results) {
                // TBD:  This needs to be a specific location instead of a global
                var tmpChildList = results;
            });
        }

        function fetchItem(byId) {
            Item.findById({
                id: byId
            }).$promise.then(function (results) {
                    var temp = results;
                    var proxy = tree.proxyMap[byId];

                    if (angular.isDefined(proxy)) {

                        // Copy the results into the current proxy
                        for (var key in proxy.item) {
                            if (!_.isEqual(proxy.item[key], results[key])) {
                                proxy.item[key] = results[key];
                            }
                        }

                        // Determine if the parent changed
                        var parentProxy = tree.parentOf[byId];
                        if (parentProxy.item.id !== results.parentId) {
                            var newParentId = results.parentId;

                            if (parentProxy) {
                                parentProxy.children = _.reject(parentProxy.children, function (childProxy) {
                                    return childProxy.item.id === byId;
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
                            tree.parentOf[byId] = newParentProxy;

                            // Determine if the old parent was in LostAndFound
                            if (parentProxy.item.parentId === "LOST+FOUND") {
                                if (parentProxy.children.length == 0) {
                                    // All unallocated children have been moved or deleted
                                    removeItemFromTree(parentProxy.item.id);
                                }
                            }
                            updateTreeRows();
                        }

                    } else {
                        addItemToTree(results);
                    }
                });
        }

        function retrieveAnalysis(forProxy) {
            var proxy = forProxy;

            // Fetch records depth first
            for (var childIdx = 0; childIdx < proxy.children.length; childIdx++) {
                retrieveAnalysis(proxy.children[childIdx]);
            }

            if (!proxy.analysis) {

                console.log("::: Retrieving analysis for " + proxy.item.id + " - " + proxy.item.title);
                proxy.analysis = {};
                Analysis.findById({
                    id: proxy.item.id
                }).$promise.then(function (results) {
                        var temp = results;

                        if (angular.isDefined(proxy)) {
                            proxy.analysis.data = results;
                            consolidateAnalysis(proxy);
                        }

                    }, function (errorResults) {
                        proxy.analysis = {};
                        console.log("*** Analysis not found for:  " + proxy.item.id + " - " + proxy.item.title);
                        performAnalysis(proxy.item.id);
                    });
            }
        }

        function fetchAnalysis(byId) {
            var proxy = tree.proxyMap[byId];
            retrieveAnalysis(proxy);
        }

        function performAnalysis(byId) {
            var proxy = tree.proxyMap[byId];
            Item.performAnalysis({
                onId: byId
            }).$promise.then(function (results) {
                    proxy.analysis.data = results.data;
                    console.log("::: Analysis performed for: " + proxy.item.id + " - " + proxy.item.title);
                    consolidateAnalysis(proxy);
                });
        }

        function consolidateAnalysis(onProxy) {
            onProxy.analysis.extendedSummaryList = onProxy.analysis.data.summaryList;
            rollUpAnalysis(onProxy);

        }

        function rollUpAnalysis(proxy) {
            if (!proxy.analysis.data) {
                return;
            }

            console.log("--- Rollup for " + proxy.item.id + " - " + proxy.item.title);

            // Initialize the extendedChunkSummary
            proxy.analysis.extendedChunkSummary = {};
            for (var chunkId in proxy.analysis.data.chunkSummary) {
                var chunkSummary = {};
                var chunk = proxy.analysis.data.chunkSummary[chunkId];
                chunkSummary.text = chunk.text;
                chunkSummary.count = chunk.count;
                chunkSummary.posCount = chunk.posCount;
                chunkSummary.displayType = "Chunk";
//      chunkSummary.list = chunk.list.slice();
                proxy.analysis.extendedChunkSummary[chunkId] = chunkSummary;
            }

            // Initialize the extendedTokenSummary
            proxy.analysis.extendedTokenSummary = {};
            for (var tokenId in proxy.analysis.data.tokenSummary) {
                var tokenSummary = {};
                var token = proxy.analysis.data.tokenSummary[tokenId];
                tokenSummary.text = token.text;
                tokenSummary.count = token.count;
                tokenSummary.posCount = token.posCount;
                tokenSummary.displayType = "Token";
//      tokenSummary.list = token.list.slice();
                proxy.analysis.extendedTokenSummary[tokenId] = tokenSummary;
            }

            if (proxy.analysis.data.list) {
                proxy.analysis.extendedList = proxy.analysis.data.list.slice();
            } else {
                return;
            }

            for (var childIdx = 0; childIdx < proxy.children.length; childIdx++) {
                var topic = {};
                topic.displayType = "Item";
                topic.displayId = proxy.children[childIdx].item.id;
                topic.text = proxy.children[childIdx].item.title;
                topic.displayLevel = 1;
                proxy.analysis.extendedList.push(topic);

                var child = proxy.children[childIdx];
                if (child.analysis) {

                    if (child.analysis.extendedList) {
                        proxy.analysis.extendedList = proxy.analysis.extendedList.concat(child.analysis.extendedList);

                        for (var chunkId in child.analysis.extendedChunkSummary) {
                            var chunk = child.analysis.extendedChunkSummary[chunkId];
                            if (angular.isDefined(proxy.analysis.extendedChunkSummary[chunkId])) {
                                proxy.analysis.extendedChunkSummary[chunkId].count += chunk.count;
//              proxy.analysis.extendedChunkSummary[chunkId].list = proxy.analysis.extendedChunkSummary[chunk.text].list.concat(chunk.list);
                            } else {
                                var chunkSummary = {};
                                chunkSummary.text = chunk.text;
                                chunkSummary.count = chunk.count;
                                chunkSummary.posCount = chunk.posCount;
                                chunkSummary.displayType = "Chunk";
//              chunkSummary.list = chunk.list.slice();
                                proxy.analysis.extendedChunkSummary[chunkId] = chunkSummary;
                            }
                        }

                        for (var tokenId in child.analysis.extendedTokenSummary) {
                            var token = child.analysis.extendedTokenSummary[tokenId];
                            if (angular.isDefined(proxy.analysis.extendedTokenSummary[tokenId])) {
                                proxy.analysis.extendedTokenSummary[tokenId].count += token.count;
                                for (var pos in token.posCount) {
                                    if (angular.isDefined(proxy.analysis.extendedTokenSummary[tokenId].posCount[pos])) {
                                        proxy.analysis.extendedTokenSummary[tokenId].posCount[pos] += token.posCount[pos];
                                    } else {
                                        proxy.analysis.extendedTokenSummary[tokenId].posCount[pos] = token.posCount[pos];
                                    }
                                }
//              proxy.analysis.extendedTokenSummary[tokenId].list = proxy.analysis.extendedTokenSummary[token.text].list.concat(token.list);
                            } else {
                                var tokenSummary = {};
                                tokenSummary.text = token.text;
                                tokenSummary.count = token.count;
                                tokenSummary.posCount = token.posCount;
                                tokenSummary.displayType = "Token";
//              tokenSummary.list = token.list.slice();
                                proxy.analysis.extendedTokenSummary[tokenId] = tokenSummary;
                            }
                        }
                    }
                }
            }

            proxy.analysis.extendedSummaryList = _.union(_.values(proxy.analysis.extendedChunkSummary), _.values(proxy.analysis.extendedTokenSummary));

            var parentProxy = getItem(proxy.item.parentId);

            if (parentProxy) {
                console.log("::: Parent found");
                if (angular.isDefined(parentProxy.analysis)) {
                    rollUpAnalysis(parentProxy);
                }
            }

        }

        function upsertItem(item){
            return Item.upsert(item).$promise
        }

        function deleteItem(item){
           return Item.deleteById(item).$promise
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
            lostAndFound.item.title = "Lost-And-Found";
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
            lostProxy.item.title = "Lost Item: " + byId;
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
            fetchAnalysis: fetchAnalysis,
            attachToLostAndFound: attachToLostAndFound
        }
    }]);

}