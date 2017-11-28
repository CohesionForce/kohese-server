function AnalysisController ($scope, $stateParams, ItemRepository, tabService,
  analysisService, ModalService) {
  const ctrl = this;

  var currentTab = tabService.getCurrentTab();
  ctrl.showChildren= true;

  var controllerRestored = tabService.restoreControllerData(currentTab.id, 'AnalysisController', this);

  if(!controllerRestored) {
    ctrl.itemProxy =  ItemRepository.getProxyFor($stateParams.id);
  }

  $scope.$on('tabSelected', function () {
    tabService.bundleController(ctrl, 'AnalysisController', currentTab.id);
    currentTab.params = $stateParams;
  });

  $scope.$on('itemRepositoryReady', function () {
    if (angular.isDefined($stateParams.id)) {
      ctrl.itemProxy = ItemRepository.getProxyFor($stateParams.id);
      fetchAnalysis();
    }
  });

  $scope.$on('newTermFilter', newAnalysisFilter);

  $scope.$on('newPhraseFilter', newAnalysisFilter);

  function fetchAnalysis () {
    var modalDefaults = {
      templateUrl : ModalService.LOADING_TEMPLATE,
      controller : ($scope, $modalInstance) => {
        $scope.modalOptions = {
          ok : (result) => {
            $modalInstance.close(result);
          },
          close : (result) => {
            $modalInstance.dismiss('cancel');
          },
          init : () => {
            analysisService.fetchAnalysis($scope.modalOptions.itemProxy)
              .then( (results) => {
                // TODO - Error handling 
                // if (results.err) {
                //   $scope.modalOptions.bodyText = err
                // }
                $scope.modalOptions.ok(results);
              });
          },
          itemProxy : ctrl.itemProxy,
          headerText: 'Loading Analysis'
        }
      }
    }

    console.log('Testing analysis modal');
    console.log(ctrl.itemProxy);

    ModalService.showModal(modalDefaults, {}).then(()=> {
      console.log(ctrl.itemProxy);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    })
  }

  function newAnalysisFilter (event, string) {
    event.stopPropagation();
    $scope.$broadcast('newAnalysisFilter', string);
  }

  // Initialization
  if (ctrl.itemProxy) {
    fetchAnalysis();
  }
}

export default ()=> {
  angular.module('app.components.analysis', 
    ['app.services.itemservice',
      'app.services.tabservice'])
    .controller('AnalysisController', AnalysisController)
}