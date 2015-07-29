angular.module('app.singleview', ['ngNewRouter'])
    .controller('SingleviewController', SingleviewController)

function SingleviewController($router) {
    $router.config([
        {path: '/details', component: {view: 'detailsview'}}
    ]);
}