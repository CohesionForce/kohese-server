/**
 * Created by josh on 7/13/15.
 */

function TreeController(Item, ItemRepository, $timeout, $anchorScroll, $scope, $location, $window, tabService) {

    var treeCtrl = this,
        syncListener;

    treeCtrl.filterString = "";
    treeCtrl.collapsed = {};
    treeCtrl.tab = tabService.getCurrentTab();
    treeCtrl.locationSynced = false;
    treeCtrl.lastClone = 0;

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
      if (!treeCtrl.filterString) {
        return true;
      } else {
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

    treeCtrl.treeRoot = ItemRepository.getTreeRoot();

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
        .controller('TreeController', ['Item', 'ItemRepository', '$timeout', '$anchorScroll', '$scope', '$location', '$window',
            'tabService',
            TreeController]);
}
