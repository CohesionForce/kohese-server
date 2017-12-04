'use strict';

import { Components } from './components/components.config';

Components.init();
console.log(Components);

// Temporary Scaffolding for ng2 upgrade

export const Ng1AppModule = angular.module('app', [
  'app.contentcontainer',
  'app.detailsview',
  'app.tree',
  'app.admin',
  'app.login',
  'app.navigationmenu',
  'app.search',
  'app.dashboard',
  'app.create',
  'app.create.import',
  'app.components.analysis',
  'app.services.itemservice',
  'app.services.decisionservice',
  'app.services.actionservice',
  'app.services.categoryservice',
  'app.services.issueservice',
  'app.services.userservice',
  'app.services.sessionservice',
  'app.services.tabservice',
  'app.services.authentication',
  'app.services.analysisservice',
  'app.services.searchservice',
  'app.services.navigationservice',
  'app.services.versioncontrolservice',
  'app.services.importservice',
  'app.services.modalservice',
  'app.services.highlightservice',
  'app.factories.koheseio',
  'app.directives.navigation',
  'app.directives.treerow',
  'app.directives.actiontable',
  'app.directives.documentview',
  'app.directives.termview',
  'app.directives.sentenceview',
  'app.directives.phraseview',
  'app.directives.kindicon',
  'app.constants.endpoints',
  'app.filters.htmlfilters',
  'app.filters.highlight',
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


Ng1AppModule
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
            controller: 'ImportItemController as importCtrl'
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
        controller: 'DetailsViewController as detailsCtrl'
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
      })
      .state('kohese.analysis', {
        url: '/analysis/{id}',
        templateUrl: 'components/analysis/analysis.html',
        controller: 'AnalysisController as aCtrl'
      });

    $urlRouterProvider.otherwise('/dashboard')
  })
  .filter('categories', function () {
    return function (input) {
      var categories = []
      if (input) {
        for (var index = 0; index < input.length; index++) {
          if(input[index].kind === 'Category') {
            categories.push(input[index])
          }
        }
        return categories;
      }
    }
  })

