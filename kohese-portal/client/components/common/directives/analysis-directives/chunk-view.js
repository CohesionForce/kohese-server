function ChunkViewController($scope, tabService){
    const ctrl = this;
    var currentTab = tabService.getCurrentTab();

    // Bundler Logic 
    var controllerRestored = tabService.restoreControllerData(currentTab.id, 'ChunkViewController', this);
    
    if(!controllerRestored) {
        // Initialization Block
    }

    $scope.$on('tabSelected', function () {
        tabService.bundleController(ctrl, 'ChunkViewController', currentTab.id);
    });
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