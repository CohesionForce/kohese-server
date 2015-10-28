/**
 * Created by josh on 7/13/15.
 */


function DetailsViewController($state, ItemRepository, analysisService, Item, IssueService,
                               DecisionService, ActionService, CategoryService, UserService, tabService,
                               $scope, $stateParams) {

    var detailsCtrl = this;

    detailsCtrl.tab = tabService.getCurrentTab();
    detailsCtrl.tab.route = $stateParams.id;
    detailsCtrl.filterString = "";
    detailsCtrl.analysisFilterString = "";
    detailsCtrl.analysisSummarySortField = ['-count', 'text'];
    detailsCtrl.analysisDetailsSortField = "";
    detailsCtrl.enableEdit = false;
    detailsCtrl.itemProxy = {};
    detailsCtrl.parentProxy = {};
    detailsCtrl.defaultTab = {active: true};
    detailsCtrl.showChunksInAnalysis = true;
    detailsCtrl.showTokensInAnalysis = true;
    detailsCtrl.showSentencesInDetails = true;
    detailsCtrl.showChunksInDetails = false;
    detailsCtrl.showTokensInDetails = false;
    detailsCtrl.filterList = [];
    detailsCtrl.kindList = ItemRepository.modelTypes;
    detailsCtrl.decisionStates = DecisionService.getDecisionStates();
    detailsCtrl.actionStates = ActionService.getActionStates();
    detailsCtrl.issueStates = IssueService.getIssueStates();
    detailsCtrl.categoryTags = CategoryService.getTags();
    detailsCtrl.userList = UserService.getAllUsers();
    detailsCtrl.currentUser = UserService.getCurrentUser();
    detailsCtrl.analysisFilterPOS = analysisService.filterPOS;
    detailsCtrl.analysisPOSFilterCriteria = analysisService.posFilterCriteria;
    detailsCtrl.analysisPOSFilterCriteriaList = Object.keys(analysisService.posFilterCriteria);
    detailsCtrl.analysisPOSFilterName = "Standard";

    $scope.$on('$stateChangeSuccess', function () {
        $scope.$emit('newItemSelected', $stateParams.id);
    });

    if ($stateParams.id) {
        detailsCtrl.itemProxy = ItemRepository.getProxyFor($stateParams.id);
    }

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

    if (angular.isDefined($stateParams.id)) {
        detailsCtrl.itemProxy = ItemRepository.getProxyFor($stateParams.id);
        detailsCtrl.updateParentProxy();
    } else if (angular.isDefined($stateParams.parentId)) {
        {
            detailsCtrl.itemProxy.item = new Item();
            detailsCtrl.itemProxy.item.parentId = $stateParams.parentId;
            detailsCtrl.updateParentProxy();
        }
    } else {
        detailsCtrl.itemProxy.item = new Item();
        detailsCtrl.updateParentProxy();
    }

    if (detailsCtrl.tab.state === 'kohese.explore.create') {
        detailsCtrl.enableEdit = true;
    }


    $scope.$on('itemRepositoryReady', function () {
        detailsCtrl.itemProxy = ItemRepository.getProxyFor($stateParams.id);
        detailsCtrl.decisionStates = DecisionService.getDecisionStates();
        detailsCtrl.actionStates = ActionService.getActionStates();
        detailsCtrl.issueStates = IssueService.getIssueStates();
        detailsCtrl.categoryTags = CategoryService.getTags();
        detailsCtrl.userList = UserService.getAllUsers();

        detailsCtrl.updateParentProxy();
        if (detailsCtrl.itemProxy) {
            configureState();
        }
    });

    $scope.$on('tabSelected', function () {
        detailsCtrl.tab = tabService.getCurrentTab();
    });

    detailsCtrl.updateTab = function (state, id, view) {
        detailsCtrl.tab.setState(state);
        detailsCtrl.tab.params.id = id;
        if (view) {
            detailsCtrl.tab.toggleType();
            detailsCtrl.tab.setType = view;
        }
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

    detailsCtrl.updateItem = function () {
        var newModel = ItemRepository.modelTypes[detailsCtrl.itemProxy.kind];
        var newItem = new newModel();
        ItemRepository.copyAttributes(detailsCtrl.itemProxy.item, newItem);
        detailsCtrl.itemProxy.item = newItem;
    };

    detailsCtrl.incrementItemInput = function (type) {
        if (detailsCtrl.itemProxy.item[type]) {
            var altLength = detailsCtrl.itemProxy.item[type].length;
            detailsCtrl.itemProxy.item[type][altLength] = {text: ''};
        } else {
            detailsCtrl.itemProxy.item[type] = [{text: ''}]
        }
    };

    detailsCtrl.tagSelected = function (selected) {
        if (selected) {
            //window.alert('You have selected ' + selected);
            console.log(selected);
        } else {
            console.log('cleared');
        }
    };

    detailsCtrl.toggleView = function (state) {
        detailsCtrl.tab.toggleType();
        detailsCtrl.tab.setState(state);
    };

    detailsCtrl.fetchAnalysis = function () {
        analysisService.fetchAnalysis(detailsCtrl.itemProxy);
    };

    console.log(detailsCtrl.itemProxy);

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

                // Check if this is a create
                if (!detailsCtrl.itemProxy.item.id) {
                    // Refocus on the parent, if it exists
                    if (updatedItem.parentId != '') {
                        $state.go('kohese.explore.edit', {id: updatedItem.parentId})
                    } else {
                        $state.go('kohese.explore.edit', {id: updatedItem.id})
                    }
                }
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

    //datepicker config
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
        console.log(detailsCtrl.estimatedStart);
    };

    detailsCtrl.convertDate = function (type, end) {
        var date = new Date(detailsCtrl.itemProxy.item[type]);
        if (end) {
            // shame.js - I need to refactor this magic number
            detailsCtrl.itemProxy.item[type] = date.valueOf() + 86399;
        } else {
            detailsCtrl.itemProxy.item[type] = date.valueOf();
        }
        console.log(detailsCtrl.itemProxy.item[type])
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
        }
        detailsCtrl.currentState = state;

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
