function SentenceViewController($scope, $timeout, tabService, analysisService){
    const ctrl = this;
    var currentTab = tabService.getCurrentTab();

    // Bundler Logic 
    var controllerRestored = tabService.restoreControllerData(currentTab.id, 'SentenceViewController', this);
    
    if(!controllerRestored) {
        // Initialization Block
        ctrl.itemProxy = $scope.itemProxy;

        ctrl.analysisSummarySortField = ['-count', 'text'];
        ctrl.loadLimit = 100;

        ctrl.analysisFilterPOS = analysisService.filterPOS;
        ctrl.analysisPOSFilterCriteria = analysisService.posFilterCriteria;
        ctrl.analysisPOSFilterCriteriaList = Object.keys(analysisService.posFilterCriteria);
        ctrl.analysisPOSFilterName = "Standard";

        ctrl.filterString = "";
        ctrl.filterTextTimeout;
        ctrl.filterList = []

        ctrl.analysisFilterString = "";
        ctrl.analysisFilterRegex = null;
    }

    $scope.$on('tabSelected', function () {
        tabService.bundleController(ctrl, 'SentenceViewController', currentTab.id);
    });

    $scope.$on('newAnalysisFilter', (event, filter)=>{
        ctrl.analysisFilterString = filter;
        onFilterChange();
    })

    ctrl.filterDetails = function(listItem) {
        return ((listItem.displayLevel == 1) && 
                ((ctrl.analysisFilterRegex === null) || 
                 (ctrl.analysisFilterRegex.test(listItem.item.name)) || 
                 (ctrl.analysisFilterRegex.test(listItem.item.description)))) || 
               (((listItem.displayLevel == 2) && ctrl.showSentencesInDetails) || 
                ((listItem.displayLevel == 3) && ctrl.showChunksInDetails) || 
                ((listItem.displayLevel == 4) && ctrl.showTokensInDetails)
                ) &&
                ((ctrl.analysisFilterRegex === null) || ctrl.analysisFilterRegex.test(listItem.text));
    };

    ctrl.getDetailsItemCount = function () {
        return $('#theDetailsBody').find("tr").length;
      };

    function onFilterChange() {
        console.log(">>> Filter string changed to: " + ctrl.analysisFilterString);
        if (ctrl.filterTextTimeout) {
          $timeout.cancel(ctrl.filterTextTimeout);
        }
        
        ctrl.filterTextTimeout = $timeout(function() {
          var regexFilter = /^\/(.*)\/([gimy]*)$/;
          var filterIsRegex = ctrl.analysisFilterString.match(regexFilter);
  
          if (filterIsRegex) {
            try {
              ctrl.analysisFilterRegex = new RegExp(filterIsRegex[1],filterIsRegex[2]);
              ctrl.analysisFilterRegexHighlight = new RegExp('(' + filterIsRegex[1] + ')','g' + filterIsRegex[2]);
              ctrl.invalidAnalysisFilterRegex = false;              
            } catch (e) {
              ctrl.invalidAnalysisFilterRegex = true;
            }
          } else 
                {
                let cleanedPhrase = ctrl.analysisFilterString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                if(ctrl.analysisFilterString !== ""){
                    ctrl.analysisFilterRegex = new RegExp(cleanedPhrase,"i");
                    ctrl.analysisFilterRegexHighlight = new RegExp('(' + cleanedPhrase + ')',"gi");
                    ctrl.invalidAnalysisFilterRegex = false;
                } else {
                    ctrl.analysisFilterRegex = null;
                    ctrl.analysisFilterRegexHighlight = null;
                    ctrl.invalidAnalysisFilterRegex = false;
                }
            }
        });
}
}

function SentenceViewDirective(){
    return {
        restrict: 'E',
        controller: 'SentenceViewController as svCtrl',
        scope: {
            itemProxy: '='
        },
        templateUrl: 'components/common/directives/analysis-directives/sentence-view.html'
    }
}

export default () =>{
    angular.module('app.directives.sentenceview', ['app.services.tabservice'])
        .directive('sentenceView', SentenceViewDirective)
        .controller('SentenceViewController', SentenceViewController);
}