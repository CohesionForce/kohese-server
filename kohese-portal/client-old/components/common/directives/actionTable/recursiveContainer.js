/* Recursive container for a nested action table */

function RecursiveContainerController($scope) {
  var ctrl = this;

  // Copy scope variables for better formatting in html
  ctrl.proxies = $scope.proxies;
  ctrl.fields = $scope.fields;

  ctrl.indention = $scope.indention++; // Increment since we've gone one level deeper
}


function RecursiveContainer() {
  return {
    restrict: 'E',
    scope: {
      proxies: '=',
      fields: '=',
      indention: '='
    },
    templateUrl: 'components/common/directives/actionTable/actionRow.html',
    controller: RecursiveContainerController
  }
}

export default () => {
  angular.module('app.directives.recursiveContainer', [])
    .directive('recursiveContainer', RecursiveContainer)
    .controller('RecursiveContainerController', ['$scope', RecursiveContainerController]);
}