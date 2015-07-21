'use strict';

angular
  .module('app', [
    'app.detailsview',
    'app.tree',
    'lbServices',
    'itemServices',
    'ngNewRouter',
    'ui.router',
    'ui.layout',
    'ui.bootstrap',
    'btford.socket-io',
    'nav-directives',
    'mc.resizer'
  ])
  .controller('KoheseController',['$router', KoheseController])
  //.config(['$stateProvider', '$urlRouterProvider', function($stateProvider,
  //    $urlRouterProvider) {
  //
  //  $stateProvider
  //    .state('items', {
  //      url: '/',
  //      views: {
  //      	"list@": {
  //              templateUrl: 'js/item/templates/itemTree.html',
  //              controller: 'ItemController'
  //      	}
  //      }
  //    });
  //  $stateProvider
  //    .state('newItem', {
  //      parent: 'items',
  //  	url: '/newItem?parentId',
  //      views: {
  //      	"detail@": {
  //              templateUrl: 'js/item/templates/itemDetail.html',
  //              controller: 'ItemEditController'
  //      	}
  //      }
  //    });
  //  $stateProvider
  //    .state('editItem', {
  //      parent: 'items',
  //      url: '/editItem',
  //      views: {
  //      	"detail@": {
  //              templateUrl: 'js/item/templates/itemDetail.html',
  //              controller: 'ItemEditController'
  //      	}
  //      }
  //    });
  //
  //  $urlRouterProvider
  //    .otherwise('/');
  //}])
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


function KoheseController($router){
    $router.config([
        {path: '/',         redirectTo:'/home'},
        {path: '/home',     components: { top:'tree' , bottom:'detailsview'}},
        {path: '/editItem', components:{ top:'tree', bottom:'detailsview'}},
        {path: '/newItem',  components:{ top:'tree', bottom:'detailsview'}}
    ])
}