'use strict';

require('./components/components.config')();

const appModule = angular.module('app', [
    'app.contentcontainer',
    'app.detailsview',
    'app.tree',
    //'app.tree.modalcontrollers', offline while we figure out modals
    'app.admin',
    'app.login',
    'app.navigationmenu',
    'app.search',
    'app.dashboard',
    'app.create',
    'app.create.import',
    'app.services.itemservice',
    'app.services.decisionservice',
    'app.services.actionservice',
    'app.services.categoryservice',
    'app.services.issueservice',
    'app.services.observationservice',
    'app.services.userservice',
    'app.services.sessionservice',
    'app.services.tabservice',
    'app.services.authentication',
    'app.services.analysisservice',
    'app.services.searchservice',
    'app.services.navigationservice',
    'app.services.versioncontrolservice',
    'app.services.importservice',
    'app.factories.koheseio',
    'app.directives.navigation',
    'app.directives.treerow',
    'app.directives.actiontable',
    require('angular-ui-router'),
    'angular-jwt',
    'ui.bootstrap',
    'btford.socket-io',
    'RecursionHelper',
    'angucomplete-alt',
    'ngAnimate',
    'ng-context-menu',
    'toastr',
    'ui.tree',
    'monospaced.elastic',
    'shagstrom.angular-split-pane',
    'simplemde',
    'ngFileUpload'
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
            .state('kohese.dashboard',{
                url: '/dashboard',
                templateUrl: '/components/dashboard/dashboard.html',
                controller: 'DashboardController as dashCtrl'
            })
            .state('kohese.explore', {
                url: '/explore',
                views: {
                    'left': {
                        templateUrl: '/components/tree/tree.html',
                        controller: 'KTreeController as treeCtrl'
                    },
                    'right': {
                        templateUrl: '/components/detailsview/detailsview.html',
                        controller: 'DetailsViewController as detailsCtrl'
                    }

                }
            })
            .state('kohese.explore.edit', {
                url: '/edit/{id}',
                views: {
                    'right@kohese': {
                        templateUrl: '/components/detailsview/detailsview.html',
                        controller: 'DetailsViewController as detailsCtrl'
                    }
                }
            })
            .state('kohese.explore.create', {
                url: '/create/{parentId}',
                views: {
                    'right@kohese': {
                        templateUrl: '/components/create/createWizard.html',
                        controller: 'CreateWizardController as createCtrl'
                    }
                }
            })
            .state('kohese.explore.create.import', {
                url: 'import/{parentId}',
                views: {
                    'right@kohese': {
                        templateUrl: '/components/create/import/import.html',
                        controller: "ImportItemController as importCtrl"
                    }
                }

            })
            .state('kohese.explore.create.new', {
                url: 'new/{type}/{parentId}',
                views: {
                    'right@kohese': {
                        templateUrl: '/components/detailsview/subviews/createitem.html',
                        controller: 'DetailsViewController as detailsCtrl'
                    }
                }
            })
            .state('kohese.create', {
                url: '/create/{parentId}',
                templateUrl: '/components/create/createWizard.html',
                controller: 'CreateWizardController as createCtrl'
            })
            .state('/kohese.import', {
                url: 'import/{parentId}',
                templateUrl: '/components/create/import/import.html',
                controller: 'ImportController as importCtrl'
            })
            .state('/kohese.new', {
                url: 'new/{type}{parentId}',
                templateUrl: '/components/detailsview/subviews/createitem.html',
                controller: "DetailsViewController as detailsCtrl"
            })
            .state('kohese.search', {
                url: '/search/{filter}',
                views: {
                    'left': {
                        templateUrl: '/components/search/search.html',
                        controller: 'SearchController as searchCtrl'
                    },
                    'right': {
                        templateUrl: '/components/detailsview/detailsview.html',
                        controller: 'DetailsViewController as detailsCtrl'
                    }
                }
            })
            .state('kohese.search.edit', {
                url: '/edit/{id}',
                views: {
                    'right@kohese': {
                        templateUrl: '/components/detailsview/detailsview.html',
                        controller: 'DetailsViewController as detailsCtrl'
                    }
                }
            })
            .state('kohese.search.create', {
                url:'/create/{parentId}',
                views: {
                    'right@kohese': {
                        templateUrl: '/components/create/createwizard.html',
                        controller: 'CreateWizardController as createCtrl'
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
                controller: 'AdminController as adminCtrl',
                abstract: true
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

        $urlRouterProvider.otherwise('/dashboard')
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
    .filter('highlightRegex', function ($sce) {
        return function (text, phrase) {
            if (text && angular.isDefined(phrase)) {
                if (phrase) text = text.replace(phrase,
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
