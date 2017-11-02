function ChunkViewController($scope, $timeout, tabService, analysisService){
    const ctrl = this;
    var currentTab = tabService.getCurrentTab();

    // Bundler Logic 
    var controllerRestored = tabService.restoreControllerData(currentTab.id, 'ChunkViewController', this);
    
    if(!controllerRestored) {
        // Initialization Block
        ctrl.itemProxy = $scope.itemProxy;
    
        ctrl.analysisChunkLimit = 100;
        ctrl.analysisSumarrySortField = ['text', '-count'];

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
        console.log(ctrl.itemProxy);
    }

    ctrl.getChunkCount = function() {
        return 5;
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