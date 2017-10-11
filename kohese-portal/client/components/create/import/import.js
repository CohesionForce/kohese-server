function ImportItemController(Upload, tabService, ImportService, $stateParams) {
    const ctrl = this;
    ctrl.tab = tabService.getCurrentTab();
    ctrl.files = []

    var controllerRestored = tabService.restoreControllerData(ctrl.tab.id, 'importCtrl', this);

    if (!controllerRestored)
    {
        ctrl.tab = tabService.getCurrentTab();
        ctrl.tab.route = $stateParams.id;
        ctrl.parentId = $stateParams.parentId
        
    }

    ctrl.submit = function () {
        console.log(this);
        console.log(this.files);
        ImportService.importFile(ctrl.files, ctrl.parentId);
    }

}

export default () => {
    angular.module('app.create.import', ['ngFileUpload',
                                         'app.services.tabservice',
                                         'app.services.importservice'])
        .controller('ImportItemController', ImportItemController);
}