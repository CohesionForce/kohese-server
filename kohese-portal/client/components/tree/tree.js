/**
 * Created by josh on 7/13/15.
 */

function KTreeController(ItemRepository, ActionService, UserService, $timeout, $anchorScroll, $state,
                        $scope, $location, $stateParams, SearchService, tabService, VersionControlService,
                        ModalService) {

    var treeCtrl = this,
        syncListener;
    treeCtrl.tab = tabService.getCurrentTab();
    var controllerRestored = tabService.restoreControllerData(treeCtrl.tab.id, 'treeCtrl', this);
    
    var filterTextTimeout;

    if (!controllerRestored) {
        treeCtrl.kindList = ItemRepository.getModelTypes();
        treeCtrl.actionStates = ActionService.getActionStates();
        treeCtrl.userList = UserService.getAllUsers();
        treeCtrl.collapsed = {};
        treeCtrl.previouslyExpanded = {};
        treeCtrl.allExpanded = false;
        treeCtrl.locationSynced = true;
        treeCtrl.currentLazyItemIdx = 0;
        treeCtrl.lazyLimitIncrement = 20;
        treeCtrl.currentLazyLimit = treeCtrl.lazyLimitIncrement;
        treeCtrl.lazyLimitIncreasePending = false;
        treeCtrl.isRootDefault = true;
        treeCtrl.filter = SearchService.getFilterObject(treeCtrl.tab.id);
        treeCtrl.treeRoot = ItemRepository.getRootProxy();
        treeCtrl.absoluteRoot = ItemRepository.getRootProxy();
        treeCtrl.selectedItemProxy = {};
        treeCtrl.versionControlEnabled = false; 
        treeCtrl.stagedItems = [];

        // NEW View Control
        treeCtrl.viewList = ["Default","Advanced Filter","Version Control"]; // TO-DO : Probably want to get this from somewhere else so 
                                                                              // view types can be pulled based on version of Kohese
        treeCtrl.viewType = "Default";
        
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
        if (filterTextTimeout) {
          $timeout.cancel(filterTextTimeout);
        }
        
        filterTextTimeout = $timeout(function() {
          var regexFilter = /^\/(.*)\/([gimy]*)$/;
          var filterIsRegex = treeCtrl.filter.text.match(regexFilter);

          if (filterIsRegex) {
            try {
              treeCtrl.filter.textRegex = new RegExp(filterIsRegex[1],filterIsRegex[2]);
              treeCtrl.filter.textRegexHighlight = new RegExp('(' + filterIsRegex[1] + ')','g' + filterIsRegex[2]);
              treeCtrl.filter.invalidRegex = false;              
            } catch (e) {
              treeCtrl.filter.invalidRegex = true;
            }
          } else {
            let cleanedPhrase = treeCtrl.filter.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            if(treeCtrl.filter.text !== ""){
              treeCtrl.filter.textRegex = new RegExp(cleanedPhrase,"i");
              treeCtrl.filter.textRegexHighlight = new RegExp('(' + cleanedPhrase + ')',"gi");
              treeCtrl.filter.invalidRegex = false;
            } else {
              treeCtrl.filter.textRegex = null;
              treeCtrl.filter.textRegexHighlight = null;
              treeCtrl.filter.invalidRegex = false;
            }
          }

          postDigest(function () {
              // Force one more update cycle to get the match count to display
              $scope.$apply();
          });
        }, 1000); // delay 1000 ms

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
            status: false,
            dirty: false
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

        if ((treeCtrl.filter.textRegex === null) && !treeCtrl.filter.kind && !treeCtrl.filter.status && !treeCtrl.filter.dirty) {
            return !exact;
        } else {
            if (treeCtrl.filter.status && (!proxy.status || (proxy.status && proxy.status.length === 0))) {
                return false;
            }
            if (treeCtrl.filter.dirty && !proxy.dirty) {
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
            }

            if (treeCtrl.filter.textRegex === null) {
              return true;
            }

            for (var key in proxy.item) {
                if ((key.charAt(0) !== '$') && getTypeForFilter(proxy.item[key]) === 'string' && proxy.item[key].match(treeCtrl.filter.textRegex)) {
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
    
    treeCtrl.proxyOrChildMatchesFilter = function (proxy) {
        return (treeCtrl.matchesFilter(proxy) || treeCtrl.childMatchesFilter(proxy));
    }

    $scope.$on('tabSelected', function () {
        tabService.bundleController(treeCtrl, 'treeCtrl', treeCtrl.tab.id)
    });

    treeCtrl.updateRoot = function (newRoot) {
        treeCtrl.treeRoot = newRoot;
        treeCtrl.isRootDefault = false;
    };

    treeCtrl.upLevel = function () {
      if (!treeCtrl.isRootDefault){
        treeCtrl.treeRoot = treeCtrl.treeRoot.parentProxy;
        treeCtrl.isRootDefault = (treeCtrl.treeRoot === treeCtrl.absoluteRoot);        
        console.log("::: Setting root to " + treeCtrl.treeRoot.item.name);
      }
    };

    treeCtrl.resetRoot = function () {
      treeCtrl.treeRoot = treeCtrl.absoluteRoot;
      treeCtrl.isRootDefault = true;
    };

    treeCtrl.updateTab = function (state, id) {
        treeCtrl.tab.setState(state);
        treeCtrl.tab.params.id = id;
    };

    treeCtrl.removeItem = function (proxy) {
        var itemId = proxy.item.id;
        var modalDefaults = {};

        if (proxy.children.length > 0)
        {
            modalDefaults.templateUrl = 'components/common/services/modal-service/deleteModal.html'
        }

        var modalOptions = {
            closeButtonText : 'Cancel',
            actionButtonText : 'Delete',
            headerText: 'Delete "' + proxy.item.name + '"?',
            bodyText: 'Are you sure you want to delete this item?'
        }

        ModalService.showModal(modalDefaults, modalOptions).then((result)=>
            {
            ItemRepository
            .deleteItem(proxy, result.deleteChildren).then(function () 
                {
                console.log("::: Item has been deleted: " + itemId);
                });
        })
    };

    treeCtrl.initCollapsed = function (itemId){
      if (treeCtrl.collapsed[itemId] === undefined){
        treeCtrl.collapsed[itemId] = !treeCtrl.allExpanded;
      }
    }
    
    function expandSyncedNodes() {
      
      if (treeCtrl.selectedItemProxy){
        var ancestorProxy = treeCtrl.selectedItemProxy.parentProxy;
        while(ancestorProxy && ancestorProxy !== treeCtrl.treeRoot){
          if(treeCtrl.collapsed[ancestorProxy.item.id] === undefined || treeCtrl.collapsed[ancestorProxy.item.id]){
            treeCtrl.collapsed[ancestorProxy.item.id] = false;
          }
          ancestorProxy = ancestorProxy.parentProxy;          
        }
        
        $location.hash(treeCtrl.selectedItemProxy.item.id);
        $anchorScroll();
        postDigest(function () {
          // Force one more update cycle to update display
          $scope.$apply();
          $anchorScroll();
         });        
      }
    }
    
    syncListener = $scope.$on('syncItemLocation', function onNewItemSelectedHandler(event, data) {

      console.log("::: Sync Item:" + data);
      treeCtrl.selectedItemProxy = ItemRepository.getProxyFor(data);
      
      if (treeCtrl.locationSynced){
        expandSyncedNodes();        
      }
    });
    
    treeCtrl.syncLocation = function () {
      treeCtrl.locationSynced = !treeCtrl.locationSynced;
      if(treeCtrl.locationSynced){
        expandSyncedNodes();
      }
    };


/******** List expansion functions */
    treeCtrl.expandAll = function () {
        treeCtrl.allExpanded = true;
        for (var key in treeCtrl.collapsed) {
            treeCtrl.collapsed[key] = false;
        }
    };

    treeCtrl.expandFiltered = function () {
        treeCtrl.expandMatchingChildren(treeCtrl.treeRoot);
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

    treeCtrl.expandMatchingChildren = function (itemProxy) {
      var childrenList = itemProxy.children;
      treeCtrl.collapsed[itemProxy.item.id] = false;
      for (var i = 0; i < childrenList.length; i++) {
          var proxy = childrenList[i];
          if (treeCtrl.proxyOrChildMatchesFilter(proxy)){
            treeCtrl.expandMatchingChildren(proxy);
          }
      }
    };

    /****** End list expansion functions */

    treeCtrl.navigate = function (state, params) {
      treeCtrl.tab.setState(state, params);
      $state.go(state, params)
    };

    treeCtrl.createChildOfSelectedItem = function () {
      $state.go('kohese.explore.create', {parentId: treeCtrl.selectedItemProxy.item.id})
    };

    /****** Version Control View Functions */

    /* Called when the user changes views of the tree */
    treeCtrl.onViewTypeChanged = function()
    {
        console.log(treeCtrl.viewType);
        switch (treeCtrl.viewType)
            {
            case "Version Control":
                treeCtrl.filter.status = true;
                treeCtrl.filter.dirty = false;
                treeCtrl.versionControlEnabled = true;
                treeCtrl.selectedVersionControlNodes = new Set();
                treeCtrl.expandFiltered()
                break;
            default : 
                treeCtrl.filter.status = false;
                treeCtrl.filter.dirty = false;
                treeCtrl.versionControlEnabled = false;
            }
            
    }

    treeCtrl.stageItem = function(itemProxy)
        { 
        VersionControlService.stageItems([itemProxy]);
        }

    treeCtrl.unstageItem = function (itemProxy) 
        {
        VersionControlService.unstageItems([itemProxy]);
        }

    
    function showDiscardModal(itemProxy, options){
        var modalOptions = {
            closeButtonText : 'Cancel',
            actionButtonText : 'Discard Item',
            headerText: '"' + itemProxy.item.name + '" is a new item. ',
            bodyText: 'Reverting this to the last commit will delete it permanently. Are you sure you want to discard this item?'
        }    

        ModalService.showModal({}, modalOptions).then((result)=>
            {
            ItemRepository
            .deleteItem(itemProxy).then((result)=> 
                {
                console.log("::: Item has been deleted: " + result.itemId);
                });
            })
        };

    treeCtrl.revertItem = function (itemProxy) {

        if (itemProxy.vcState.Staged)
            {
            if (itemProxy.vcState.Staged === "New")
                {
                showDiscardModal(itemProxy);
                return;
                }
            }
        if (itemProxy.vcState.Unstaged)
            {
            if (itemProxy.vcState.Unstaged ==="New")
                {
                showDiscardModal(itemProxy);
                return;
                }
            }

        var modalOptions = {
            closeButtonText : 'Cancel',
            actionButtonText : 'Discard Changes',
            headerText: 'Discard Changes',
            bodyText: 'Reverting this to the last commit will delete any new changes. Are you sure?'
        }    

        ModalService.showModal({}, modalOptions).then((result)=>
            {
                VersionControlService.revertItems([itemProxy]);
            })
         
        
        
    };
        


    treeCtrl.commit = function()
        {
        if (!treeCtrl.commitMessage)
            treeCtrl.commitMessage = "No Message Entered"

            console.log(treeCtrl.selectedVersionControlNodes);

        // Need to grab all of the indexed nodes
        VersionControlService.commitItems(treeCtrl.selectedVersionControlNodes,
                                          treeCtrl.commitMessage);
        }

    /****** End Version Control View Functions */

}

export default () => {
    angular.module('app.tree', ['app.services.itemservice',
                                'app.services.actionservice',
                                'app.services.userservice',
                                'app.services.searchservice',
                                'app.services.tabservice', 
                                'app.services.versioncontrolservice',
                                'app.services.modalservice'])
        .controller('KTreeController', KTreeController);
}
