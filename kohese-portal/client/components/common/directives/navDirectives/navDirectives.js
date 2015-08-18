/**
 * Created by josh on 6/17/15.
 */

(function () {

  var app = angular.module('app.directives.navigation', []);
  var appBarDirective = function () {
    return {
      restrict: 'EA',
      templateUrl: 'components/common/directives/navDirectives/appBar.html'
    }
  };
  var sideNavDirective = function () {
    return {
      restrict: 'EA',
      templateUrl: 'components/common/directives/navDirectives/navigation.html'
    }
  };
  var collapsingMenuDirective = function () {
    return {
      restrict: 'A',
      link: function (scope, element, attribute) {
        element.metisMenu();
          //console.log("This is the cm link")
      }
    }
  };

  app
    .directive('appBar', appBarDirective)
    .directive('sideNav', sideNavDirective)
    .directive('collapsingMenu', collapsingMenuDirective);

}());
