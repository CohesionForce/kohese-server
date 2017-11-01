function DocumentController($scope, $sce, $stateParams, tabService){
    var docCtrl = this;

    var reader = new commonmark.Parser();
    var writer = new commonmark.HtmlRenderer();
    var docReader = new commonmark.Parser();
    var docWriter = new commonmark.HtmlRenderer();
    var currentTab = tabService.getCurrentTab();
    var controllerRestored = tabService.restoreControllerData(currentTab.id, 'DocumentController', this); 
    //Exposed 

    //Init block
    if (!controllerRestored){
        docCtrl.itemProxy = $scope.itemProxy;
    }
  

    $scope.$on('tabSelected', function () {
        tabService.bundleController(docCtrl, 'DocumentController', currentTab.id);
    });

    if($scope.showChildren && $scope.itemProxy){
        generateDoc();     
      }

    function generateDoc(){
        var docParsed = docReader.parse(docCtrl.itemProxy.getDocument());
        docCtrl.docRendered = docWriter.render(docParsed);
        docCtrl.docRendered = $sce.trustAsHtml(docCtrl.docRendered);
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
        templateUrl: 'components/common/directives/document-view/document-view.html'
    }
}

export default () => {
    angular.module('app.directives.documentview',[])
        .controller('DocumentController', DocumentController)
        .directive('documentView', DocumentDirective);
}