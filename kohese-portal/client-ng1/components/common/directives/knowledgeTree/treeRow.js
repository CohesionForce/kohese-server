/**
 * 
 */

function TreeRow($compile) {
  return {
    restrict: 'E',
    scope: {
      proxyCollection: '=',
      treeCtrl: '='
    },
    templateUrl: 'components/common/directives/knowledgeTree/treeRow.html',
    compile: function(tElement, tAttr) {
      var contents = tElement.contents().remove();
      var compiledContents;
      return function(scope, iElement, iAttr) {
        if(!compiledContents) {
          compiledContents = $compile(contents);
        }
        iElement.append(
          compiledContents(scope, 
            function(clone) {
              return clone; 
            }));
      };
    }
  };
}

export default () => {
  angular.module('app.directives.treerow', ['RecursionHelper'])
    .directive('treeRow', TreeRow);
}