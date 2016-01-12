/**
 * Created by josh on 7/13/15.
 */


function DetailsViewController($state, ItemRepository, analysisService, Item, IssueService, NavigationService,
                               DecisionService, ActionService, CategoryService, UserService, tabService,
                               $scope, $stateParams) {

    var detailsCtrl = this;

    detailsCtrl.tab = tabService.getCurrentTab();
    var controllerRestored = tabService.restoreControllerData(detailsCtrl.tab.id, 'detailsCtrl', this);

    // Initialization block
    if (!controllerRestored || detailsCtrl.itemProxy.item.id != $stateParams.id) {
        detailsCtrl.updateParentProxy = updateParentProxy;
        detailsCtrl.itemProxy = {};
        if (angular.isDefined($stateParams.id)) {
            detailsCtrl.itemProxy = ItemRepository.getProxyFor($stateParams.id);
        } else if (angular.isDefined($stateParams.parentId)) {
            // This is a check for the create of a new item with the parentId supplied
            detailsCtrl.itemProxy.item = new Item();
            detailsCtrl.itemProxy.item.parentId = $stateParams.parentId;
        } else {
            detailsCtrl.itemProxy.item = new Item();
        }
        detailsCtrl.updateParentProxy();
        detailsCtrl.tab = tabService.getCurrentTab();
        detailsCtrl.tab.route = $stateParams.id;
        detailsCtrl.filterString = "";
        detailsCtrl.analysisFilterString = "";
        detailsCtrl.analysisSummarySortField = ['-count', 'text'];
        detailsCtrl.analysisDetailsSortField = "";
        detailsCtrl.enableEdit = false;
        detailsCtrl.defaultTab = {active: true};
        detailsCtrl.showChunksInAnalysis = true;
        detailsCtrl.showTokensInAnalysis = true;
        detailsCtrl.showSentencesInDetails = true;
        detailsCtrl.showChunksInDetails = false;
        detailsCtrl.showTokensInDetails = false;
        detailsCtrl.analysisSummaryItemLimit = 50;
        detailsCtrl.analysisDetailsItemLimit = 100;
        detailsCtrl.filterList = [];
        detailsCtrl.kindList = ItemRepository.getModelTypes();
        detailsCtrl.decisionStates = DecisionService.getDecisionStates();
        detailsCtrl.actionStates = ActionService.getActionStates();
        detailsCtrl.issueStates = IssueService.getIssueStates();
        detailsCtrl.categoryTags = CategoryService.getTags();
        detailsCtrl.userList = UserService.getAllUsers();
        detailsCtrl.currentUser = UserService.getCurrentUser();
        detailsCtrl.proxyList = ItemRepository.getShortFormItemList();
        detailsCtrl.analysisFilterPOS = analysisService.filterPOS;
        detailsCtrl.analysisPOSFilterCriteria = analysisService.posFilterCriteria;
        detailsCtrl.analysisPOSFilterCriteriaList = Object.keys(analysisService.posFilterCriteria);
        detailsCtrl.analysisPOSFilterName = "Standard";
        detailsCtrl.NavigationService = NavigationService;
        if (detailsCtrl.tab.state === 'kohese.explore.create') {
            detailsCtrl.enableEdit = true;
        }
    }

    detailsCtrl.getProxyFor = function (id) {
      return ItemRepository.getProxyFor(id);
    };

    $scope.$on('$stateChangeSuccess', function () {
        $scope.$emit('newItemSelected', $stateParams.id);
    });

    $scope.$on('itemRepositoryReady', function () {
        detailsCtrl.itemProxy = ItemRepository.getProxyFor($stateParams.id);
        detailsCtrl.decisionStates = DecisionService.getDecisionStates();
        detailsCtrl.actionStates = ActionService.getActionStates();
        detailsCtrl.issueStates = IssueService.getIssueStates();
        detailsCtrl.categoryTags = CategoryService.getTags();
        detailsCtrl.userList = UserService.getAllUsers();
        detailsCtrl.proxyList = ItemRepository.getShortFormItemList();

        detailsCtrl.updateParentProxy();
        if (detailsCtrl.itemProxy) {
            configureState();
        }
    });

    $scope.$on('tabSelected', function () {
        tabService.bundleController(detailsCtrl, 'detailsCtrl', detailsCtrl.tab.id)
    });

    detailsCtrl.updateParentProxy = function () {
        if (detailsCtrl.itemProxy && detailsCtrl.itemProxy.item.parentId) {
            detailsCtrl.parentProxy = ItemRepository.getProxyFor(detailsCtrl.itemProxy.item.parentId);
        } else {
            detailsCtrl.parentProxy = {};
        }
    };

    if (detailsCtrl.tab.state === 'kohese.investigate') {
        detailsCtrl.tab.setTitle('Investigate');
        detailsCtrl.tab.params = {
            id: $stateParams.id
        };
    }

    function updateParentProxy() {
        if (detailsCtrl.itemProxy && detailsCtrl.itemProxy.item.parentId) {
            detailsCtrl.parentProxy = ItemRepository.getProxyFor(detailsCtrl.itemProxy.item.parentId);
        } else {
            detailsCtrl.parentProxy = {};
        }
    };

    function initializeItemStates(type) {
        if (type === 'Action') {
            if (!detailsCtrl.itemProxy.item.hasOwnProperty("actionState")) {
                detailsCtrl.itemProxy.item.actionState = 'Proposed';
            }
            if (!detailsCtrl.itemProxy.item.hasOwnProperty("decisionState")) {
                detailsCtrl.itemProxy.item.decisionState = 'Proposed';
            }
        } else if (type === 'Decision') {
            if (!detailsCtrl.itemProxy.item.hasOwnProperty("decisionState")) {
                detailsCtrl.itemProxy.item.decisionState = 'Proposed';
            }
        } else if (type === 'Task') {
            if (!detailsCtrl.itemProxy.item.hasOwnProperty("taskState")) {
                detailsCtrl.itemProxy.item.taskState = 'Proposed';
            }
        } else if (type === 'Issue') {
            if (!detailsCtrl.itemProxy.item.hasOwnProperty("issueState")) {
                detailsCtrl.itemProxy.item.issueState = 'Observed';
            }
        }
    }

    detailsCtrl.createItem = function (navigationType) {
        ItemRepository.upsertItem(detailsCtrl.itemProxy.item)
            .then(function (updatedItem) {

                // clear the state of the form
                detailsCtrl.itemForm.$setPristine();
                if (detailsCtrl.decisionForm) {
                    detailsCtrl.decisionForm.$setPristine();
                }
                if (detailsCtrl.actionForm) {
                    detailsCtrl.actionForm.$setPristine();
                }
                detailsCtrl.enableEdit = false;

                if (navigationType === 'parent') {
                    $state.go(NavigationService.getLastState(detailsCtrl.tab.id), {id: updatedItem.parentId})
                } else if (navigationType === 'child') {
                    $state.go(NavigationService.getLastState(detailsCtrl.tab.id), {id: updatedItem.id})
                }
            });
    };

    detailsCtrl.updateTab = function (state, id, view) {
        detailsCtrl.tab.setState(state);
        detailsCtrl.tab.params.id = id;
        if (view) {
            detailsCtrl.tab.toggleType();
            detailsCtrl.tab.setType = view;
        }
        detailsCtrl.navigate(state, id)
    };

    detailsCtrl.navigateToCreateForm = function () {
        if (detailsCtrl.tab.type === 'singleview') {
            detailsCtrl.tab.setState('kohese.create');
            detailsCtrl.tab.params.parentId = detailsCtrl.itemProxy.item.id;
            $state.go('kohese.create', {parentId: detailsCtrl.itemProxy.item.parentId})
        } else {
            if ($state.current.name === 'kohese.explore.edit' || $state.current.name === 'kohese.explore') {
                detailsCtrl.tab.setState('kohese.explore.create');
                detailsCtrl.tab.params.parentId = detailsCtrl.itemProxy.item.id;
                $state.go('kohese.explore.create', {parentId: detailsCtrl.itemProxy.item.id})
            } else if ($state.current.name === 'kohese.search' || $state.current.name === 'kohese.search.edit') {
                detailsCtrl.tab.setState('kohese.search.create');
                detailsCtrl.tab.params.parentId = detailsCtrl.itemProxy.item.id;
                $state.go('kohese.search.create', {parentId: detailsCtrl.itemProxy.item.id})
            }
        }
    };

    detailsCtrl.navigate = function (state, id) {
        if (state) {
            $state.go(state, {id: id})
        } else {
            $state.go('kohese.explore.edit', {id: id})
        }
    };

    /*
     *
     * Angucomplete Functions
     *
     */

    detailsCtrl.parentChanged = function (selected) {
        detailsCtrl.itemProxy.item.parentId = selected.description.id;
        detailsCtrl.updateParentProxy();
    };

    detailsCtrl.actionAssigned = function (selected) {
        if (selected) {
            detailsCtrl.itemProxy.item.assignedTo = selected.title;
        }
    };

    detailsCtrl.decisionApproved = function (selected) {
        if (selected) {
            detailsCtrl.itemProxy.item.approvedBy = selected.title;
        }
    };

    detailsCtrl.somethingObserved = function (selected) {
        if (selected) {
            detailsCtrl.itemProxy.item.observedBy = selected.title;
        }
    };

    detailsCtrl.taskAssigned = function (selected) {
        if (selected) {
            detailsCtrl.itemProxy.item.assignedTo = selected.title;
        }
    };

    detailsCtrl.analysisActionSelected = function (selected) {
        if (selected) {
            detailsCtrl.itemProxy.item.analysisAction = selected
        }
    };

    detailsCtrl.updateItem = function () {
        var newModel = ItemRepository.modelTypes[detailsCtrl.itemProxy.kind];
        var newItem = new newModel();
        ItemRepository.copyAttributes(detailsCtrl.itemProxy.item, newItem);
        detailsCtrl.itemProxy.item = newItem;
        initializeItemStates(detailsCtrl.itemProxy.kind);
    };

    detailsCtrl.incrementItemInput = function (type) {
      if(!detailsCtrl.itemProxy.item[type]){
        detailsCtrl.itemProxy.item[type] = [];
      }
      
      if (type === 'context') {
        detailsCtrl.itemProxy.item[type].push({id: detailsCtrl.contextInput.description.id});
      } else if (type === "resolutionActions") {
        detailsCtrl.itemProxy.item[type].push({id: detailsCtrl.resolutionActionsInput.description.id});
      } else {
        detailsCtrl.itemProxy.item[type].push({name: ''});
      }   
    };

    detailsCtrl.deleteItemInput = function (type, row) {
        var index = detailsCtrl.itemProxy.item[type].indexOf(row);
        detailsCtrl.itemProxy.item[type].splice(index, 1);
    };

    detailsCtrl.toggleView = function (state) {
        detailsCtrl.tab.toggleType();
        detailsCtrl.tab.setState(state);
    };

    detailsCtrl.fetchAnalysis = function () {
        analysisService.fetchAnalysis(detailsCtrl.itemProxy);
    };

    detailsCtrl.upsertItem = function () {
        ItemRepository.upsertItem(detailsCtrl.itemProxy.item)
            .then(function (updatedItem) {

                // clear the state of the form
                detailsCtrl.itemForm.$setPristine();
                if (detailsCtrl.decisionForm) {
                    detailsCtrl.decisionForm.$setPristine();
                }
                if (detailsCtrl.actionForm) {
                    detailsCtrl.actionForm.$setPristine();
                }
                detailsCtrl.enableEdit = false;

            });
    };

    detailsCtrl.getLastFilter = function () {
        detailsCtrl.analysisFilterString = detailsCtrl.filterList.pop();
        detailsCtrl.analysisFilterInput = detailsCtrl.analysisFilterString;
    };

    detailsCtrl.submitFilter = function () {
        detailsCtrl.filterList.push(detailsCtrl.analysisFilterString);
        detailsCtrl.analysisFilterString = detailsCtrl.analysisFilterInput;
    };
    
    detailsCtrl.filterSummaryByDisplayType = function(summary) {
        return detailsCtrl.analysisFilterPOS(summary,detailsCtrl.analysisPOSFilterCriteria[detailsCtrl.analysisPOSFilterName]) && (((summary.displayType == 'Chunk') && detailsCtrl.showChunksinSummary) || ((summary.displayType == 'Token') && detailsCtrl.showTokensinSummary));
    };

    detailsCtrl.filterDetailsByDisplayType = function(listItem) {
        return (listItem.displayLevel == 1) || ((listItem.displayLevel == 2) && detailsCtrl.showSentencesInDetails) || ((listItem.displayLevel == 3) && detailsCtrl.showChunksInDetails) || ((listItem.displayLevel == 4) && detailsCtrl.showTokensInDetails);
    };

    detailsCtrl.getSummaryItemCount = function () {
      return $('#theSummaryBody').find("tr").length;
    };

    detailsCtrl.getDetailsItemCount = function () {
      return $('#theDetailsBody').find("tr").length;
    };
    
    $scope.$watch('detailsCtrl.analysisSummaryItemLimit', function () {
      postDigest(function () {
          // Force one more update cycle to get the match count to display
          $scope.$apply();
      });
    });

    $scope.$watch('detailsCtrl.analysisFilterString', function () {
      postDigest(function () {
          // Force one more update cycle to get the match count to display
          $scope.$apply();
      });
    });

    $scope.$watch('detailsCtrl.analysisDetailsItemLimit', function () {
      postDigest(function () {
          // Force one more update cycle to get the match count to display
          $scope.$apply();
      });
    });

    function postDigest(callback) {
      var unregister = $scope.$watch(function () {
          unregister();
          $timeout(function () {
              callback();
          }, 0, false);
      });
    };
      
    detailsCtrl.cancel = function () {

        if (this.itemForm.$dirty) {
            ItemRepository.fetchItem(detailsCtrl.itemProxy.item);
            this.itemForm.$setPristine();
        }
    };

    detailsCtrl.removeItem = function (item) {
        ItemRepository.deleteItem(item)
            .then(function () {
                // TBD:  May need to do something special if the delete fails
            });
    };

    //
    // Datepicker config
    //

    detailsCtrl.estimatedStart = false;
    detailsCtrl.dateOptions = {
        formatYear: 'yy'
    };

    detailsCtrl.openDatePicker = function ($event, type) {
        detailsCtrl.date = new Date(detailsCtrl.itemProxy.item.estimatedStart);
        if ($event) {
            $event.preventDefault();
            $event.stopPropagation();
        }
        detailsCtrl[type] = true;
    };

    detailsCtrl.convertDate = function (type, end) {
        var date = new Date(detailsCtrl.itemProxy.item[type]);
        if (end) {
            // shame.js - I need to refactor this magic number
            detailsCtrl.itemProxy.item[type] = date.valueOf() + 86399;
        } else {
            detailsCtrl.itemProxy.item[type] = date.valueOf();
        }
    };

    detailsCtrl.updateState = function (state, type) {
        detailsCtrl.currentState = state;
        if (type === 'Decision') {
            detailsCtrl.itemProxy.item.decisionState = state;
            if (detailsCtrl.itemProxy.item.decisionState === 'In Analysis') {
                detailsCtrl.accordion.InAnalysis = true;
            } else if (detailsCtrl.itemProxy.item.decisionState === 'In Review') {
                detailsCtrl.accordion.InReview = true;
            } else {
                detailsCtrl.accordion[detailsCtrl.itemProxy.item.decisionState] = true;
            }
        } else if (type === 'Action') {
            if (detailsCtrl.itemProxy.item.actionState === 'In Work') {
                detailsCtrl.accordion.InWork = true;

            } else if (detailsCtrl.itemProxy.item.actionState === 'In Verification') {
                detailsCtrl.accordion.InVerification = true;
            } else {
                detailsCtrl.accordion[state] = true;
            }
            detailsCtrl.itemProxy.item.actionState = state;
        } else if (type === 'Task') {
            detailsCtrl.itemProxy.item.taskState = state;
        }
        detailsCtrl.currentState = state;
        detailsCtrl.upsertItem();
    };

    function configureState() {
        detailsCtrl.accordion = {};
        if (detailsCtrl.itemProxy.item.actionState === 'Proposed'
            && detailsCtrl.itemProxy.item.decisionState != 'Proposed') {
            if (detailsCtrl.itemProxy.item.decisionState === 'In Analysis') {
                detailsCtrl.accordion.InAnalysis = true;
                detailsCtrl.currentState = detailsCtrl.itemProxy.item.decisionState
            }
            if (detailsCtrl.itemProxy.item.decisionState === 'In Review') {
                detailsCtrl.accordion.InReview = true;
                detailsCtrl.currentState = detailsCtrl.itemProxy.item.decisionState
            } else {
                detailsCtrl.accordion[detailsCtrl.itemProxy.item.decisionState] = true;
                detailsCtrl.currentState = detailsCtrl.itemProxy.item.decisionState
            }
        }
        else {
            if (detailsCtrl.itemProxy.item.actionState != 'In Work'
                && detailsCtrl.itemProxy.item.actionState != 'Pending Reassign') {
                detailsCtrl.accordion[detailsCtrl.itemProxy.item.actionState] = true;
                detailsCtrl.currentState = detailsCtrl.itemProxy.item.actionState;
            } else {
                if (detailsCtrl.itemProxy.item.actionState === 'In Work') {
                    detailsCtrl.accordion.InWork = true;
                    detailsCtrl.currentState = detailsCtrl.itemProxy.item.actionState;

                }
                if (detailsCtrl.itemProxy.item.actionState === 'In Verification') {
                    detailsCtrl.accordion.InVerification = true;
                    detailsCtrl.currentState = detailsCtrl.itemProxy.item.actionState;
                }
            }
        }

    }


    if (detailsCtrl.itemProxy) {
        configureState();
    }
}

export default () => {
    angular.module('app.detailsview', [
        'app.services.tabservice',
        'app.services.decisionservice',
        'app.services.actionservice',
        'app.services.categoryservice',
        'app.services.userservice',
        'app.services.issueservice',
        'app.services.observationservice'])
        .controller('DetailsViewController', DetailsViewController);
}
