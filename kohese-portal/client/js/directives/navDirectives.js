/**
 * Created by josh on 6/17/15.
 */

var app = angular.module('nav-directives', [])

app.directive('appBar', function(){
  return {
    restrict: 'EA',
    templateUrl: 'js/directives/appBar.html'
  }
})

app.directive('sideNav', function(){
  return {
    restrict: 'EA',
    templateUrl: 'js/directives/navigation.html'
  }
})

app.directive('collapsingMenu', function(){
  return {
    restrict: 'A',
    link: function(scope, element, attribute){
      console.log('Metis Menu Link');
      element.metisMenu();
    }
  }
});
