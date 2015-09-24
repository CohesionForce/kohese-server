/**
 * 
 */

export default () => {
  angular.module('app.directives.treerow', [])
  .directive('treeRow', function ($compile) {
    return {restrict: 'E',
            scope: {
              itemProxy: '=',
              treeCtrl: '='
            },
            templateUrl: 'components/common/directives/knowledgeTree/treeRow.html',
            replace: true,
            link: function(scope, element, attrs){
//              console.log("::: Processing proxy for " + scope.itemProxy.item.name);
//              $compile(element);
            }            
//            compile: function(element) {
//              // Use the compile function from the RecursionHelper,
//              // And return the linking function(s) which it returns
//              return RecursionHelper.compile(element);
//            }
    };
  });
}