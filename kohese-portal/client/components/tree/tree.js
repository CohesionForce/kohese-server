/**
 * Created by josh on 7/13/15.
 */

function TreeController(Item, ItemRepository, $timeout, $anchorScroll, $scope, $location, tabService) {

    var treeCtrl = this,
        syncListener;

    treeCtrl.filterString = "";
    treeCtrl.collapsed = {};
    treeCtrl.tab = tabService.getCurrentTab();
    treeCtrl.locationSynced = false;

    treeCtrl.newTree = ItemRepository.internalTree;

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
        .controller('TreeController', ['Item', 'ItemRepository', '$timeout', '$anchorScroll', '$scope', '$location',
            'tabService',
            TreeController]);
}
