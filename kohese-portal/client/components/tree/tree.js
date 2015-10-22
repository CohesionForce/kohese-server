/**
 * Created by josh on 7/13/15.
 */

function TreeController(Item, ItemRepository, ActionService, UserService, $timeout, $anchorScroll, $scope, $location, $window, tabService) {

    var treeCtrl = this,
        syncListener;

    treeCtrl.filterString = "";
    treeCtrl.kindFilter = "";
    treeCtrl.actionStateFilter = "";
    treeCtrl.actionAssigneeFilter = "";
    treeCtrl.kindList = ItemRepository.modelTypes;
    treeCtrl.actionStates = {};
    treeCtrl.userList = {};

    treeCtrl.collapsed = {};
    treeCtrl.tab = tabService.getCurrentTab();
    treeCtrl.locationSynced = false;
    treeCtrl.currentLazyItemIdx = 0;
    var lazyLimitIncrement = 20;
    treeCtrl.currentLazyLimit = lazyLimitIncrement;
    var lazyLimitIncreasePending = false;
    
    $scope.$on('itemRepositoryReady', function () {
      treeCtrl.actionStates = ActionService.getActionStates();
      treeCtrl.userList = UserService.getAllUsers();
  });

    $scope.$watch('treeCtrl.filterString', function(){
      postDigest(function(){
        // Force one more update cycle to get the match count to display
        $scope.$apply();        
      });
    });
    
    $scope.$watch('treeCtrl.kindFilter', function(){
      postDigest(function(){
        // Force one more update cycle to get the match count to display
        $scope.$apply();        
      });
    });
    
    $scope.$watch('treeCtrl.actionStateFilter', function(){
      postDigest(function(){
        // Force one more update cycle to get the match count to display
        $scope.$apply();        
      });
    });
    
    $scope.$watch('treeCtrl.actionAssigneeFilter', function(){
      postDigest(function(){
        // Force one more update cycle to get the match count to display
        $scope.$apply();        
      });
    });
    
    treeCtrl.allocateLazyItemIdx = function() {
      var idx = treeCtrl.currentLazyItemIdx;
      treeCtrl.currentLazyItemIdx++;

      if(!lazyLimitIncreasePending){
        // New nodes added, need to increase the limit to force a new digest cycle
        // to load more items if they are available
        lazyLimitIncreasePending = true;
        postDigest(function(){
          treeCtrl.currentLazyLimit = treeCtrl.currentLazyItemIdx + lazyLimitIncrement;          
//          console.log("::: Increased lazy limit to " + treeCtrl.currentLazyLimit);
          lazyLimitIncreasePending = false;
          $scope.$apply();
        });
      }
      
      return idx;
    }
    
    function postDigest(callback){    
      var unregister = $scope.$watch(function(){
//        console.log("::: postDigest at " + treeCtrl.currentLazyItemIdx);
        unregister();
        $timeout(function(){
          callback();
        },0,false);       
      });
    }

    treeCtrl.getItemCount = function (){
      return $('#theKT').find(".kt-item").length;
    }
        
    treeCtrl.getItemMatchedCount = function (){
      return $('#theKT').find(".kti-filterMatched").length;
    }

    function getTypeForFilter(val) {
      return (val === null) ? 'null' : typeof val;
    }

    treeCtrl.matchesFilter = function (proxy){
      if (!treeCtrl.filterString && !treeCtrl.kindFilter) {
        return true;
      } else {
        if(treeCtrl.kindFilter){
          if (proxy.kind !== treeCtrl.kindFilter){
            return false;
          }
          if (treeCtrl.actionStateFilter && proxy.item.actionState !== treeCtrl.actionStateFilter){
            return false;
          }
          if (treeCtrl.actionAssigneeFilter && proxy.item.assignedTo !== treeCtrl.actionAssigneeFilter){
            return false;
          }
          if (!treeCtrl.filterString){
            return true;
          }
        }
        var lcFilter = treeCtrl.filterString.toLowerCase();
        for (var key in proxy.item){
          if((key.charAt(0) !== '$') && getTypeForFilter(proxy.item[key]) === 'string' && proxy.item[key].toLowerCase().indexOf(lcFilter) !== -1){
            return true;
          }
        }
        return false;
      }
    }
    
    treeCtrl.childMatchesFilter = function (proxy){
      for(var childIdx = 0; childIdx < proxy.children.length; childIdx++){
        var childProxy = proxy.children[childIdx];
        if (treeCtrl.matchesFilter(childProxy) || treeCtrl.childMatchesFilter(childProxy)){
          // exit as soon as the first matching descendant is found
          return true;
        }
      }
      // no descendant found
      return false;
    }

    treeCtrl.treeRoot = ItemRepository.getRootProxy();

    treeCtrl.tab.setTitle('Explore');

    $scope.$on('newFilterString', function onNewFilterString(event, string) {
        treeCtrl.filterString = string;
    });

    $scope.$on('tabSelected', function () {
        treeCtrl.tab = tabService.getCurrentTab();
    });

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


    treeCtrl.syncLocation = function () {
        treeCtrl.locationSynced ? treeCtrl.locationSynced = false : treeCtrl.locationSynced = true;
        if (treeCtrl.locationSynced) {
            syncListener = $scope.$on('syncItemLocation', function onNewItemSelectedHandler(event, data) {
                console.log('sync');
                console.log(data);
                $location.hash(data);
                $anchorScroll()
            })
        }
        else
            {
                //Deregisters listener
                syncListener();
            }
        }
        ;

        treeCtrl.expandAll = function () {
          for (var key in treeCtrl.collapsed){
            treeCtrl.collapsed[key] = false;
          }
        };

        treeCtrl.collapseAll = function () {
            for (var key in treeCtrl.collapsed){
              treeCtrl.collapsed[key] = true;
            }
        };

    }

export default () => {
    angular.module('app.tree', ['app.services.tabservice'])
        .controller('TreeController', ['Item', 'ItemRepository', 'ActionService', 'UserService', '$timeout', '$anchorScroll', '$scope', '$location', '$window',
            'tabService',
            TreeController]);
}
