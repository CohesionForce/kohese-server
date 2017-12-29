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
          promiseList : [],
          completed : undefined,
          numberToComplete : undefined,
          errorCount : 0,
          ok : (result) => {
            $modalInstance.close(result);
          },
          close : (result) => {
            $modalInstance.dismiss('cancel');
          },
          incrementCompleted : (results) => {
            console.log('$$$ Got results for ');
            console.log(results);
            $scope.modalOptions.completed++;
            if($scope.modalOptions.completed === $scope.modalOptions.numberToComplete){
              if(!$scope.modalOptions.errorCount){
                $scope.modalOptions.ok(results);                
              }
            }
            $scope.$apply();
          },
          init : () => {
            analysisService.fetchAnalysis($scope.modalOptions.itemProxy, $scope.modalOptions.promiseList);
            console.log('$$$ PromiseList:');
            console.log($scope.modalOptions.promiseList);
            $scope.modalOptions.completed = 0;
            $scope.modalOptions.numberToComplete = $scope.modalOptions.promiseList.length;
            
            for(var idx in $scope.modalOptions.promiseList){
              $scope.modalOptions.promiseList[idx].then((results) => {
                $scope.modalOptions.incrementCompleted(results);
              }).catch((error) => {
                $scope.modalOptions.errorCount++;
                $scope.modalOptions.incrementCompleted(error);
              });
            }
          },
          itemProxy : ctrl.itemProxy,
          headerText: 'Loading Analysis'
        };
      }
    };

    console.log('Testing analysis modal');
    console.log(ctrl.itemProxy);

    ModalService.showModal(modalDefaults, {}).then(()=> {
      console.log(ctrl.itemProxy);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
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
    .controller('AnalysisController', AnalysisController);
};