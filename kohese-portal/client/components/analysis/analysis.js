function AnalysisController($stateParams, ItemRepository, tabService) {
    const ctrl = this;

    var tab = tabService.getCurrentTab();
    var controllerRestored = tabService.restoreControllerData(tab.id, 'AnalysisController', this);

    if(!controllerRestored) {
        ctrl.itemProxy =  ItemRepository.getProxyFor($stateParams.id);
    }
    this.msg = ctrl.itemProxy.item.name;
}

export default ()=> {
    angular.module('app.components.analysis', 
        ['app.services.itemservice',
        'app.services.tabservice'])
        .controller('AnalysisController', AnalysisController)
}