/**
 * Created by josh on 7/13/15.
 */


function DetailsViewController($state, $sce, $timeout, ItemRepository, analysisService, IssueService, NavigationService,
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
            detailsCtrl.itemProxy.kind = "Item";
            detailsCtrl.itemProxy.item.parentId = $stateParams.parentId;
        } else {
            detailsCtrl.itemProxy.item = {};
            detailsCtrl.itemProxy.kind = "Item";
        }
        detailsCtrl.updateParentProxy();
        detailsCtrl.tab = tabService.getCurrentTab();
        detailsCtrl.tab.route = $stateParams.id; // Likely duplicated logic, can probably refactor this to use tab param object
        detailsCtrl.filterString = "";
        detailsCtrl.filterTextTimeout;

        detailsCtrl.analysisFilterString = "";
        detailsCtrl.analysisFilterRegex = null;
        detailsCtrl.invalidAnalysisFilterRegex = false;
        detailsCtrl.summaryFilterExactMatch = true;
        detailsCtrl.summaryFilterIgnoreCase = true;

        detailsCtrl.analysisSummarySortField = ['-count', 'text'];
        detailsCtrl.analysisDetailsSortField = "";
        detailsCtrl.enableEdit = false;
        detailsCtrl.defaultTab = {active: true};
        detailsCtrl.showChunksInAnalysis = true;
        detailsCtrl.showTokensInAnalysis = true;
        detailsCtrl.showSentencesInDetails = true;
        detailsCtrl.showChunksInDetails = false;
        detailsCtrl.showTokensInDetails = false;
        detailsCtrl.analysisTokenLimit = 100;
        detailsCtrl.analysisChunkLimit = 100;
        detailsCtrl.analysisDetailsItemLimit = 1000;
        detailsCtrl.filterList = [];
        detailsCtrl.kindList = ItemRepository.getModelTypes();
        detailsCtrl.decisionStates = DecisionService.getDecisionStates();
        detailsCtrl.actionStates = ActionService.getActionStates();
        detailsCtrl.issueStates = IssueService.getIssueStates();
        detailsCtrl.categoryTags = CategoryService.getTags();
        detailsCtrl.userList = UserService.getAllUsers();
        detailsCtrl.currentUser = UserService.getCurrentUsername();
        detailsCtrl.proxyList = ItemRepository.getShortFormItemList();
        detailsCtrl.analysisFilterPOS = analysisService.filterPOS;
        detailsCtrl.analysisPOSFilterCriteria = analysisService.posFilterCriteria;
        detailsCtrl.analysisPOSFilterCriteriaList = Object.keys(analysisService.posFilterCriteria);
        detailsCtrl.analysisPOSFilterName = "Standard";
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
            if (detailsCtrl.itemProxy.item.description){
              var parsed = reader.parse(detailsCtrl.itemProxy.item.description); // parsed is a 'Node' tree 
              detailsCtrl.itemDescriptionRendered = writer.render(parsed); // result is a String 
              detailsCtrl.itemDescriptionRendered = $sce.trustAsHtml(detailsCtrl.itemDescriptionRendered);
              if(detailsCtrl.docShowChildren){
                var docParsed = docReader.parse(detailsCtrl.itemProxy.getDocument());
                detailsCtrl.docRendered = docWriter.render(docParsed);
                detailsCtrl.docRendered = $sce.trustAsHtml(detailsCtrl.docRendered);                
              }
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
  
    $scope.$watch('detailsCtrl.itemProxy.dirty', function () {
      if (detailsCtrl.itemProxy && detailsCtrl.itemForm){
        if(detailsCtrl.itemForm.$dirty !== detailsCtrl.itemProxy.dirty){
          // itemProxy has changed
          detailsCtrl.itemForm.$dirty = detailsCtrl.itemProxy.dirty;
        }
      }
    });

    $scope.$watch('detailsCtrl.itemForm.$dirty', function () {
      if (detailsCtrl.itemProxy && detailsCtrl.itemForm){
        
        // Detect if itemForm has been changed
        if (detailsCtrl.itemForm.$dirty) {
          detailsCtrl.itemProxy.dirty = detailsCtrl.itemForm.$dirty;
        }
        
        // Detect if existing proxy is already dirty
        if (!detailsCtrl.itemForm.$dirty && detailsCtrl.itemProxy.dirty){
          detailsCtrl.itemForm.$dirty = detailsCtrl.itemProxy.dirty;
        }
      }
    });
    
    $scope.$watch('detailsCtrl.decisionForm.$dirty', function () {
      if (detailsCtrl.itemProxy && detailsCtrl.decisionForm){

        // Detect if decisionForm has been changed
        if (detailsCtrl.decisionForm.$dirty) {
          detailsCtrl.itemForm.$dirty = detailsCtrl.decisionForm.$dirty;
        }
        
      }      
    });
    
    $scope.$watch('detailsCtrl.actionForm.$dirty', function () {
      if (detailsCtrl.itemProxy && detailsCtrl.actionForm){

        // Detect if actionForm has been changed
        if (detailsCtrl.actionForm.$dirty) {
          detailsCtrl.itemForm.$dirty = detailsCtrl.actionForm.$dirty;
        }
        
      }      
    });
    
    $scope.$watch('detailsCtrl.observationForm.$dirty', function () {
      if (detailsCtrl.itemProxy && detailsCtrl.observationForm){

        // Detect if observationForm has been changed
        if (detailsCtrl.observationForm.$dirty) {
          detailsCtrl.itemForm.$dirty = detailsCtrl.observationForm.$dirty;
        }
        
      }      
    });
    
    $scope.$watch('detailsCtrl.issueForm.$dirty', function () {
      if (detailsCtrl.itemProxy && detailsCtrl.issueForm){

        // Detect if actionForm has been changed
        if (detailsCtrl.issueForm.$dirty) {
          detailsCtrl.itemForm.$dirty = detailsCtrl.issueForm.$dirty;
        }
        
      }      
    });
    
    $scope.$watch('detailsCtrl.docShowChildren', function () {
      if(detailsCtrl.docShowChildren){
        var docParsed = docReader.parse(detailsCtrl.itemProxy.getDocument());
        detailsCtrl.docRendered = docWriter.render(docParsed);
        detailsCtrl.docRendered = $sce.trustAsHtml(detailsCtrl.docRendered);
      } else {
        detailsCtrl.docRendered = null;
      }
    });
    
    $scope.$watch('detailsCtrl.analysisFilterString', function () {
      console.log(">>> Filter string changed to: " + detailsCtrl.analysisFilterString);
      if (detailsCtrl.filterTextTimeout) {
        $timeout.cancel(detailsCtrl.filterTextTimeout);
      }
      
      detailsCtrl.filterTextTimeout = $timeout(function() {
        var regexFilter = /^\/(.*)\/([gimy]*)$/;
        var filterIsRegex = detailsCtrl.analysisFilterString.match(regexFilter);

        if (filterIsRegex) {
          try {
            detailsCtrl.analysisFilterRegex = new RegExp(filterIsRegex[1],filterIsRegex[2]);
            detailsCtrl.analysisFilterRegexHighlight = new RegExp('(' + filterIsRegex[1] + ')','g' + filterIsRegex[2]);
            detailsCtrl.invalidAnalysisFilterRegex = false;              
          } catch (e) {
            detailsCtrl.invalidAnalysisFilterRegex = true;
          }
        } else {
          let cleanedPhrase = detailsCtrl.analysisFilterString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          if(detailsCtrl.analysisFilterString !== ""){
            detailsCtrl.analysisFilterRegex = new RegExp(cleanedPhrase,"i");
            detailsCtrl.analysisFilterRegexHighlight = new RegExp('(' + cleanedPhrase + ')',"gi");
            detailsCtrl.invalidAnalysisFilterRegex = false;
          } else {
            detailsCtrl.analysisFilterRegex = null;
            detailsCtrl.analysisFilterRegexHighlight = null;
            detailsCtrl.invalidAnalysisFilterRegex = false;
          }
        }

        postDigest(function () {
            // Force one more update cycle to get the match count to display
            $scope.$apply();
        });
      }, 1000); // delay 1000 ms
    });

    detailsCtrl.uiTreeOptions = {
        dropped : function (event) {
          
          if (event.source.index != event.dest.index) {
            detailsCtrl.itemForm.$dirty = true;
            detailsCtrl.itemProxy.updateChildrenManualOrder();
            console.log("))) Source:    " + event.source);
            console.log("))) Source id: " + event.source.nodeScope.proxy.item.id);
            console.log("))) Dest   ns: " + event.dest.nodeScope);
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
        ItemRepository.upsertItem(detailsCtrl.itemProxy)
            .then(function (updatedItemProxy) {

                if (!detailsCtrl.itemProxy.updateItem){
                  // This was a create, so replace the itemProxy
                  detailsCtrl.itemProxy = updatedItemProxy;
                }
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
                    $state.go(NavigationService.getLastState(detailsCtrl.tab.id), {id: updatedItemProxy.item.parentId})
                } else if (navigationType === 'child') {
                    $state.go(NavigationService.getLastState(detailsCtrl.tab.id), {id: updatedItemProxy.item.id})
                }
            });
    };

    detailsCtrl.updateTab = function (state, id, view) {
        (id) ? detailsCtrl.tab.setState(state, {id: id}) : 
               detailsCtrl.tab.setState(state, {});
        detailsCtrl.navigate(state, id)
    };

    detailsCtrl.navigateToCreateForm = function () {
        var data = {
            parentId: detailsCtrl.itemProxy.item.id
        }
        if (detailsCtrl.tab.type === 'singleview') {
            detailsCtrl.tab.setState('kohese.create', data);
            $state.go('kohese.create', data)
        } 
        else {
            if ($state.current.name === 'kohese.explore.edit' || $state.current.name === 'kohese.explore') {
                detailsCtrl.tab.setState('kohese.explore.create', data);
                $state.go('kohese.explore.create', data)
            } 
            else if ($state.current.name === 'kohese.search' || $state.current.name === 'kohese.search.edit') {
                detailsCtrl.tab.setState('kohese.search.create', data);
                $state.go('kohese.search.create', data)
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
        console.log("::: Item kind has been changed to: " + detailsCtrl.itemProxy.kind);
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

    detailsCtrl.fetchAnalysis = function () {
      analysisService.fetchAnalysis(detailsCtrl.itemProxy).then(function (results){
        $scope.$apply();
      });
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
    
    detailsCtrl.submitSummaryFilter = function (onText) {
      
      if (detailsCtrl.summaryFilterExactMatch) {
        detailsCtrl.analysisFilterInput = "/\\b" + onText + "\\b/";
        if (detailsCtrl.summaryFilterIgnoreCase) {
          detailsCtrl.analysisFilterInput += "i";
        }
      } else {
        detailsCtrl.analysisFilterInput = onText;
      }
      
      detailsCtrl.filterList.push(detailsCtrl.analysisFilterString);
      detailsCtrl.analysisFilterString = detailsCtrl.analysisFilterInput;
    };
  
    detailsCtrl.filterTokens = function(summary) {
      return detailsCtrl.analysisFilterPOS(summary,detailsCtrl.analysisPOSFilterCriteria[detailsCtrl.analysisPOSFilterName]) && 
             ((detailsCtrl.analysisFilterRegex === null) || detailsCtrl.analysisFilterRegex.test(summary.text));
    };

    detailsCtrl.filterChunks = function(summary) {
      return detailsCtrl.analysisFilterPOS(summary,detailsCtrl.analysisPOSFilterCriteria[detailsCtrl.analysisPOSFilterName]) && 
             ((detailsCtrl.analysisFilterRegex === null) || detailsCtrl.analysisFilterRegex.test(summary.text));
    };

    detailsCtrl.filterDetails = function(listItem) {
        return ((listItem.displayLevel == 1) && 
                ((detailsCtrl.analysisFilterRegex === null) || 
                 (detailsCtrl.analysisFilterRegex.test(listItem.item.name)) || 
                 (detailsCtrl.analysisFilterRegex.test(listItem.item.description)))) || 
               (((listItem.displayLevel == 2) && detailsCtrl.showSentencesInDetails) || 
                ((listItem.displayLevel == 3) && detailsCtrl.showChunksInDetails) || 
                ((listItem.displayLevel == 4) && detailsCtrl.showTokensInDetails)
                ) &&
                ((detailsCtrl.analysisFilterRegex === null) || detailsCtrl.analysisFilterRegex.test(listItem.text));
    };

    detailsCtrl.getTokenCount = function () {
      return $('#theTokensBody').find("tr").length;
    };

    detailsCtrl.getChunkCount = function () {
      return $('#theChunksBody').find("tr").length;
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
    
    $scope.$watch('detailsCtrl.itemProxy.item.description', function () {
      if (detailsCtrl.itemProxy && detailsCtrl.itemProxy.item.description){
        var parsed = reader.parse(detailsCtrl.itemProxy.item.description); // parsed is a 'Node' tree 
        detailsCtrl.itemDescriptionRendered = writer.render(parsed); // result is a String 
        detailsCtrl.itemDescriptionRendered = $sce.trustAsHtml(detailsCtrl.itemDescriptionRendered);
        if(detailsCtrl.docShowChildren){
          var docParsed = docReader.parse(detailsCtrl.itemProxy.getDocument());
          detailsCtrl.docRendered = docWriter.render(docParsed);
          detailsCtrl.docRendered = $sce.trustAsHtml(detailsCtrl.docRendered);                
        }
      }
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

        if (this.itemProxy.dirty) {
            ItemRepository.fetchItem(detailsCtrl.itemProxy)
            .then((fetchResults) => {
                this.itemForm.$setPristine();
                if (this.decisionForm){
                  this.decisionForm.$setPristine();
                }
                if (this.actionForm){
                  this.actionForm.$setPristine();
                }
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
