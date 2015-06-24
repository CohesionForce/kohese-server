'use strict';

angular
  .module('app', [
    'lbServices',
    'itemServices',
    'ui.router',
    'ui.layout',
    'ui.bootstrap',
    'btford.socket-io',
    'nav-directives',
    'mc.resizer'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider,
      $urlRouterProvider) {

    $stateProvider
      .state('items', {
        url: '/',
        views: {
        	"list@": {
                templateUrl: 'js/item/templates/itemTree.html',
                controller: 'ItemController'
        	}
        }
      });
    $stateProvider
      .state('newItem', {
        parent: 'items',
    	url: '/newItem?parentId',
        views: {
        	"detail@": {
                templateUrl: 'js/item/templates/itemDetail.html',
                controller: 'ItemEditController'
        	}
        }
      });
    $stateProvider
      .state('editItem', {
        parent: 'items',
        url: '/editItem',
        views: {
        	"detail@": {
                templateUrl: 'js/item/templates/itemDetail.html',
                controller: 'ItemEditController'
        	}
        }
      });

    $urlRouterProvider
      .otherwise('/');
  }])
    .filter('highlight', function($sce) {
    return function(text, phrase) {
      if(text !== null){
          if (phrase) text = text.replace(new RegExp('('+phrase+')', 'gi'),
          '<span class="highlighted">$1</span>');
      }

      return $sce.trustAsHtml(text);
    }
  })
  .factory('socket', function (socketFactory) {
    return socketFactory();
  });
