function SentenceViewController($scope, tabService){
    const ctrl = this;
    var currentTab = tabService.getCurrentTab();

    // Bundler Logic 
    var controllerRestored = tabService.restoreControllerData(currentTab.id, 'SentenceViewController', this);
    
    if(!controllerRestored) {
        // Initialization Block
    }

    $scope.$on('tabSelected', function () {
        tabService.bundleController(ctrl, 'SentenceViewController', currentTab.id);
    });
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