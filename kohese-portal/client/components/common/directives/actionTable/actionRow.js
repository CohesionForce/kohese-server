/*
**   Directive used to insert a row into the action table with the appropriate level of 
**   indention. Receives a passed in proxy, field list, and indention level. Will render
**   its children proxies throught directive recursion.
**  
**   Created by Josh Phillips
*/

function ActionRowController ($scope) {
  // Copy the scope variables
  var ctrl = this;
  ctrl.proxy = $scope.proxy;
  ctrl.fields = $scope.fields;
  ctrl.indention = $scope.indention;
}

function ActionRow($compile, RecursionHelper) {
  return {
    restrict: 'EA',
    scope: {
      proxy: '=',
      fields: '=',
      indention: '='
    },
    templateUrl: 'components/common/directives/actionTable/actionRow.html',
    controller: ActionRowController    
    // compile: function(tElement, tAttr) {
    //   var contents = tElement.contents().remove();
    //   var compiledContents;
    //   return function(scope, iElement, iAttr) {
    //       if(!compiledContents) {
    //           compiledContents = $compile(contents);
    //       }
    //       iElement.append(
    //           compiledContents(scope, 
    //                            function(clone) {
    //                                return clone; }));
    //       };
  }
}




export default () => {
  angular.module('app.directives.actionrow', [])
    .directive('actionRow', ActionRow)
    .controller('ActionRowController', ActionRowController);
}