function AnalysisController($scope, $stateParams, ItemRepository, tabService) {
    const ctrl = this;

    var currentTab = tabService.getCurrentTab();
    ctrl.showChildren= true;

    var controllerRestored = tabService.restoreControllerData(currentTab.id, 'AnalysisController', this);

    if(!controllerRestored) {
        ctrl.itemProxy =  ItemRepository.getProxyFor($stateParams.id);
    }
    this.msg = ctrl.itemProxy.item.name;

    $scope.$on('tabSelected', function () {
        tabService.bundleController(ctrl, 'AnalysisController', currentTab.id);
    });

    $scope.$on('itemRepositoryReady', function () {
        if (angular.isDefined($stateParams.id)) {
           ctrl.itemProxy = ItemRepository.getProxyFor($stateParams.id);
        }
    })

}

export default ()=> {
    angular.module('app.components.analysis', 
        ['app.services.itemservice',
        'app.services.tabservice'])
        .controller('AnalysisController', AnalysisController)
}