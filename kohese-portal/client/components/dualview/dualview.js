/**
 * Created by josh on 7/28/15.
 */

angular.module('app.dualview', ['ngNewRouter'])
    .controller('DualviewController', DualviewController)
    .directive('dualView', function(){
        return {
            controller: "DualviewController",
            restrict: "A",
            templateUrl: 'components/dualview/dualview.html',
            replace: true,
            link: function (scope, element, attribute) {
                console.log("Dual View is linked")
            }
        };
    });


function DualviewController() {

    // Nested routing code - bugged till router release
    //$router.config([
    //    {path:'/',           redirectTo: '/tree'},
    //    {path:'/tree',       components: {top:'tree', bottom:'detailsview'}}
    //]);
}
