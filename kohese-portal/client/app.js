'use strict';

angular
    .module('app', [
        'app.contentcontainer',
        'app.contentcontainer.dualview',
        'app.detailsview',
        'app.tree',
        'app.services.itemservice',
        'app.services.tabservice',
        'app.directives.navigation',
        'app.directives.resizer',
        'app.directives.resizeable',
        'lbServices',
        'ui.router',
        'ui.layout',
        'ui.bootstrap',
        'btford.socket-io'

    ])
    .controller('KoheseController',  KoheseController)
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('kohese', {
                url: '',
                templateUrl: '/components/contentcontainer/contentcontainer.html',
                abstract: true
            } )
            .state('kohese.explore', {
                url: '/explore/{id}',
                views: {
                    'top': {
                        templateUrl: '/components/tree/tree.html',
                        controller: 'TreeController'
                    },
                    'bottom': {
                        templateUrl: '/components/detailsview/detailsview.html',
                        controller: 'DetailsViewController'
                    }

                }
            })
            .state('kohese.investigate', {
                    url: '/investigate/{id}',
                    templateUrl: '/components/detailsview/detailsview.html'
                });

        $urlRouterProvider.otherwise('/explore/1')
    })
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


function KoheseController() {
    //$router.config([
    //    {path: '/', redirectTo: '/home/'},
    //    {path: '/home', components: {top: 'tree', bottom: 'detailsview'}},
    //    {path: '/details', component: {view: 'detailsview'}}
    //])
}