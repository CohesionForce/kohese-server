/**
 * Created by josh on 7/28/15.
 *
 * Component specific directive
 */


var DualViewController = function ($scope, tabService) {

    var dvCtrl = this;
    var tab = tabService.getCurrentTab();
    tab.setScope($scope);

    dvCtrl.resizerID = "resizer" + tabService.getTabId();
    dvCtrl.topID = "top-content" + tabService.getTabId();
    dvCtrl.bottomID = "bottom-content" + tabService.getTabId();

    $scope.$on('newItemSelected', function onNewItemSelected(event, data){
        console.log('newItemSelectedEvent');
        $scope.$broadcast('syncItemLocation', data)
    })
};


export default containerModule => {

    containerModule
        .controller('DualViewController', DualViewController)
        .directive('dualView', function () {
            return {
                restrict: "A",
                templateUrl: 'components/contentcontainer/subviews/dualview/dualview.html',
                replace: true,
                link: function (scope, element, attribute) {
                    //console.log("Dual View is linked")
                }
            };
        });
}
