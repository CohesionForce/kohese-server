function DocumentController ($scope, $sce, $stateParams, tabService) {
  var docCtrl = this;

  var reader = new commonmark.Parser();
  var writer = new commonmark.HtmlRenderer();
  var docReader = new commonmark.Parser();
  var docWriter = new commonmark.HtmlRenderer();
  var currentTab = tabService.getCurrentTab();
  var controllerRestored = tabService.restoreControllerData(currentTab.id, 'DocumentController', this);
  //Exposed 

  //Init block
  if (!controllerRestored) {
    docCtrl.itemProxy = $scope.itemProxy;
    docCtrl.showChildren = $scope.showChildren;
  }

  console.log($scope);

  $scope.$on('tabSelected', function () {
    tabService.bundleController(docCtrl, 'DocumentController', currentTab.id);
  });

  if ($scope.itemProxy) {
    generateDoc();
  }

  $scope.$on('Show Children Toggled', (event, showChildren) => {
    docCtrl.showChildren = showChildren;
    docCtrl.docRendered = null;
    docCtrl.itemDescriptionRendered = null;
    if ($scope.itemProxy) {
      generateDoc();
    }
  })

  $scope.$on('Proxy Description Updated', (event, itemProxy)=>{
    {
      docCtrl.itemProxy = itemProxy;
      generateDoc();
    }
  })

  function generateDoc () {
    if (docCtrl.showChildren) {
      var docParsed = docReader.parse(docCtrl.itemProxy.getDocument());
      docCtrl.docRendered = docWriter.render(docParsed);
      docCtrl.docRendered = $sce.trustAsHtml(docCtrl.docRendered);
    } else if (docCtrl.itemProxy.item.description) {
      var parsed = reader.parse(docCtrl.itemProxy.item.description); // parsed is a 'Node' tree   
      docCtrl.itemDescriptionRendered = writer.render(parsed); // result is a String 
      docCtrl.itemDescriptionRendered = $sce.trustAsHtml(docCtrl.itemDescriptionRendered);
    }
  }
}

function DocumentDirective () {
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
  angular.module('app.directives.documentview', [])
    .controller('DocumentController', DocumentController)
    .directive('documentView', DocumentDirective);
}