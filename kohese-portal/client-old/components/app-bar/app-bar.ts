// import { Component, OnInit } from '@angular/core';



// @Component({
//   selector: 'app-bar',
//   templateUrl: './app-bar.html'
// })

// export class AppBarComponent implements OnInit {
//   private repositorySynced: boolean;
//   private repositorySyncing: boolean;
//   private repositorySyncFailed: boolean;


//   constructor() {

//   }

//   ngOnInit() {

//   }

//   checkAuthentication() {

//   }
// }

// /*
// function AppBarController ($rootScope, UserService, LoginService, $state, jwtHelper, AuthTokenFactory) {
//   var ctrl = this;
//   ctrl.userName = '';
//   ctrl.repositorySynced = false;
//   checkAuthentication();
//   ctrl.userName = UserService.getCurrentUsername();

//   ctrl.navigate = function (state, params) {
//     $rootScope.$broadcast('navigationEvent',
//       {
//         state: state,
//         params: params
//       });
//   };

//   ctrl.logout = function () {
//     LoginService.logout();
//     ctrl.onLoginScreen = true;
//     ctrl.userLoggedIn = null;
//   };

//   $rootScope.$on('userLoggedIn', function () {
//     checkAuthentication();
//   });

//   $rootScope.$on('userLoaded', function () {
//     ctrl.userName = UserService.getCurrentUsername();
//   });

//   $rootScope.$on('syncingRepository', function () {
//     ctrl.repositorySyncing = true;
//     ctrl.repositorySyncFailed = false;
//   });

//   $rootScope.$on('syncRepositoryFailed', function () {
//     ctrl.repositorySyncing = false;
//     ctrl.repositorySynced = false;
//     ctrl.repositorySyncFailed = true;
//   })

//   $rootScope.$on('itemRepositoryReady', function () {
//     ctrl.repositorySyncing = false;
//     ctrl.repositorySynced = true;
//     ctrl.repositorySyncFailed = false;
//   });

//   $rootScope.$on('serverDisconnected', function () {
//     ctrl.repositorySynced = false;
//   });

//   function checkAuthentication () {
//     ctrl.userLoggedIn = LoginService.checkLoginStatus();
//     if (!ctrl.userLoggedIn) {
//       $state.go('login');
//       ctrl.onLoginScreen = true;
//     } else {
//       ctrl.onLoginScreen = false;
//       ctrl.userName = jwtHelper.decodeToken(AuthTokenFactory.getToken()).username;
//     }
//   }
// }
// */
