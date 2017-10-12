function CreateWizardController($state, tabService, $stateParams) {

    const ctrl = this;

    ctrl.tab = tabService.getCurrentTab();

    var controllerRestored = tabService.restoreControllerData(ctrl.tab.id, 'createWizardCtrl', this);
    
        if (!controllerRestored)
        {
            ctrl.tab = tabService.getCurrentTab();
            ctrl.tab.route = $stateParams.id;
            
        }

    ctrl.navigate = function(state, params) {
        console.log($stateParams)
        ctrl.tab.setState(state, params)
        $state.go(state);
    }
}

export default () => {
    angular.module('app.create', [])
           .controller('CreateWizardController', CreateWizardController);

    // Load sub-controllers 
    require('./import/import.js')();
}