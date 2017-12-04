function TermViewController ($scope, $timeout, tabService, analysisService) {
  const ctrl = this;
  var currentTab = tabService.getCurrentTab();

  // Bundler Logic
  var controllerRestored = tabService.restoreControllerData(currentTab.id, 'TermViewController', this);

  if (!controllerRestored) {
    // Initialization Block
    ctrl.itemProxy = $scope.itemProxy;

    ctrl.sortField = ['-count', '-text'];
    ctrl.reverse = false;
    ctrl.loadLimit = 100;

    ctrl.showPOS = false;

    ctrl.analysisFilterPOS = analysisService.filterPOS;
    ctrl.analysisPOSFilterCriteria = analysisService.posFilterCriteria;
    ctrl.analysisPOSFilterCriteriaList = Object.keys(analysisService.posFilterCriteria);
    ctrl.analysisPOSFilterName = 'Standard';

    ctrl.filterString = '';
    ctrl.filterTextTimeout;
    ctrl.filterList = []
    ctrl.filterExactMatch = true;
    ctrl.filterIgnoreCase = false;

    ctrl.analysisFilterString = '';
    ctrl.analysisFilterInput = '';
    ctrl.analysisFilterRegex = null;

    // Event Listeners

    $scope.$watch('ctrl.analysisFilterString', onFilterChange);
  }

  $scope.$on('tabSelected', function () {
    tabService.bundleController(ctrl, 'TermViewController', currentTab.id);
  });

  ctrl.fetchAnalysis = function () {
    analysisService.fetchAnalysis(ctrl.itemProxy).then(function (results) {
      $scope.$apply();
    });
  };

  ctrl.submitStringFilter = function (term) {
    if(!term) {
      term = '' // If an empty search has been entered
    }

    if (ctrl.filterExactMatch && term != '') {
      ctrl.analysisFilterInput = '/\\b' + term + '\\b/';
      if (ctrl.filterIgnoreCase) {
        ctrl.analysisFilterInput += 'i';
      }
    } else {
      ctrl.analysisFilterInput = term;
    }

    ctrl.analysisFilterString = ctrl.analysisFilterInput;
    ctrl.filterList.push(ctrl.analysisFilterString);
    $scope.$emit('newTermFilter', ctrl.analysisFilterString)
    // TODO Mimic watch firing
    onFilterChange();
  }

  $scope.$watch(angular.bind(this, () => {
    return ctrl.analysisFilterInput
  }), () => {
    ctrl.analysisFilterString = ctrl.analysisFilterInput;
    console.log(ctrl.analysisFilterInput);
    onFilterChange();
  });

  ctrl.getTermCount = function () {
    return $('#theTokensBody').find('tr').length;
  };

  ctrl.newSort = function (term) {
    if (ctrl.sortField === term) {
      ctrl.reverse = !ctrl.reverse;
    } else {
      ctrl.sortField = term;
      ctrl.reverse = false;
    }
  }


  ctrl.filterTokens = function (summary) {
    var POSFilterReturn = ctrl.analysisFilterPOS(summary,
      ctrl.analysisPOSFilterCriteria[ctrl.analysisPOSFilterName])
    var RegexFilterReturn = ctrl.analysisFilterRegex === null ||
            ctrl.analysisFilterRegex.test(summary.text);
    return POSFilterReturn && RegexFilterReturn;
  };

  function onFilterChange () {
    console.log('>>> Filter string changed to: ' + ctrl.analysisFilterString);
    if (ctrl.filterTextTimeout) {
      $timeout.cancel(ctrl.filterTextTimeout);
    }

    ctrl.filterTextTimeout = $timeout(function () {
      var regexFilter = /^\/(.*)\/([gimy]*)$/;
      var filterIsRegex = ctrl.analysisFilterString.match(regexFilter);

      if (filterIsRegex) {
        try {
          ctrl.analysisFilterRegex = new RegExp(filterIsRegex[1], filterIsRegex[2]);
          ctrl.analysisFilterRegexHighlight = new RegExp('(' + filterIsRegex[1] + ')', 'g' + filterIsRegex[2]);
          ctrl.invalidAnalysisFilterRegex = false;
        } catch (e) {
          ctrl.invalidAnalysisFilterRegex = true;
        }
      } else {
        let cleanedPhrase = ctrl.analysisFilterString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (ctrl.analysisFilterString !== '') {
          ctrl.analysisFilterRegex = new RegExp(cleanedPhrase, 'i');
          ctrl.analysisFilterRegexHighlight = new RegExp('(' + cleanedPhrase + ')', 'gi');
          ctrl.invalidAnalysisFilterRegex = false;
        } else {
          ctrl.analysisFilterRegex = null;
          ctrl.analysisFilterRegexHighlight = null;
          ctrl.invalidAnalysisFilterRegex = false;
        }
      }
    });
  }

  ctrl.fetchAnalysis();
}

function TermViewDirective () {
  return {
    restrict: 'E',
    controller: 'TermViewController as tvCtrl',
    scope: {
      itemProxy: '='
    },
    templateUrl: 'components/common/directives/analysis-directives/term-view.html'
  }
}

export const TermViewModule = {
  init: function () {
    angular.module('app.directives.termview', ['app.services.tabservice',
      'app.services.analysisservice'])
      .directive('termView', TermViewDirective)
      .controller('TermViewController', TermViewController)
  }
}
