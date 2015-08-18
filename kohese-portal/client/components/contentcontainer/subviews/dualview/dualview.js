/**
 * Created by josh on 7/28/15.
 *
 * Component specific directive
 */


var DualViewController = function(tabService) {

    var dvCtrl = this;

    dvCtrl.topID = "top-content" + tabService.getTabId();
    dvCtrl.bottomID = "bottom-content" + tabService.getTabId();
    console.log(dvCtrl.topID);
};

angular.module('app.contentcontainer.dualview', ['app.services.tabservice'])
    .controller('DualViewController', DualViewController)
    .directive('dualView', function(){
        return {
            restrict: "A",
            templateUrl: 'components/contentcontainer/subviews/dualview/dualview.html',
            replace: true,
            link: function (scope, element, attribute) {
                //console.log("Dual View is linked")
            }
        };
    });
