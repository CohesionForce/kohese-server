function DocumentController ($scope, $stateParams, tabService, $filter, HighlightService) {
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

  $scope.$on('newAnalysisFilter', (event, filter)=>{
    docCtrl.analysisFilterString = filter;
    onFilterChange();
  })

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
      var docParsed = docReader.parse(docCtrl.itemProxy.getDocument(), {sourcepos: true});
      docCtrl.docRendered = docWriter.render(docParsed);
    } else if (docCtrl.itemProxy.item.description) {
      var parsed = reader.parse(docCtrl.itemProxy.item.description); // parsed is a 'Node' tree   
      docCtrl.itemDescriptionRendered = writer.render(parsed); // result is a String 
    }
  }

  function onFilterChange () {
    console.log('>>> Filter string changed to: ' + docCtrl.analysisFilterString);

    var regexFilter = /^\/(.*)\/([gimy]*)$/;
    var filterIsRegex = docCtrl.analysisFilterString.match(regexFilter);

    if (filterIsRegex) {
      try {
        docCtrl.analysisFilterRegex = new RegExp(filterIsRegex[1], filterIsRegex[2]);
        docCtrl.analysisFilterRegexHighlight = new RegExp('(' + filterIsRegex[1] + ')', 'g' + filterIsRegex[2]);
        docCtrl.invalidAnalysisFilterRegex = false;
      } catch (e) {
        docCtrl.invalidAnalysisFilterRegex = true;
      }
    } else {
      let cleanedPhrase = docCtrl.analysisFilterString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (docCtrl.analysisFilterString !== '') {
        docCtrl.analysisFilterRegex = new RegExp(cleanedPhrase, 'i');
        docCtrl.analysisFilterRegexHighlight = new RegExp('(' + cleanedPhrase + ')', 'gi');
        docCtrl.invalidAnalysisFilterRegex = false;
      } else {
        docCtrl.analysisFilterRegex = null;
        docCtrl.analysisFilterRegexHighlight = null;
        docCtrl.invalidAnalysisFilterRegex = false;
      }
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