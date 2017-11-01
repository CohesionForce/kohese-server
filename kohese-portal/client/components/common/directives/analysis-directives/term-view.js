function TermViewController($scope, tabService){
    const ctrl = this;
    var currentTab = tabService.getCurrentTab();
    
    // Bundler Logic 
    var controllerRestored = tabService.restoreControllerData(currentTab.id, 'TermViewController', this);
    
    if(!controllerRestored) {
        // Initialization Block
    }

    $scope.$on('tabSelected', function () {
        tabService.bundleController(ctrl, 'ChunkViewController', currentTab.id);
    });
}
 
function TermViewDirective(){
    return {
        restrict: 'E',
        controller: 'TermViewController as tvCtrl',
        scope: {
            itemProxy: '='
        },
        templateUrl: 'components/common/directives/analysis-directives/term-view.html'
    }
}

export default ()=> {
    angular.module('app.directives.termview', ['app.services.tabservice'])
        .directive('termView', TermViewDirective)
        .controller('TermViewController', TermViewController)
}