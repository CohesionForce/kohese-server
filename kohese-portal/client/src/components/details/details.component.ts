import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { TabService } from '../../services/tab/tab.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

import { ItemProxy } from '../../../../common/models/item-proxy.js';
import { SessionService } from '../../services/user/session.service';

import * as commonmark from 'commonmark';
import { HtmlRenderer, Parser } from 'commonmark';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector : 'details-view',
  templateUrl : './details.component.html'
})

export class DetailsComponent extends NavigatableComponent
                              implements OnInit, OnDestroy {
  itemProxyId : string;
  itemProxy : ItemProxy;
  parentProxy : ItemProxy;
  typeProxies : Array<ItemProxy>;

  /* Commonmark items */
  reader : Parser;
  writer : HtmlRenderer;

  /* Observables */
  showChildrenSubject : BehaviorSubject<boolean>

  /* Subscriptions */
  routeSub : Subscription;
  repoReadySub : Subscription;

  /* UI Switches */
  enableEdit : boolean;
  defaultTab : object;
  uiTreeOptions : object;
  showChildren : boolean;

  /* UI Components */
  contextInput;
  resolutionActionsInput;

  /* Data */
  kindList : Array<string>;
  decisionStates : Array<string>;
  actionStates : Array<string>;
  issueStates : Array<string>;
  categoryTags : Array<string>;
  userList : Array<any>
  currentUser : any;
  proxyList : Array<any>;
  itemDescriptionRendered : string;



  constructor (protected NavigationService : NavigationService,
               protected TabService : TabService,
               private route : ActivatedRoute,
               private ItemRepository : ItemRepository,
               private SessionService : SessionService) {
    super(NavigationService, TabService);
    }

  ngOnInit () {
    this.reader = new commonmark.Parser();
    this.writer = new commonmark.HtmlRenderer();
    this.showChildren = true;
    this.showChildrenSubject = new BehaviorSubject(this.showChildren);

    // TODO Implement controller restored?
    //   var controllerRestored = tabService.restoreControllerData(detailsCtrl.tab.id, 'detailsCtrl', this);

    /* Subscriptions */
    this.routeSub = this.route.params.subscribe(params => {
      this.itemProxyId = params['id'];
      // TODO Before we were doing an additional check for parent id to determine
      // if this was a create case. Decided to not port this over in favor of another solution
      // Assess if this is correct and remove TODO
      this.repoReadySub = this.ItemRepository.getRepoStatusSubject()
      .subscribe(update => {
        if (update.connected) {
          this.itemProxy = this.ItemRepository.getProxyFor(this.itemProxyId);
          if (!this.itemProxy) {
            // TODO : Throw error modal to the UI
          }
          let modelProxy : ItemProxy = this.ItemRepository.getProxyFor('Model-Definitions');
          this.typeProxies = modelProxy.getDescendants();
          this.proxyList = this.ItemRepository.getShortFormItemList();
          this.userList = this.SessionService.getUsers();
          this.updateParentProxy();
          this.configureState();
          if (this.itemProxy.item.description) {
            let parsed = this.reader.parse(this.itemProxy.item.description);
            this.itemDescriptionRendered = this.writer.render(parsed);
            // TODO Determine if we need to run this through something like $sce
          }
        }
      })
    });


    // TODO - Add subscription to the description field of the proxy form and
    // call the document render logic on it

    /* End Subscriptions */


    this.enableEdit = false;
    this.defaultTab = {active: true }
    /* TODO Update this to use User Defined types */
    this.decisionStates = [];
    this.actionStates = [];
    this.issueStates = [];
    this.categoryTags = [];

    this.uiTreeOptions = {
      dropped: (event) => {
        if (event.source.index != event.dest.index) {
          //this.itemForm.$dirty = true;
          this.itemProxy.updateChildrenManualOrder();
          console.log('))) Source:    ' + event.source);
          console.log('))) Source id: ' + event.source.nodeScope.proxy.item.id);
          console.log('))) Dest   ns: ' + event.dest.nodeScope);
        }
      }
    }
  }

  ngOnDestroy () {
    this.routeSub.unsubscribe();
    this.repoReadySub.unsubscribe();

    // TODO - implement bundle logic here
  }

  updateParentProxy () : void {
        if (this.itemProxy && this.itemProxy.item.parentId) {
          this.parentProxy = this.ItemRepository.getProxyFor(this.itemProxy.item.parentId);
        } else {
          this.parentProxy = {};
        }
      };

  getProxyFor(id) : any {
      return this.ItemRepository.getProxyFor(id);
    }

  initializeItemStates (type : string) : void {
      // TODO - Don't know how I feel about this implementation
      // Revisit after initial port
      if (type === 'Action') {
        if (!this.itemProxy.item.hasOwnProperty('actionState')) {
          this.itemProxy.item.actionState = 'Proposed';
        }
        if (!this.itemProxy.item.hasOwnProperty('decisionState')) {
          this.itemProxy.item.decisionState = 'Proposed';
        }
      } else if (type === 'Decision') {
        if (!this.itemProxy.item.hasOwnProperty('decisionState')) {
          this.itemProxy.item.decisionState = 'Proposed';
        }
      } else if (type === 'Task') {
        if (!this.itemProxy.item.hasOwnProperty('taskState')) {
          this.itemProxy.item.taskState = 'Proposed';
        }
      } else if (type === 'Issue') {
        if (!this.itemProxy.item.hasOwnProperty('issueState')) {
          this.itemProxy.item.issueState = 'Observed';
        }
      }
    }

  incrementItemInput (type) : void {
      if(!this.itemProxy.item[type]) {
        this.itemProxy.item[type] = [];
      }

        // TODO - This needs to be assessed
        if (type === 'context') {
          this.itemProxy.item[type].push({id: this.contextInput.description.id});
        } else if (type === 'resolutionActions') {
          this.itemProxy.item[type].push({id: this.resolutionActionsInput.description.id});
        } else {
          this.itemProxy.item[type].push({name: ''});
        }
    }

  deleteItemInput (type : string, row : number): void {
        var index = this.itemProxy.item[type].indexOf(row);
        this.itemProxy.item[type].splice(index, 1);
    }

  generateHTMLReport () : void {
        this.ItemRepository.generateHTMLReportFor(this.itemProxy);
      };

  generateDOCXReport () : void {
        this.ItemRepository.generateDOCXReportFor(this.itemProxy);
      };

  getHistory = function () : void {
        this.ItemRepository.getHistoryFor(this.itemProxy);
      };

  upsertItem = function () : void {
        this.ItemRepository.upsertItem(this.itemProxy)
          .then(function (updatedItemProxy) {
            // clear the state of the form
            // TODO - Get form and set pristine
          });
      };

  showChildrenToggled () : void {
      this.showChildrenSubject.next(this.showChildren);
    }

  cancel () : void {
    if (this.itemProxy.dirty) {
      this.ItemRepository.fetchItem(this.itemProxy)
        .then((fetchResults) => {
          // TODO - Get form and set pristine
        });
    }
  };

  removeItem (proxy : ItemProxy) : void {
    this.ItemRepository.deleteItem(proxy, false)
      .then(function () {
        // TBD:  May need to do something special if the delete fails
      });
  };
  updateState = function (state : string, type : string) {
    // TODO - This functionality is trash and needs to be updated,
    //        The general flow will update with user defined types, so deferring

    // detailsCtrl.currentState = state;
    // if (type === 'Decision') {
    //   detailsCtrl.itemProxy.item.decisionState = state;
    //   if (detailsCtrl.itemProxy.item.decisionState === 'In Analysis') {
    //     detailsCtrl.accordion.InAnalysis = true;
    //   } else if (detailsCtrl.itemProxy.item.decisionState === 'In Review') {
    //     detailsCtrl.accordion.InReview = true;
    //   } else {
    //     detailsCtrl.accordion[detailsCtrl.itemProxy.item.decisionState] = true;
    //   }
    // } else if (type === 'Action') {
    //   if (detailsCtrl.itemProxy.item.actionState === 'In Work') {
    //     detailsCtrl.accordion.InWork = true;
    //   } else if (detailsCtrl.itemProxy.item.actionState === 'In Verification') {
    //     detailsCtrl.accordion.InVerification = true;
    //   } else {
    //     detailsCtrl.accordion[state] = true;
    //   }
    //   detailsCtrl.itemProxy.item.actionState = state;
    // } else if (type === 'Task') {
    //   detailsCtrl.itemProxy.item.taskState = state;
    // }
    // detailsCtrl.currentState = state;
    // detailsCtrl.upsertItem();
    console.log('Update state called - not implemented');
  };

  configureState () {
  // TODO - This functionality is trash and needs to be updated,
  //        The general flow will update with user defined types, so deferring

    //   function configureState () {
  //     detailsCtrl.accordion = {};
  //     if (detailsCtrl.itemProxy.item.actionState === 'Proposed'
  //             && detailsCtrl.itemProxy.item.decisionState != 'Proposed') {
  //       if (detailsCtrl.itemProxy.item.decisionState === 'In Analysis') {
  //         detailsCtrl.accordion.InAnalysis = true;
  //         detailsCtrl.currentState = detailsCtrl.itemProxy.item.decisionState
  //       }
  //       if (detailsCtrl.itemProxy.item.decisionState === 'In Review') {
  //         detailsCtrl.accordion.InReview = true;
  //         detailsCtrl.currentState = detailsCtrl.itemProxy.item.decisionState
  //       } else {
  //         detailsCtrl.accordion[detailsCtrl.itemProxy.item.decisionState] = true;
  //         detailsCtrl.currentState = detailsCtrl.itemProxy.item.decisionState
  //       }
  //     } else {
  //       if (detailsCtrl.itemProxy.item.actionState != 'In Work'
  //                 && detailsCtrl.itemProxy.item.actionState != 'Pending Reassign') {
  //         detailsCtrl.accordion[detailsCtrl.itemProxy.item.actionState] = true;
  //         detailsCtrl.currentState = detailsCtrl.itemProxy.item.actionState;
  //       } else {
  //         if (detailsCtrl.itemProxy.item.actionState === 'In Work') {
  //           detailsCtrl.accordion.InWork = true;
  //           detailsCtrl.currentState = detailsCtrl.itemProxy.item.actionState;
  //         }
  //         if (detailsCtrl.itemProxy.item.actionState === 'In Verification') {
  //           detailsCtrl.accordion.InVerification = true;
  //           detailsCtrl.currentState = detailsCtrl.itemProxy.item.actionState;
  //         }
  //       }
  //     }
  //   }
  }



  /* TODO - Implementation Graveyard
  //   $scope.$watch('detailsCtrl.itemProxy.dirty', function () {
  //     if (detailsCtrl.itemProxy && detailsCtrl.itemForm) {
  //       if(detailsCtrl.itemForm.$dirty !== detailsCtrl.itemProxy.dirty) {
  //         // itemProxy has changed
  //         detailsCtrl.itemForm.$dirty = detailsCtrl.itemProxy.dirty;
  //       }
  //     }
  //   });

  //   $scope.$watch('detailsCtrl.itemForm.$dirty', function () {
  //     if (detailsCtrl.itemProxy && detailsCtrl.itemForm) {
  //       // Detect if itemForm has been changed
  //       if (detailsCtrl.itemForm.$dirty) {
  //         detailsCtrl.itemProxy.dirty = detailsCtrl.itemForm.$dirty;
  //       }

  //       // Detect if existing proxy is already dirty
  //       if (!detailsCtrl.itemForm.$dirty && detailsCtrl.itemProxy.dirty) {
  //         detailsCtrl.itemForm.$dirty = detailsCtrl.itemProxy.dirty;
  //       }
  //     }
  //   });

  //   $scope.$watch('detailsCtrl.decisionForm.$dirty', function () {
  //     if (detailsCtrl.itemProxy && detailsCtrl.decisionForm) {
  //       // Detect if decisionForm has been changed
  //       if (detailsCtrl.decisionForm.$dirty) {
  //         detailsCtrl.itemForm.$dirty = detailsCtrl.decisionForm.$dirty;
  //       }
  //     }
  //   });

  //   $scope.$watch('detailsCtrl.actionForm.$dirty', function () {
  //     if (detailsCtrl.itemProxy && detailsCtrl.actionForm) {
  //       // Detect if actionForm has been changed
  //       if (detailsCtrl.actionForm.$dirty) {
  //         detailsCtrl.itemForm.$dirty = detailsCtrl.actionForm.$dirty;
  //       }
  //     }
  //   });

  //   $scope.$watch('detailsCtrl.observationForm.$dirty', function () {
  //     if (detailsCtrl.itemProxy && detailsCtrl.observationForm) {
  //       // Detect if observationForm has been changed
  //       if (detailsCtrl.observationForm.$dirty) {
  //         detailsCtrl.itemForm.$dirty = detailsCtrl.observationForm.$dirty;
  //       }
  //     }
  //   });

  //   $scope.$watch('detailsCtrl.issueForm.$dirty', function () {
  //     if (detailsCtrl.itemProxy && detailsCtrl.issueForm) {
  //       // Detect if actionForm has been changed
  //       if (detailsCtrl.issueForm.$dirty) {
  //         detailsCtrl.itemForm.$dirty = detailsCtrl.issueForm.$dirty;
  //       }
  //     }
  //   });


  //   detailsCtrl.updateItem = function () {
  //     console.log('::: Item kind has been changed to: ' + detailsCtrl.itemProxy.kind);
  //     initializeItemStates(detailsCtrl.itemProxy.kind);
  //   };
  */

    //   //
  //   // Datepicker config
  //   //

  //   detailsCtrl.estimatedStart = false;
  //   detailsCtrl.dateOptions = {
  //     formatYear: 'yy'
  //   };

  //   detailsCtrl.openDatePicker = function ($event, type) {
  //     detailsCtrl.date = new Date(detailsCtrl.itemProxy.item.estimatedStart);
  //     if ($event) {
  //       $event.preventDefault();
  //       $event.stopPropagation();
  //     }
  //     detailsCtrl[type] = true;
  //   };

  //   detailsCtrl.convertDate = function (type, end) {
  //     var date = new Date(detailsCtrl.itemProxy.item[type]);
  //     if (end) {
  //       // shame.js - I need to refactor this magic number
  //       detailsCtrl.itemProxy.item[type] = date.valueOf() + 86399;
  //     } else {
  //       detailsCtrl.itemProxy.item[type] = date.valueOf();
  //     }
  //   };

  /////////////////////////////////////////////////////////////////////////////

}
