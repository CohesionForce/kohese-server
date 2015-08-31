/**
 * Created by josh on 7/28/15.
 *
 * Component specific directive
 */


export default containerModule => {

   containerModule
        .directive('singleView', function () {
            return {
                restrict: "A",
                templateUrl: 'components/contentcontainer/subviews/singleview/singleview.html',
                replace: true,
                link: function (scope, element, attribute) {
                    //console.log("Single View is linked")
                }
            };
        });
}

