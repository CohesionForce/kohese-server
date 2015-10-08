/**
 * 
 */

function TreeRow(RecursionHelper, $compile) {
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
//              console.log("::: Before compile " + Date.now()/1000);
              if(!compiledContents) {
                  compiledContents = $compile(contents);
              }
//              console.log("::: After compile " + Date.now()/1000);
              iElement.append(
                  compiledContents(scope, 
                                   function(clone) {
                    if(iElement.parent().hasClass("kt-body")){
//                      console.log("::: parent is kt-body");
                    }
//                    console.log("::: In clone " + Date.now()/1000);
                                       scope.treeCtrl.lastClone=Date.now()/1000;
                                       return clone; }));
              };
        }
//            return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){
////                console.log("compile: " + scope.itemProxy.item.name + ' ' + Date.now()/1000);
//                // Define your normal link function here.
//                // Alternative: instead of passing a function,
//                // you can also pass an object with
//                // a 'pre'- and 'post'-link function.
//            })}
    };
}

export default () => {
  angular.module('app.directives.treerow', ['RecursionHelper'])
  .directive('treeRow', TreeRow);
}