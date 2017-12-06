/**
 * Created by josh on 9/1/15.
 */

function NavigationController ($rootScope, $scope, AuthTokenFactory, tabService) {
  var ctrl = this;
  ctrl.userLoggedIn = AuthTokenFactory.getToken() !== null;

  ctrl.searchInput = '';

  ctrl.search = function (searchString) {
    $rootScope.$broadcast('navigationEvent', {
      state: 'kohese.search',
      params: {
        filter: searchString
      },
      type: 'dualview'
    });
    ctrl.toggleSideBar();
  };

  ctrl.toggleSideBar = function () {
    $('.side-pane').toggleClass('open')
  };

  $scope.$on('userLoggedIn', function onUserLogin () {
    ctrl.userLoggedIn = true;
  });

  $scope.$on('userLoggedOut', function onUserLogout () {
    ctrl.userLoggedIn = false;
  })
}
var sideNavDirective = function () {
  return {
    restrict: 'EA',
    templateUrl: 'components/navigationmenu/navigation.html'
  }
};

export const NavigationMenuModule = {
  init: function () {
    angular.module('app.navigationmenu', [ 'app.services.tabservice'])
      .directive('sideNav', sideNavDirective)
      .controller('NavigationController', NavigationController);
  }
}
