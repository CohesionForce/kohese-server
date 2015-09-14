/**
 * Created by josh on 7/13/15.
 */

function TreeController(Item, ItemRepository, $anchorScroll, $scope, $location, tabService) {

    var treeCtrl = this;

    treeCtrl.filterString = "";
    treeCtrl.analysisFilterString = "";
    treeCtrl.hidden = {};
    treeCtrl.collapsed = {};
    treeCtrl.showAsTree = true;
    treeCtrl.tab = tabService.getCurrentTab();

    treeCtrl.newTree = ItemRepository.internalTree;


    $scope.$on('currentItemUpdate', function (event, data) {
        $location.hash(data.id);
        $anchorScroll();
    });

    $scope.$on('newFilterString', function onNewFilterString(event, string) {
            treeCtrl.filterString = string;
    });

    $scope.$on('tabSelected', function () {
        treeCtrl.tab = tabService.getCurrentTab();
    });

    treeCtrl.setTabState = function (state) {
        treeCtrl.tab.setState(state);
    };

    treeCtrl.removeItem = function (item) {
        Item
            .deleteById(item)
            .$promise
            .then(function () {
                console.log("::: Item has been deleted: " + item.id);
            });
    };


    treeCtrl.syncLocation = function () {
        $anchorScroll();
    };

    treeCtrl.expandAll = function () {
        // Set all nodes to expanded
        for (var index in treeCtrl.collapsed) {
            treeCtrl.collapsed[index] = false;
        }
        // Set all nodes to visible
        for (var index in treeCtrl.hidden) {
            treeCtrl.hidden[index] = false;
        }
    };

    treeCtrl.collapseAll = function () {
        // Collapse all root nodes that are current expanded
        for (var index = 0; index < treeCtrl.newTree.roots.length; index++) {
            var rootNode = treeCtrl.newTree.roots[index];
            if (!treeCtrl.collapsed[rootNode.item.id]) {
                treeCtrl.changeVisibilityOn(rootNode);
            }
        }

    };

    treeCtrl.changeVisibilityOn = function (proxy) {
        if (treeCtrl.showAsTree) {
            treeCtrl.collapsed[proxy.item.id] = !treeCtrl.collapsed[proxy.item.id];
            var isNowCollapsed = treeCtrl.collapsed[proxy.item.id];
            var childIdStack = [];
            var childId = "";

            // Add immediate descendants to stack
            for (var index = 0; index < proxy.children.length; index++) {
                childId = proxy.children[index].item.id;
                childIdStack.push(childId);
            }

            while (childId = childIdStack.pop()) {
                if (isNowCollapsed && !treeCtrl.hidden[childId]) {
                    // New state is collapsed
                    treeCtrl.collapsed[childId] = true;
                    proxy = ItemRepository.getItemProxy(childId);
                    for (var index = 0; index < proxy.children.length; index++) {
                        var grandChildId = proxy.children[index].item.id;
                        childIdStack.push(grandChildId);
                    }
                }
                treeCtrl.hidden[childId] = isNowCollapsed;
            }
        }
    };

    treeCtrl.changeVisibility = function () {
        changeVisibilityOn(this.itemProxy);
    }

}

export default () => {
    angular.module('app.tree', ['app.services.tabservice'])
        .controller('TreeController', ['Item', 'ItemRepository', '$anchorScroll', '$scope', '$location',
            'tabService',
            TreeController]);
}
