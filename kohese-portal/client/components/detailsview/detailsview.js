/**
 * Created by josh on 7/13/15.
 */


function DetailsViewController ($state, $sce, $timeout, ItemRepository, IssueService, NavigationService,
  DecisionService, ActionService, CategoryService, UserService, tabService,
  $scope, $stateParams) {
  var detailsCtrl = this;
  var commonmark = require('commonmark');
  var reader = new commonmark.Parser();
  var writer = new commonmark.HtmlRenderer();
  var docReader = new commonmark.Parser();
  var docWriter = new commonmark.HtmlRenderer();
  detailsCtrl.docShowChildren=false;
    
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
      detailsCtrl.itemProxy.item = {};
      detailsCtrl.itemProxy.kind = 'Item';
      detailsCtrl.itemProxy.item.parentId = $stateParams.parentId;
    } else {
      detailsCtrl.itemProxy.item = {};
      detailsCtrl.itemProxy.kind = 'Item';
    }
    if (angular.isDefined($stateParams.type)) {
      detailsCtrl.itemProxy.kind = $stateParams.type;
      initializeItemStates(detailsCtrl.itemProxy.kind);
    }
    detailsCtrl.updateParentProxy();
    detailsCtrl.tab = tabService.getCurrentTab();
    detailsCtrl.tab.route = $stateParams.id; // Likely duplicated logic, can probably refactor this to use tab param object


    detailsCtrl.enableEdit = false;
    detailsCtrl.defaultTab = {active: true};
    detailsCtrl.kindList = ItemRepository.getModelTypes();
    detailsCtrl.decisionStates = DecisionService.getDecisionStates();
    detailsCtrl.actionStates = ActionService.getActionStates();
    detailsCtrl.issueStates = IssueService.getIssueStates();
    detailsCtrl.categoryTags = CategoryService.getTags();
    detailsCtrl.userList = UserService.getAllUsers();
    detailsCtrl.currentUser = UserService.getCurrentUsername();
    detailsCtrl.proxyList = ItemRepository.getShortFormItemList();
    detailsCtrl.NavigationService = NavigationService;
    if (detailsCtrl.tab.state === 'kohese.explore.create.new') {
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
    if (angular.isDefined($stateParams.id)) {
      detailsCtrl.itemProxy = ItemRepository.getProxyFor($stateParams.id);
    }
    detailsCtrl.decisionStates = DecisionService.getDecisionStates();
    detailsCtrl.actionStates = ActionService.getActionStates();
    detailsCtrl.issueStates = IssueService.getIssueStates();
    detailsCtrl.categoryTags = CategoryService.getTags();
    detailsCtrl.userList = UserService.getAllUsers();
    detailsCtrl.proxyList = ItemRepository.getShortFormItemList();

    detailsCtrl.updateParentProxy();
    if (detailsCtrl.itemProxy) {
      configureState();
      if (detailsCtrl.itemProxy.item.description) {
        var parsed = reader.parse(detailsCtrl.itemProxy.item.description); // parsed is a 'Node' tree 
        detailsCtrl.itemDescriptionRendered = writer.render(parsed); // result is a String 
        detailsCtrl.itemDescriptionRendered = $sce.trustAsHtml(detailsCtrl.itemDescriptionRendered);
      }
    }
    $scope.$emit('newItemSelected', $stateParams.id);
  });

  $scope.$on('userLoaded', function () {
    detailsCtrl.userName = UserService.getCurrentUsername();
  });

  $scope.$on('tabSelected', function () {
    tabService.bundleController(detailsCtrl, 'detailsCtrl', detailsCtrl.tab.id)
  });
  
  $scope.$watch('detailsCtrl.itemForm.$dirty', function () {
    if (detailsCtrl.itemProxy && detailsCtrl.itemForm && detailsCtrl.itemForm.$dirty) {
      detailsCtrl.itemProxy.dirty = true;
    }
  });
    
  $scope.$watch('detailsCtrl.decisionForm.$dirty', function () {
    if (detailsCtrl.itemProxy && detailsCtrl.decisionForm && detailsCtrl.decisionForm.$dirty) {
      detailsCtrl.itemProxy.dirty = true;
    }      
  });
    
  $scope.$watch('detailsCtrl.actionForm.$dirty', function () {
    if (detailsCtrl.itemProxy && detailsCtrl.actionForm && detailsCtrl.actionForm.$dirty) {
      detailsCtrl.itemProxy.dirty = true;
    }      
  });
    
  $scope.$watch('detailsCtrl.taskForm.$dirty', function () {
    if (detailsCtrl.itemProxy && detailsCtrl.taskForm && detailsCtrl.taskForm.$dirty) {
      detailsCtrl.itemProxy.dirty = true;
    }      
  });
    
  $scope.$watch('detailsCtrl.observationForm.$dirty', function () {
    if (detailsCtrl.itemProxy && detailsCtrl.observationForm && detailsCtrl.observationForm.$dirty) {
      detailsCtrl.itemProxy.dirty = true;
    }      
  });
    
  $scope.$watch('detailsCtrl.issueForm.$dirty', function () {
    if (detailsCtrl.itemProxy && detailsCtrl.issueForm && detailsCtrl.issueForm.$dirty) {
      detailsCtrl.itemProxy.dirty = true;
    }      
  });

  $scope.$watch('detailsCtrl.repositoryForm.$dirty', function () {
    if (detailsCtrl.itemProxy && detailsCtrl.repositoryForm && detailsCtrl.repositoryForm.$dirty) {
      detailsCtrl.itemProxy.dirty = true;
    }      
  });

  detailsCtrl.uiTreeOptions = {
    dropped : function (event) {
      if (event.source.index != event.dest.index) {
        detailsCtrl.itemProxy.dirty = true;
        detailsCtrl.itemProxy.updateChildrenManualOrder();
        console.log('))) Source:    ' + event.source);
        console.log('))) Source id: ' + event.source.nodeScope.proxy.item.id);
        console.log('))) Dest   ns: ' + event.dest.nodeScope);
      }
    }
  };


  detailsCtrl.updateParentProxy = function () {
    if (detailsCtrl.itemProxy && detailsCtrl.itemProxy.item.parentId) {
      detailsCtrl.parentProxy = ItemRepository.getProxyFor(detailsCtrl.itemProxy.item.parentId);
    } else {
      detailsCtrl.parentProxy = {};
    }
  };

  function updateParentProxy () {
    if (detailsCtrl.itemProxy && detailsCtrl.itemProxy.item.parentId) {
      detailsCtrl.parentProxy = ItemRepository.getProxyFor(detailsCtrl.itemProxy.item.parentId);
    } else {
      detailsCtrl.parentProxy = {};
    }
  }

  function initializeItemStates (type) {
    if (type === 'Action') {
      if (!detailsCtrl.itemProxy.item.hasOwnProperty('actionState')) {
        detailsCtrl.itemProxy.item.actionState = 'Proposed';
      }
      if (!detailsCtrl.itemProxy.item.hasOwnProperty('decisionState')) {
        detailsCtrl.itemProxy.item.decisionState = 'Proposed';
      }
    } else if (type === 'Decision') {
      if (!detailsCtrl.itemProxy.item.hasOwnProperty('decisionState')) {
        detailsCtrl.itemProxy.item.decisionState = 'Proposed';
      }
    } else if (type === 'Task') {
      if (!detailsCtrl.itemProxy.item.hasOwnProperty('taskState')) {
        detailsCtrl.itemProxy.item.taskState = 'Proposed';
      }
    } else if (type === 'Issue') {
      if (!detailsCtrl.itemProxy.item.hasOwnProperty('issueState')) {
        detailsCtrl.itemProxy.item.issueState = 'Observed';
      }
    }
  }

  detailsCtrl.createItem = function (navigationType) {
    detailsCtrl.itemProxy.model = ItemRepository
      .getProxyFor(detailsCtrl.itemProxy.kind);
    ItemRepository.upsertItem(detailsCtrl.itemProxy)
      .then(function (updatedItemProxy) {
        if (!detailsCtrl.itemProxy.updateItem) {
          // This was a create, so replace the itemProxy
          detailsCtrl.itemProxy = updatedItemProxy;
        }
        // clear the state of the form
        detailsCtrl.setFormsPristine();
        detailsCtrl.enableEdit = false;

        if (navigationType === 'parent') {
          detailsCtrl.updateTab('kohese.explore.edit', updatedItemProxy.item.parentId);
        } else if (navigationType === 'child') {
          detailsCtrl.updateTab('kohese.explore.edit', updatedItemProxy.item.id);
        }
      });
  };

  // This pipeline for navigating should possibly be modified to be more in 
  // line with the other views. This updateTab is unique to detailsView.
  // Currently this won't handle navigation with parentId it seems
  detailsCtrl.updateTab = function (state, id) {
    var data = id ? {id:id} : {};
    detailsCtrl.tab.setState(state, data);
    detailsCtrl.navigate(state, {id:id})
  };

  detailsCtrl.navigateToCreateForm = function () {
    var data = {
      parentId: detailsCtrl.itemProxy.item.id
    }
    if (detailsCtrl.tab.type === 'singleview') {
      detailsCtrl.tab.setState('kohese.create', data);
      $state.go('kohese.create', data)
    } else {
      if ($state.current.name === 'kohese.explore.edit' || $state.current.name === 'kohese.explore') {
        detailsCtrl.tab.setState('kohese.explore.create', data);
        $state.go('kohese.explore.create', data)
      } else if ($state.current.name === 'kohese.search' || $state.current.name === 'kohese.search.edit') {
        detailsCtrl.tab.setState('kohese.search.create', data);
        $state.go('kohese.search.create', data)
      }
    }
  };

  // This needs to go away. I don't like us having manual state transitions in
  // controllers. We need to centralize how we navigate to get the bundle and
  // tab situation in a maintable situation -- TO-DO JEP
  detailsCtrl.navigate = function (state, params) {
    if (state) {
      $state.go(state, params)
    } else {
      $state.go('kohese.explore.edit', params)
    }
  };

  detailsCtrl.newTab = function (state, params) {
    NavigationService.navigate(state, params);
  }

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
    console.log('::: Item kind has been changed to: ' + detailsCtrl.itemProxy.kind);
    initializeItemStates(detailsCtrl.itemProxy.kind);
  };

  detailsCtrl.incrementItemInput = function (type) {
    if(!detailsCtrl.itemProxy.item[type]) {
      detailsCtrl.itemProxy.item[type] = [];
    }
      
    if (type === 'context') {
      detailsCtrl.itemProxy.item[type].push({id: detailsCtrl.contextInput.description.id});
    } else if (type === 'resolutionActions') {
      detailsCtrl.itemProxy.item[type].push({id: detailsCtrl.resolutionActionsInput.description.id});
    } else {
      detailsCtrl.itemProxy.item[type].push({name: ''});
    }   
  };

  detailsCtrl.deleteItemInput = function (type, row) {
    var index = detailsCtrl.itemProxy.item[type].indexOf(row);
    detailsCtrl.itemProxy.item[type].splice(index, 1);
  };

  detailsCtrl.generateHTMLReport = function () {
    ItemRepository.generateHTMLReportFor(detailsCtrl.itemProxy);
  };

  detailsCtrl.generateDOCXReport = function () {
    ItemRepository.generateDOCXReportFor(detailsCtrl.itemProxy);
  };

  detailsCtrl.getHistory = function () {
    ItemRepository.getHistoryFor(detailsCtrl.itemProxy);
  };

  detailsCtrl.upsertItem = function () {
    ItemRepository.upsertItem(detailsCtrl.itemProxy)
      .then(function (updatedItemProxy) {
        // clear the state of the form
        detailsCtrl.setFormsPristine();
        detailsCtrl.enableEdit = false;
        $scope.$apply();
      });
  };

  detailsCtrl.showChildrenToggled = function () {
    detailsCtrl.docShowChildren = !detailsCtrl.docShowChildren;
    $scope.$broadcast('Show Children Toggled', detailsCtrl.docShowChildren);
  }

  $scope.$watch('detailsCtrl.itemProxy.item.description', function () {
    $scope.$broadcast('Proxy Description Updated', detailsCtrl.itemProxy);
    
    if (detailsCtrl.itemProxy && detailsCtrl.itemProxy.item.description){
      var parsed = reader.parse(detailsCtrl.itemProxy.item.description); // parsed is a 'Node' tree 
      detailsCtrl.itemDescriptionRendered = writer.render(parsed); // result is a String 
      detailsCtrl.itemDescriptionRendered = $sce.trustAsHtml(detailsCtrl.itemDescriptionRendered);
    }
  });

  function postDigest (callback) {
    var unregister = $scope.$watch(function () {
      unregister();
      $timeout(function () {
        callback();
      }, 0, false);
    });
  }
     
  detailsCtrl.setFormsPristine = function () {
    if (this.itemForm) {
      this.itemForm.$setPristine();
    }
    if (this.decisionForm) {
      this.decisionForm.$setPristine();
    }
    if (this.actionForm) {
      this.actionForm.$setPristine();
    }
    if (this.taskForm) {
      this.taskForm.$setPristine();
    }          
    if (this.observationForm) {
      this.observationForm.$setPristine();
    }
    if (this.issueForm) {
      this.issueForm.$setPristine();
    }
    if (this.repositoryForm) {
      this.repositoryForm.$setPristine();
    }              
  }
  
  detailsCtrl.cancel = function () {
    if (this.itemProxy.dirty) {
      ItemRepository.fetchItem(detailsCtrl.itemProxy)
        .then((fetchResults) => {
          this.setFormsPristine();
          $scope.$apply();
        });
    }
  };

  detailsCtrl.removeItem = function (proxy) {
    ItemRepository.deleteItem(proxy)
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

  function configureState () {
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
    } else {
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
