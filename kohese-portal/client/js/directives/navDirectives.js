/**
 * Created by josh on 6/17/15.
 */

(function () {

  var app = angular.module('nav-directives', []);
  var appBarDirective = function () {
    return {
      restrict: 'EA',
      templateUrl: 'js/directives/appBar.html'
    }
  };
  var sideNavDirective = function () {
    return {
      restrict: 'EA',
      templateUrl: 'js/directives/navigation.html'
    }
  };
  var collapsingMenuDirective = function () {
    return {
      restrict: 'A',
      link: function (scope, element, attribute) {
        element.metisMenu();
      }
    }
  };

  app
    .directive('appBar', appBarDirective)
    .directive('sideNav', sideNavDirective)
    .directive('collapsingMenu', collapsingMenuDirective);

}());
