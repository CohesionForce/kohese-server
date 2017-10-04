function ImportItemController(Upload) {
    const ctrl = this;

    ctrl.submit = function () {
        console.log(this);
        console.log(this.file);
    }

}

export default () => {
    angular.module('app.create.import', ['ngFileUpload'])
        .controller('ImportItemController', ImportItemController);
}