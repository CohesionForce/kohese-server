function ChunkViewController($scope, $timeout, tabService, analysisService){
    const ctrl = this;
    var currentTab = tabService.getCurrentTab();

    // Bundler Logic 
    var controllerRestored = tabService.restoreControllerData(currentTab.id, 'ChunkViewController', this);
    
    if(!controllerRestored) {
        // Initialization Block
        ctrl.itemProxy = $scope.itemProxy;
    
        ctrl.loadLimit = 100;
        ctrl.sortField = ['-count', '-text'];
        ctrl.reverse = false;

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
        tabService.bundleController(ctrl, 'ChunkViewController', currentTab.id);
    });

    $scope.$on('newAnalysisFilter', (event, filter)=>{
        ctrl.analysisFilterString = filter;
        onFilterChange();
    })

    ctrl.fetchAnalysis = function () {
        analysisService.fetchAnalysis(ctrl.itemProxy).then(function (results){
          $scope.$apply();
          console.log(ctrl.itemProxy);
        });
      };

    ctrl.filterChunks = function(summary) {
    var MatchesStringFilter;
    var MatchesPOS = ctrl.analysisFilterPOS(summary,
            ctrl.analysisPOSFilterCriteria[ctrl.analysisPOSFilterName]) 
    if (MatchesPOS){
        MatchesStringFilter = 
            ((ctrl.analysisFilterRegex === null) 
            || ctrl.analysisFilterRegex.test(summary.text));
    }
    
        return (MatchesPOS && MatchesStringFilter)
    };

    ctrl.submitSummaryFilter = function(text){
        $scope.$emit('newChunkFilter', text);
    }

    ctrl.getChunkCount = function () {
        return $('#theChunksBody').find("tr").length;
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

    ctrl.newSort = function (term) {
        if (ctrl.sortField === term) {
            ctrl.reverse = !ctrl.reverse;
        } else {
            ctrl.sortField = term;
            ctrl.reverse = false;
        }
    }

    ctrl.fetchAnalysis();
}

function ChunkViewDirective(){
    return {
        restrict: 'E',
        controller: 'ChunkViewController as cvCtrl',
        scope: {
            itemProxy: '='
        },
        templateUrl: 'components/common/directives/analysis-directives/chunk-view.html'
    }
}

export default () =>{
    angular.module('app.directives.chunkview', ['app.services.tabservice'])
        .directive('chunkView', ChunkViewDirective)
        .controller('ChunkViewController', ChunkViewController);
}