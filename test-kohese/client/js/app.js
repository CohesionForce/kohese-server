'use strict';

angular
  .module('app', [
    'lbServices',
    'ui.router'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider,
      $urlRouterProvider) {
    $stateProvider
      .state('item', {
        url: '',
        templateUrl: 'js/item/templates/item.html',
        controller: 'ItemCtrl'
      });
    $urlRouterProvider.otherwise('item');
  }]);