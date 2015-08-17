/**
 * Created by josh on 7/28/15.
 *
 * Component specific directive
 */

angular.module('app.contentcontainer')
    .directive('dualView', function(){
        return {
            restrict: "A",
            templateUrl: 'components/contentcontainer/subviews/dualview/dualview.html',
            replace: true,
            link: function (scope, element, attribute) {
                console.log("Dual View is linked")
            }
        };
    });
