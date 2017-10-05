function CreateWizardController($state, tabService) {

    const ctrl = this;

    var controllerRestored = tabService.restoreControllerData(ctrl.tab.id, 'createWizardCtrl', this);
    
        if (!controllerRestored)
        {
            ctrl.tab = tabService.getCurrentTab();
            ctrl.tab.route = $stateParams.id;
            
        }

    ctrl.navigate = function(destination) {
        $state.go('kohese.explore.create.' + destination);
        console.log('kohese.explore.create.' + destination)
    }
}

export default () => {
    angular.module('app.create', [])
           .controller('CreateWizardController', CreateWizardController);

    // Load sub-controllers 
    require('./import/import.js')();
}