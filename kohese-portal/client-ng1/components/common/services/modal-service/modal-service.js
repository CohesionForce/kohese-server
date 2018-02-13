/* Service that allows ui components to create modals with custom messages and 
   controllers. Uses the ui-bootstrap modal components. More info on options for
   modals can be found at :

   https://github.com/angular-ui/bootstrap/tree/master/src/modal
*/

function ModalService ($modal) {
  const service = this;
  this.DEFAULT_TEMPLATE = 'components/common/services/modal-service/modal.html'
  this.ONE_LIST_TEMPLATE = 'components/common/services/modal-service/oneListModal.html'
  this.DELETE_TEMPLATE = 'components/common/services/modal-service/deleteModal.html'
  this.LOADING_TEMPLATE = 'components/common/services/modal-service/loadingModal.html'

  var modalDefaults = {
    backdrop: true,
    keyboard: true,
    modalFade: true,
    templateUrl: this.DEFAULT_TEMPLATE
  };

  var modalOptions = {
    closeButtonText : 'Close',
    actionButtonText : 'Ok',
    headerText : 'Proceed',
    bodyText: 'Perform this action'
  };

  service.showModal = function (customModalDefaults, customModalOptions) {
    if (!customModalDefaults) {
      customModalDefaults = {}
    }

    customModalDefaults.backdrop = 'static';
    return service.show(customModalDefaults, customModalOptions);
  }

  service.show = function (customModalDefaults, customModalOptions) {
    var tempModalDefaults = {};
    var tempModalOptions = {};

    /* Map angular-ui modal custom defaults to modal defaults defined 
           in service */
    angular.extend(tempModalDefaults, modalDefaults, customModalDefaults); 

    angular.extend(tempModalOptions, modalOptions, customModalOptions);

    /* If a more complex controller hasn't been passed in, create a generic
           open / close function */
    if (!tempModalDefaults.controller) {
      tempModalDefaults.controller = function ($scope, $modalInstance) {
        $scope.modalOptions = tempModalOptions;
        $scope.modalOptions.ok = function (result) {
          $modalInstance.close(result);
        }
        $scope.modalOptions.close = function (result) {
          $modalInstance.dismiss('cancel');
        };
      }
    }

    return $modal.open(tempModalDefaults).result;
  }
}

export default () => {
  angular.module('app.services.modalservice', ['ui.bootstrap'])
    .service('ModalService', ModalService)
    .constant('DeleteTemplate', 'components/common/services/modal-service/deleteModal.html')
    .constant('DefaultTemplate', 'components/common/services/modal-service/modal.html')
    
}