/* Controller for the Create Screen Wizard  */

function CreateWizardController($state, tabService, $stateParams, ItemRepository) {
  const ctrl = this;

  ctrl.tab = tabService.getCurrentTab();
  ctrl.types = []

  for (const key of Object.keys(ItemRepository.getModelTypes())) {
    ctrl.types.push(key)
  }

  console.log(ctrl.types);

  var controllerRestored = tabService.restoreControllerData(ctrl.tab.id, 'createWizardCtrl', this);
    
  if (!controllerRestored) {
    ctrl.tab = tabService.getCurrentTab();
    ctrl.tab.route = $stateParams.id;
  }

  ctrl.navigate = function(state, params) {
    console.log($stateParams);
    if ($stateParams.parentId) {
      params.parentId = $stateParams.parentId
    }
    ctrl.tab.setState(state, params)
    $state.go(state, params);
  }
}

export default () => {
  angular.module('app.create', ['app.services.itemservice'])
    .controller('CreateWizardController', CreateWizardController);

  // Load sub-controllers 
  require('./import/import.js')();
}