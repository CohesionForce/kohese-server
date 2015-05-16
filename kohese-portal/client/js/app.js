'use strict';

angular
  .module('app', [
    'lbServices',
    'ui.router'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider,
      $urlRouterProvider) {

    $stateProvider
      .state('items', {
        url: '/',
        templateUrl: 'js/item/templates/item.html',
        controller: 'ItemController'
      });
    $stateProvider    
      .state('newItem', {
//        parent: 'items',
    	url: '/newItem',
        templateUrl: 'js/item/templates/itemDetail.html',
        controller: 'ItemEditController'
      });
    $stateProvider    
      .state('editItem', {
//        parent: 'items',
        url: '/editItem/:itemId',
        templateUrl: 'js/item/templates/itemDetail.html',
        controller: 'ItemEditController'
      });

    $urlRouterProvider
      .otherwise('/');
  }]);