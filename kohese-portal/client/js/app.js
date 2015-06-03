'use strict';

angular
  .module('app', [
    'lbServices',
    'ui.router',
    'treeGrid'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider,
      $urlRouterProvider) {

    $stateProvider
      .state('items', {
        url: '/',
        templateUrl: 'js/item/templates/itemTree.html',
        controller: 'ItemController'
      });
    $stateProvider    
      .state('newItem', {
//        parent: 'items',
    	url: '/newItem?parentId',
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
  }])
    .filter('highlight', function($sce) {
    return function(text, phrase) {
      if (phrase) text = text.replace(new RegExp('('+phrase+')', 'gi'),
        '<span class="highlighted">$1</span>')

      return $sce.trustAsHtml(text)
    }
  });