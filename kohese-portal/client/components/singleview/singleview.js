angular.module('app.singleview', ['ngNewRouter'])
    .controller('SingleviewController', SingleviewController)
    .directive('singleView', function(){
        return {
            controller: "SingleviewController",
            restrict: "A",
            templateUrl: 'components/singleview/singleview.html',
            replace: true,
            link: function (scope, element, attribute) {
                console.log("Single View is linked")
            }
        };
    });

function SingleviewController($router) {
    //$router.config([
    //    {path: '/details', component: {view: 'detailsview'}}
    //]);
}