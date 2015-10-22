'use strict';

require('./components/components.config')();

const appModule = angular.module('app', [
    'app.contentcontainer',
    'app.detailsview',
    'app.tree',
    'app.admin',
    'app.login',
    'app.navigationmenu',
    'app.search',
    'app.services.itemservice',
    'app.services.decisionservice',
    'app.services.actionservice',
    'app.services.categoryservice',
    'app.services.issueservice',
    'app.services.observationservice',
    'app.services.userservice',
    'app.services.tabservice',
    'app.services.authentication',
    'app.services.analysisservice',
    'app.services.searchservice',
    'app.directives.navigation',
    'app.directives.resizer',
    'app.directives.resizeable',
    'app.directives.treerow',
    'lbServices',
    require('angular-ui-router'),
    'angular-jwt',
    'ui.bootstrap',
    'btford.socket-io',
    'RecursionHelper',
    'angucomplete-alt'

]);


appModule
    .constant('API_URL', '')
    .config(function ($httpProvider, $stateProvider, $urlRouterProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: '/components/login/login.html',
                controller: 'LoginController as loginCtrl'
            })
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
                url: '/create/{parentId}',
                views: {
                    'bottom@kohese': {
                        templateUrl: '/components/detailsview/subviews/createitem.html',
                        controller: 'DetailsViewController as detailsCtrl'
                    }
                }
            })
            .state('kohese.search', {
                url: '/search/{filter}',
                views: {
                    top: {
                        templateUrl: '/components/search/search.html',
                        controller: 'SearchController as searchCtrl'
                    },
                    'bottom': {
                        templateUrl: '/components/detailsview/detailsview.html',
                        controller: 'DetailsViewController as detailsCtrl'
                    }
                }
            })
            .state('kohese.search.edit', {
                url: '/edit/{id}',
                views: {
                    'bottom@kohese': {
                        templateUrl: '/components/detailsview/detailsview.html',
                        controller: 'DetailsViewController as detailsCtrl'
                    }
                }
            })
            .state('kohese.investigate', {
                url: '/investigate/{id}',
                templateUrl: '/components/detailsview/detailsview.html',
                controller: 'DetailsViewController as detailsCtrl'
            })
            .state('kohese.admin', {
                url: '/admin',
                templateUrl: '/components/admin/admin.html',
                controller: 'AdminController as adminCtrl'
            })
            .state('kohese.admin.actions', {
                url: '/actions',
                templateUrl: 'components/admin/subviews/actions.html',
                controller: 'AdminController as adminCtrl'
            })
            .state('kohese.admin.groups', {
                url: '/groups',
                templateUrl: 'components/admin/subviews/groups.html',
                controller: 'AdminController as adminCtrl'
            })
            .state('kohese.admin.repository', {
                url: '/repository',
                templateUrl: 'components/admin/subviews/repository.html',
                controller: 'AdminController as adminCtrl'
            })
            .state('kohese.admin.users', {
                url: '/users',
                templateUrl: 'components/admin/subviews/users.html',
                controller: 'AdminController as adminCtrl'
            });

        $urlRouterProvider.otherwise('/explore')
    })
    .filter('highlight', function ($sce) {
        return function (text, phrase) {
            if (text && angular.isDefined(phrase) && phrase !== "") {
                let cleanedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                if (cleanedPhrase) text = text.replace(new RegExp('(' + cleanedPhrase + ')', 'gi'),
                    '<span class="highlighted">$1</span>');
            }

            return $sce.trustAsHtml(text);
        }
    })
    .filter('categories', function () {
        return function (input) {
            var categories = []
            if (input) {
                for (var index = 0; index < input.length; index++){
                    if(input[index].kind === 'Category'){
                        categories.push(input[index])
                    }
                }
                return categories;
            }
        }
    })
    .factory('socket', function (socketFactory) {
        return socketFactory();
    });
