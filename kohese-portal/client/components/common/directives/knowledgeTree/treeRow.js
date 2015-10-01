/**
 * 
 */

export default () => {
  angular.module('app.directives.treerow', ['RecursionHelper'])
  .directive('treeRow', function (RecursionHelper) {
    return {restrict: 'E',
            scope: {
              itemProxy: '=',
              treeCtrl: '='
            },
            templateUrl: 'components/common/directives/knowledgeTree/treeRow.html',
            compile: function(element) {
              return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){
//                console.log("compile: " + scope.itemProxy.item.name + ' ' + Date.now()/1000);
                // Define your normal link function here.
                // Alternative: instead of passing a function,
                // you can also pass an object with 
                // a 'pre'- and 'post'-link function.
            })}
    };
  });
}