function ImportItemController(Upload, tabService) {
    const ctrl = this;
    ctrl.tab = tabService.getCurrentTab();

    var controllerRestored = tabService.restoreControllerData(ctrl.tab.id, 'importCtrl', this);

    if (!controllerRestored)
    {
        ctrl.tab = tabService.getCurrentTab();
        ctrl.tab.route = $stateParams.id;
        
    }

    ctrl.submit = function () {
        console.log(this);
        console.log(this.file);
    }

}

export default () => {
    angular.module('app.create.import', ['ngFileUpload',
                                         'app.services.tabservice'])
        .controller('ImportItemController', ImportItemController);
}