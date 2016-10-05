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
    'app.dashboard',
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
    'app.services.navigationservice',
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
    'angucomplete-alt',
    'ngAnimate',
    'ng-context-menu',
    'toastr',
    'monospaced.elastic'

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
            .state('kohese.create', {
                url: '/create/{parentId}',
                templateUrl: '/components/detailsview/subviews/createitem.html',
                controller: 'DetailsViewController as detailsCtrl'
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
            .state('kohese.search.create', {
                url:'/create/{parentId}',
                views: {
                    'bottom@kohese': {
                        templateUrl: '/components/detailsview/subviews/createitem.html',
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
    .factory('KoheseIO', function ($rootScope, socketFactory, AuthTokenFactory) {

      var socket, ioSocket, isAuthenticated,
      self = {
          isInitialized: isInitialized,
          isAuthenticated: isAuthenticated
      };
      
      var isInitialized = false;
      
      // by default the socket property is null and is not authenticated
      self.socket = socket;
      
      // initializer function to connect the socket for the first time after logging in to the app
      self.initialize = function(){
        console.log("+++ Initializing KoheseIO");

        isAuthenticated = false;
        isInitialized = true;

        //call btford angular-socket-io library factory to connect to server at this point
        self.socket = socket = socketFactory({
          ioSocket: ioSocket
        });

        //---------------------
        //these listeners will only be applied once when socket.initialize is called
        //they will be triggered each time the socket connects/re-connects (e.g. when logging out and logging in again)
        //----------------------
        socket.on('authenticated', function () {
          isAuthenticated = true;
          console.log('::: KoheseIO is authenticated');
          $rootScope.$broadcast('KoheseIOConnected');
        });
        //---------------------
        socket.on('connect', function () {
          //send the jwt
          socket.emit('authenticate', {token: AuthTokenFactory.getToken()});
        });
      };
      
      self.connect = function() {
        if (isInitialized){
          console.log("+++ Connecting KoheseIO");
          self.socket.connect();
        } else {
          self.initialize();
        }
      };
      
      self.disconnect = function() {
        console.log("--- Disconnecting KoheseIO");
        if (isInitialized){
          self.socket.disconnect();
          isAuthenticated = false;
        }        
      };
      
      if (AuthTokenFactory.getToken()){
        self.initialize();
      }

      return self;
    });
