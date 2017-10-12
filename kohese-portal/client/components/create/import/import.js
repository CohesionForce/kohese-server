function ImportItemController(Upload, tabService, ImportService, $stateParams,
                              $scope, $state) {
    const ctrl = this;
    var tab = tabService.getCurrentTab();
    ctrl.files = []
    ctrl.importedItems = []
    ctrl.importComplete = false;

    var controllerRestored = tabService.restoreControllerData(tab.id, 'importCtrl', this);

    if (!controllerRestored)
    {
        tab = tabService.getCurrentTab();
        tab.route = $stateParams.id;
        ctrl.parentId = $stateParams.parentId
        
    }

    $scope.$on("Import Complete", function(event, data) {
        ctrl.importedItems = data;
        ctrl.importComplete = true;
        
    })

    ctrl.navigate = function (state, params) {
        if (state) {
            tab.setState(state, params);
            $state.go(state, params);
        }
    };

    ctrl.submit = function () {
        ctrl.importComplete = false;
        ImportService.importFile(ctrl.files, ctrl.parentId);
    }

    

}

export default () => {
    angular.module('app.create.import', ['ngFileUpload',
                                         'app.services.tabservice',
                                         'app.services.importservice'])
        .controller('ImportItemController', ImportItemController);
}