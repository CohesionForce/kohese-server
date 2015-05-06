'use strict';

angular
  .module('app', [
    'lbServices',
    'ui.router'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider,
      $urlRouterProvider) {

    $stateProvider
      .state('listItems', {
        url: '/',
        templateUrl: 'js/item/templates/item.html',
        controller: 'ItemCtrl'
      })
      .state('newItem', {
        url: '/newItem',
        templateUrl: 'js/item/templates/itemDetail.html',
        controller: 'ItemCtrl'
      })
      .state('editItem', {
        url: '/editItem',
        templateUrl: 'js/item/templates/itemDetail.html',
        controller: 'ItemCtrl'
      });

    $urlRouterProvider
//      .when('/', { controller: ItemCtrl, templateUrl: 'js/item/templates/item.html' })
//      .when('/newItem', { controller: ItemCtrl, templateUrl: 'js/item/templates/itemDetail.html' })
//      .when('/editItem', { controller: ItemCtrl, templateUrl: 'js/item/templates/itemDetail.html' })
      .otherwise('/');
  }]);