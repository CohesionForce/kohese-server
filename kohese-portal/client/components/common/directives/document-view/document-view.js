function DocumentController($scope, $sce){
    var docCtrl = this;
    var reader = new commonmark.Parser();
    var writer = new commonmark.HtmlRenderer();
    var docReader = new commonmark.Parser();
    var docWriter = new commonmark.HtmlRenderer();

    console.log($scope);

    if($scope.showChildren){
        var docParsed = docReader.parse($scope.itemProxy.getDocument());
        docCtrl.docRendered = docWriter.render(docParsed);
        docCtrl.docRendered = $sce.trustAsHtml(docCtrl.docRendered);
        console.log(docCtrl);                
      }
}

function DocumentDirective(){
    return {
        restrict: 'E',
        controller: 'DocumentController as docCtrl',
        scope: {
            itemProxy: '=',
            showChildren: '='
        },
        templateUrl: 'components/common/directives/document-view/document-view.html',
        link: (scope, element, attrs)=>{
            console.log('link');
            console.log(scope);
        }
    }
}

export default () => {
    angular.module('app.directives.documentview',[])
        .controller('DocumentController', DocumentController)
        .directive('documentView', DocumentDirective);
}