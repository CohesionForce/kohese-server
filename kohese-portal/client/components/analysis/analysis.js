function AnalysisController($scope, $stateParams, ItemRepository, tabService) {
    const ctrl = this;

    var currentTab = tabService.getCurrentTab();
    ctrl.showChildren= true;

    var controllerRestored = tabService.restoreControllerData(currentTab.id, 'AnalysisController', this);

    if(!controllerRestored) {
        ctrl.itemProxy =  ItemRepository.getProxyFor($stateParams.id);
    };

    $scope.$on('tabSelected', function () {
        tabService.bundleController(ctrl, 'AnalysisController', currentTab.id);
        currentTab.params = $stateParams;
    });

    $scope.$on('itemRepositoryReady', function () {
        if (angular.isDefined($stateParams.id)) {
           ctrl.itemProxy = ItemRepository.getProxyFor($stateParams.id);
        }
    });

    $scope.$on('newTermFilter', newAnalysisFilter);

    $scope.$on('newPhraseFilter', newAnalysisFilter);

    function newAnalysisFilter(event, string) {
        event.stopPropagation();
        $scope.$broadcast('newAnalysisFilter', string);
    };
}

export default ()=> {
    angular.module('app.components.analysis', 
        ['app.services.itemservice',
        'app.services.tabservice'])
        .controller('AnalysisController', AnalysisController)
}