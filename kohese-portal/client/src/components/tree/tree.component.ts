import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { TabService } from '../../services/tab/tab.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { VersionControlService } from '../../services/version-control/version-control.service';
import { SessionService } from '../../services/user/session.service';
import { Tab } from '../../services/tab/Tab.class';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { ItemProxy } from '../../../../common/models/item-proxy.js';
import { ProxyFilter } from '../../classes/ProxyFilter.class';

import * as $ from 'jquery';

@Component({
  selector : 'tree-view',
  templateUrl : './tree.component.html'
})

export class TreeComponent extends NavigatableComponent
                              implements OnInit, OnDestroy {
    /* UI Toggles */
    allExpanded : boolean;
    locationSynced : boolean;
    isRootDefault : boolean;
    versionControlEnabled : boolean;
    collapsed : Object;

    /* Data */
    treeRoot : ItemProxy;
    absoluteRoot : ItemProxy;
    filter : ProxyFilter; // TODO get definition for Filter
    selectedItemProxy : ItemProxy;
    itemProxyId : string;
    kindList : Array<String>;
    actionStates : Array<String>;
    userList : Array<any>; // This will eventually be of type KoheseUser
    previouslyExpanded ; // TODO Assess if this is needed
    viewList : Array<String>;
    viewType : String;

    /* Observables */
    filterSubject : BehaviorSubject<ProxyFilter>;


    /* Subscriptions */
    currentTabSub : Subscription;
    repoStatusSub : Subscription;
    routeSub : Subscription;

  constructor (protected NavigationService : NavigationService,
               protected TabService : TabService,
               private ItemRepository : ItemRepository,
               private VersionControlService : VersionControlService,
               private SessionService : SessionService,
               private route : ActivatedRoute) {
    super(NavigationService, TabService);
    }

  ngOnInit () {
    // TODO - Test component restoration logic
    this.currentTabSub = this.TabService.getCurrentTab()
      .subscribe(currentTab => this.tab = currentTab);
    this.repoStatusSub = this.ItemRepository.getRepoStatusSubject()
      .subscribe(update => {
        if (update.connected) {
          this.treeRoot = this.ItemRepository.getRootProxy();
          this.absoluteRoot = this.treeRoot;
          this.collapsed = {};
          for (let itemProxy of this.treeRoot.children) {
            this.collapsed[itemProxy.id] = false;
          }

        }
      })
    this.routeSub = this.route.params.subscribe(params => {
      this.itemProxyId = params['id'];
    })

    this.kindList = this.ItemRepository.getModelList();
    this.actionStates = ['Pending Review', 'In Verification', 'Assigned'];
    this.userList = this.SessionService.getUsers();
    this.previouslyExpanded = {};
    this.allExpanded = false;
    this.locationSynced = false;
    this.isRootDefault = true;
    this.selectedItemProxy = {};
    this.versionControlEnabled = false;
    this.filter = new ProxyFilter();
    this.filterSubject = new BehaviorSubject(this.filter);

    // NEW View Control
    this.viewList = ['Default','Version Control']; // TODO : Probably want to get this from somewhere else so
    // view types can be pulled based on version of Kohese
    this.viewType = 'Default';



    // TODO set up @output/@input listeners for selectedItemProxy and row objects

    // TODO set up sync listener functionality
  }

  ngOnDestroy () {
    this.currentTabSub.unsubscribe();
    this.repoStatusSub.unsubscribe();
  }


// /*
// /**
//  * Created by josh on 7/13/15.
//  */

// function KTreeController (ItemRepository, ActionService, UserService, $timeout, $anchorScroll, $state,
//   $scope, $location, $stateParams, SearchService, tabService, VersionControlService,
//   ModalService) {


  // TODO Port this watch functionality
  // $scope.$watch('this.filter.text', function () {
  //   if (filterTextTimeout) {
  //     $timeout.cancel(filterTextTimeout);
  //   }

  //   filterTextTimeout = $timeout(function () {
  //     var regexFilter = /^\/(.*)\/([gimy]*)$/;
  //     var filterIsRegex = this.filter.text.match(regexFilter);

  //     if (filterIsRegex) {
  //       try {
  //         this.filter.textRegex = new RegExp(filterIsRegex[1],filterIsRegex[2]);
  //         this.filter.textRegexHighlight = new RegExp('(' + filterIsRegex[1] + ')','g' + filterIsRegex[2]);
  //         this.filter.invalidRegex = false;
  //       } catch (e) {
  //         this.filter.invalidRegex = true;
  //       }
  //     } else {
  //       let cleanedPhrase = this.filter.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  //       if(this.filter.text !== '') {
  //         this.filter.textRegex = new RegExp(cleanedPhrase,'i');
  //         this.filter.textRegexHighlight = new RegExp('(' + cleanedPhrase + ')','gi');
  //         this.filter.invalidRegex = false;
  //       } else {
  //         this.filter.textRegex = null;
  //         this.filter.textRegexHighlight = null;
  //         this.filter.invalidRegex = false;
  //       }
  //     }


  getItemCount () {
    return $('#theKT').find('.kt-item').length;
  };

  getItemMatchedCount () {
    return $('#theKT').find('.kti-filterMatched').length;
  };

  getTypeForFilter (val) {
    return val === null ? 'null' : typeof val;
  }

  matchesFilter (proxy, exact) {
    if (exact === undefined) {
      exact = false;
    }

    if (this.filter.textRegex === null && !this.filter.kind && !this.filter.status && !this.filter.dirty) {
      return !exact;
    } else {
      if (this.filter.status && (!proxy.status || proxy.status && proxy.status.length === 0)) {
        return false;
      }
      if (this.filter.dirty && !proxy.dirty) {
        return false;
      }
      if (this.filter.kind) {
        if (proxy.kind !== this.filter.kind) {
          return false;
        }
        if (this.filter.actionState && proxy.item.actionState !== this.filter.actionState) {
          return false;
        }
        if (this.filter.actionAssignee && proxy.item.assignedTo !== this.filter.actionAssignee) {
          return false;
        }
      }

      if (this.filter.textRegex === null) {
        return true;
      }

      for (var key in proxy.item) {
        if (key.charAt(0) !== '$' && this.getTypeForFilter(proxy.item[key]) === 'string' && proxy.item[key].match(this.filter.textRegex)) {
          return true;
        }
      }
      return false;
    }
  };

  childMatchesFilter (proxy) : boolean {
    for (var childIdx = 0; childIdx < proxy.children.length; childIdx++) {
      var childProxy = proxy.children[childIdx];
      if (this.matchesFilter(childProxy, null) || this.childMatchesFilter(childProxy)) {
        // exit as soon as the first matching descendant is found
        return true;
      }
    }
    // no descendant found
    return false;
  };

  proxyOrChildMatchesFilter (proxy) {
    return this.matchesFilter(proxy, null) || this.childMatchesFilter(proxy);
  }

  // Root handlers
  updateRoot (newRoot) {
    this.treeRoot = newRoot;
    this.isRootDefault = false;
  };

  upLevel () {
    if (!this.isRootDefault) {
      this.treeRoot = this.treeRoot.parentProxy;
      this.isRootDefault = this.treeRoot === this.absoluteRoot;
      console.log('::: Setting root to ' + this.treeRoot.item.name);
    }
  };

  resetRoot () {
    this.treeRoot = this.absoluteRoot;
    this.isRootDefault = true;
  };

  removeItem (proxy) {
    var itemId = proxy.item.id;
    var modalDefaults = {};

    // TODO Figure out Modal situation
    // if (proxy.children.length > 0) {
    //   modalDefaults.templateUrl = ModalService.DELETE_TEMPLATE;
    // }

    // var modalOptions = {
    //   closeButtonText : 'Cancel',
    //   actionButtonText : 'Delete',
    //   headerText: 'Delete "' + proxy.item.name + '"?',
    //   bodyText: 'Are you sure you want to delete this item?'
    // }

    // ModalService.showModal(modalDefaults, modalOptions).then((result)=> {
    //   if (!result.deleteChildren) {
    //     result.deleteChildren = false;
    //   }
    // TEMPORARY
    let result = {
      deleteChildren : false
    }
    // TEMPORARY

      this.ItemRepository
        .deleteItem(proxy, result.deleteChildren).then(function () {
          console.log('::: Item has been deleted: ' + itemId);
        });

  };

  // TODO - figure this out
  initCollapsed (itemId) {
    if (this.collapsed[itemId] === undefined) {
      this.collapsed[itemId] = !this.allExpanded;
    }
  }

  expandSyncedNodes () {
    if (this.selectedItemProxy) {
      var ancestorProxy = this.selectedItemProxy.parentProxy;
      while(ancestorProxy && ancestorProxy !== this.treeRoot) {
        if(this.collapsed[ancestorProxy.item.id] === undefined || this.collapsed[ancestorProxy.item.id]) {
          this.collapsed[ancestorProxy.item.id] = false;
        }
        ancestorProxy = ancestorProxy.parentProxy;
      }

      // TODO : Figure out anchor scrolling in Ng2
      // $location.hash(this.selectedItemProxy.item.id);
      // $anchorScroll();
      // postDigest(function () {
      //   // Force one more update cycle to update display
      //   $scope.$apply();
      //   $anchorScroll();
      // });
    }
  }

  // TODO - Figure out the sync listener along with the anchor scroll dive
  // syncListener = $scope.$on('syncItemLocation', function onNewItemSelectedHandler (event, data) {
  //   console.log('::: Sync Item:' + data);
  //   this.selectedItemProxy = ItemRepository.getProxyFor(data);

  //   if (this.locationSynced) {
  //     this.expandSyncedNodes();
  //   }
  // });

  // syncLocation () {
  //   this.locationSynced = !this.locationSynced;
  //   if(this.locationSynced) {
  //     this.expandSyncedNodes();
  //   }
  // };


  /******** List expansion functions */
  expandAll (): void {
    this.allExpanded = true;
    for (var key in this.collapsed) {
      this.collapsed[key] = false;
    }
  };

  expandFiltered () : void {
    this.expandMatchingChildren(this.treeRoot);
  };

  collapseAll () : void {
    this.allExpanded = false;
    for (var key in this.collapsed) {
      this.collapsed[key] = true;
    }
  };

  expandMatchingChildren (itemProxy) : void {
    var childrenList = itemProxy.children;
    this.collapsed[itemProxy.item.id] = false;
    for (var i = 0; i < childrenList.length; i++) {
      var proxy = childrenList[i];
      if (this.proxyOrChildMatchesFilter(proxy)) {
        this.expandMatchingChildren(proxy);
      }
    }
  };

  /****** End list expansion functions */

  createChildOfSelectedItem () {
    this.addTab('Create', {parentId: this.selectedItemProxy.item.id})
  };

  /* Called when the user changes views of the tree */
  onViewTypeChanged () {
    console.log(this.viewType);
    switch (this.viewType) {
    case 'Version Control':
      this.filter.status = true;
      this.filter.dirty = false;
      this.versionControlEnabled = true;
      this.expandFiltered()
      break;
    default :
      this.filter.status = false;
      this.filter.dirty = false;
      this.versionControlEnabled = false;
    }
  }
}

