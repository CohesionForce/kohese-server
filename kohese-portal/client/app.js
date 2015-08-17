'use strict';

angular
    .module('app', [
        'app.contentcontainer',
        'app.detailsview',
        'app.tree',
        'app.services.itemservice',
        'app.services.tabservice',
        'app.directives.navigation',
        'app.directives.resizer',
        'lbServices',
        'ngNewRouter',
        'ui.layout',
        'ui.bootstrap',
        'btford.socket-io'

    ])
    .controller('KoheseController', ['$router', KoheseController])
    .filter('highlight', function ($sce) {
        return function (text, phrase) {
            if (text !== null) {
                if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
                    '<span class="highlighted">$1</span>');
            }

            return $sce.trustAsHtml(text);
        }
    })
    .factory('socket', function (socketFactory) {
        return socketFactory();
    });


function KoheseController($router) {
    $router.config([
        {path: '/', redirectTo: '/home/'},
        {path: '/home', components: {top: 'tree', bottom: 'detailsview'}},
        {path: '/details', component: {view: 'detailsview'}}
    ])
}