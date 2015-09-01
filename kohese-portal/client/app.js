'use strict';

require('./components/components')();

const appModule = angular.module('app', [
    'app.contentcontainer',
    'app.detailsview',
    'app.tree',
    'app.services.itemservice',
    'app.services.tabservice',
    'app.directives.navigation',
    'app.directives.resizer',
    'app.directives.resizeable',
    'lbServices',
    require('angular-ui-router'),
    'ui.bootstrap',
    'btford.socket-io'

]);


appModule.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('kohese', {
            url: '',
            templateUrl: '/components/contentcontainer/contentcontainer.html',
            abstract: true
        })
        .state('kohese.explore', {
            url: '/explore',
            views: {
                'top': {
                    templateUrl: '/components/tree/tree.html',
                    controller: 'TreeController as treeCtrl'
                },
                'bottom': {
                    templateUrl: '/components/detailsview/detailsview.html',
                    controller: 'DetailsViewController as detailsCtrl'
                }

            }
        })
        .state('kohese.explore.edit', {
            url: '/edit/{id}',
            views: {
                'bottom@kohese': {
                    templateUrl: '/components/detailsview/detailsview.html',
                    controller: 'DetailsViewController as detailsCtrl'
                }
            }
        })
        .state('kohese.explore.create', {
            url: '/create/{id}',
            views: {
                'bottom@kohese': {
                    templateUrl: '/components/detailsview/subviews/createitem.html',
                    controller: 'DetailsViewController as detailsCtrl'
                }
            }
        })
        .state('kohese.investigate', {
            url: '/investigate/{id}',
            templateUrl: '/components/detailsview/detailsview.html',
            controller: 'DetailsViewController as detailsCtrl'
        });

    $urlRouterProvider.otherwise('/explore')
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
