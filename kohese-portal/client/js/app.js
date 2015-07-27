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