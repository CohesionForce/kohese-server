/**
 * Created by josh on 7/13/15.
 */

function TreeController(Item, ItemRepository, ActionService, UserService, $timeout, $anchorScroll, $state,
                        $scope, $location, $stateParams, SearchService, tabService) {

    var treeCtrl = this,
        syncListener;
    treeCtrl.tab = tabService.getCurrentTab();
    var controllerRestored = tabService.restoreControllerData(treeCtrl.tab.id, 'treeCtrl', this);

    if (!controllerRestored) {
        treeCtrl.kindList = ItemRepository.getModelTypes();
        treeCtrl.actionStates = ActionService.getActionStates();
        treeCtrl.userList = UserService.getAllUsers();
        treeCtrl.collapsed = {};
        treeCtrl.previouslyExpanded = {};
        treeCtrl.allExpanded = false;
        treeCtrl.locationSynced = false;
        treeCtrl.currentLazyItemIdx = 0;
        treeCtrl.lazyLimitIncrement = 20;
        treeCtrl.currentLazyLimit = treeCtrl.lazyLimitIncrement;
        treeCtrl.lazyLimitIncreasePending = false;
        treeCtrl.isRootDefault = true;
        treeCtrl.filter = SearchService.getFilterObject(treeCtrl.tab.id);
        treeCtrl.treeRoot = ItemRepository.getRootProxy();
        treeCtrl.absoluteRoot = ItemRepository.getRootProxy();
        treeCtrl.selectedItemProxy = {};
    } else {
        console.log("Root Check!");
        console.log(treeCtrl);
    }

    $scope.$on('stateChangeSuccess', function () {
        treeCtrl.tab.type = 'dualview';
        treeCtrl.tab.state = $state.current.name
        treeCtrl.tab.params = {id: $stateParams.id}
    });

    $scope.$on('itemRepositoryReady', function () {
        treeCtrl.actionStates = ActionService.getActionStates();
        treeCtrl.userList = UserService.getAllUsers();
    });

    $scope.$watch('treeCtrl.filter.text', function () {
        postDigest(function () {
            // Force one more update cycle to get the match count to display
            $scope.$apply();
        });
    });

    $scope.$watch('treeCtrl.filter.kind', function () {
        postDigest(function () {
            // Force one more update cycle to get the match count to display
            $scope.$apply();
        });
    });

    $scope.$watch('treeCtrl.filter.actionState', function () {
        postDigest(function () {
            // Force one more update cycle to get the match count to display
            $scope.$apply();
        });
    });

    $scope.$watch('treeCtrl.filter.actionAssignee', function () {
        postDigest(function () {
            // Force one more update cycle to get the match count to display
            $scope.$apply();
        });
    });

    $scope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
            SearchService.setFilterObject(treeCtrl.filter, treeCtrl.tab.id);
        });

    if (!treeCtrl.filter) {
        treeCtrl.filter = {
            text: "",
            kind: "",
            actionState: "",
            actionAssignee: "",
            status: false
        };
    }

    treeCtrl.allocateLazyItemIdx = function () {
        var idx = treeCtrl.currentLazyItemIdx;
        treeCtrl.currentLazyItemIdx++;

        if (!treeCtrl.lazyLimitIncreasePending) {
            // New nodes added, need to increase the limit to force a new digest cycle
            // to load more items if they are available
            treeCtrl.lazyLimitIncreasePending = true;
            postDigest(function () {
                treeCtrl.currentLazyLimit = treeCtrl.currentLazyItemIdx + treeCtrl.lazyLimitIncrement;
//                console.log("::: Increased lazy limit to " + treeCtrl.currentLazyLimit);
                treeCtrl.lazyLimitIncreasePending = false;
                $scope.$apply();
            });
        }

        return idx;
    };

    function postDigest(callback) {
        var unregister = $scope.$watch(function () {
//            console.log("::: postDigest at " + treeCtrl.currentLazyItemIdx);
            unregister();
            $timeout(function () {
                callback();
            }, 0, false);
        });
    }

    treeCtrl.getItemCount = function () {
        return $('#theKT').find(".kt-item").length;
    };

    treeCtrl.getItemMatchedCount = function () {
        return $('#theKT').find(".kti-filterMatched").length;
    };

    function getTypeForFilter(val) {
        return (val === null) ? 'null' : typeof val;
    }

    treeCtrl.matchesFilter = function (proxy, exact) {
        if (exact === undefined){
            exact = false;
        }
      
        if (!treeCtrl.filter.text && !treeCtrl.filter.kind && !treeCtrl.filter.status) {
            return !exact;
        } else {
            if (treeCtrl.filter.status && (!proxy.status || (proxy.status && proxy.status.length === 0))) {
                return false;
            }
            if (treeCtrl.filter.kind) {
                if (proxy.kind !== treeCtrl.filter.kind) {
                    return false;
                }
                if (treeCtrl.filter.actionState && proxy.item.actionState !== treeCtrl.filter.actionState) {
                    return false;
                }
                if (treeCtrl.filter.actionAssignee && proxy.item.assignedTo !== treeCtrl.filter.actionAssignee) {
                    return false;
                }
                if (!treeCtrl.filter.text) {
                    return true;
                }
            }
            var lcFilter = treeCtrl.filter.text.toLowerCase();
            for (var key in proxy.item) {
                if ((key.charAt(0) !== '$') && getTypeForFilter(proxy.item[key]) === 'string' && proxy.item[key].toLowerCase().indexOf(lcFilter) !== -1) {
                    return true;
                }
            }
            return false;
        }
    };

    treeCtrl.childMatchesFilter = function (proxy) {
        for (var childIdx = 0; childIdx < proxy.children.length; childIdx++) {
            var childProxy = proxy.children[childIdx];
            if (treeCtrl.matchesFilter(childProxy) || treeCtrl.childMatchesFilter(childProxy)) {
                // exit as soon as the first matching descendant is found
                return true;
            }
        }
        // no descendant found
        return false;
    };

    treeCtrl.tab.setTitle('Explore');

    $scope.$on('tabSelected', function () {
        tabService.bundleController(treeCtrl, 'treeCtrl', treeCtrl.tab.id)
    });

    treeCtrl.updateRoot = function (newRoot) {
        treeCtrl.treeRoot = newRoot;
        treeCtrl.isRootDefault = false;
    };

    treeCtrl.resetRoot = function () {
        treeCtrl.treeRoot = treeCtrl.absoluteRoot;
        treeCtrl.isRootDefault = true;
    };

    treeCtrl.updateTab = function (state, id) {
        treeCtrl.tab.setState(state);
        treeCtrl.tab.params.id = id;
    };

    treeCtrl.removeItem = function (item) {
        var itemId = item.id;
        ItemRepository
            .deleteItem(item)
            .then(function () {
                console.log("::: Item has been deleted: " + itemId);
            });
    };


    syncListener = $scope.$on('syncItemLocation', function onNewItemSelectedHandler(event, data) {

      console.log("::: Sync Item:" + data);
      treeCtrl.selectedItemProxy = ItemRepository.getProxyFor(data);
      
      var ancestorProxy = treeCtrl.selectedItemProxy.parentProxy;
      while(ancestorProxy && ancestorProxy !== treeCtrl.treeRoot){
        if(treeCtrl.collapsed[ancestorProxy.item.id] === undefined || treeCtrl.collapsed[ancestorProxy.item.id]){
//          console.log(">>> Expanding " + ancestorProxy.item.name);
          treeCtrl.collapsed[ancestorProxy.item.id] = false;
        }
        ancestorProxy = ancestorProxy.parentProxy;          
      }
      
      $location.hash(data);
      $anchorScroll();
      
    });
    
    treeCtrl.syncLocation = function () {
      $anchorScroll();
    };

    treeCtrl.expandAll = function () {
        treeCtrl.allExpanded = true;
        for (var key in treeCtrl.collapsed) {
            treeCtrl.collapsed[key] = false;
        }
    };

    treeCtrl.collapseAll = function () {
        treeCtrl.allExpanded = false;
        for (var key in treeCtrl.collapsed) {
            treeCtrl.collapsed[key] = true;
        }
    };

    treeCtrl.collapseChildren = function (itemProxy) {
        var childrenList = itemProxy.getDescendants();
        treeCtrl.collapsed[itemProxy.item.id] = true;
        for (var i = 0; i < childrenList.length; i++) {
            var proxy = childrenList[i];
            treeCtrl.collapsed[proxy.item.id] = true;
        }
    };

    treeCtrl.expandChildren = function (itemProxy) {
        var childrenList = itemProxy.getDescendants();
        treeCtrl.collapsed[itemProxy.item.id] = false;
        for (var i = 0; i < childrenList.length; i++) {
            var proxy = childrenList[i];
            treeCtrl.collapsed[proxy.item.id] = false;
        }
    };

    treeCtrl.navigate = function (state, type, id) {
      treeCtrl.tab.state = state;
      treeCtrl.tab.type = type || 'dualview';
      treeCtrl.tab.params.id = id;
      $state.go(state, {id: id})
    };

    treeCtrl.createChildOfSelectedItem = function () {
      $state.go('kohese.explore.create', {parentId: treeCtrl.selectedItemProxy.item.id})
    };
}

export default () => {
    angular.module('app.tree', ['app.services.tabservice'])
        .controller('TreeController', TreeController);
}
