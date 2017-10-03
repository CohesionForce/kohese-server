function CreateWizardController($state) {

    const ctrl = this;

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