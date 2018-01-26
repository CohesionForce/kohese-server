import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { VersionControlService } from '../../services/version-control/version-control.service';
import { SessionService } from '../../services/user/session.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { ItemProxy } from '../../../../common/models/item-proxy.js';
import { ProxyFilter } from '../../classes/ProxyFilter.class';
import { RowComponent } from '../../classes/RowComponent.class';
import { MatSelectChange } from '@angular/material';

import * as $ from 'jquery';

let treeRoot: ItemProxy;
let isRootDefault: boolean = true;
let rows: Array<TreeRowComponent> = [];
let expandUponInstantiation: boolean = false;
let versionControlEnabled: boolean = false;

@Component({
  selector : 'tree-view',
  templateUrl : './tree.component.html'
})
export class TreeComponent extends NavigatableComponent
                              implements OnInit, OnDestroy {
    /* UI Toggles */
    private locationSynced: boolean = false;

    /* Data */
    private absoluteRoot : ItemProxy;
    private proxyFilter: ProxyFilter = new ProxyFilter(); // TODO get definition for Filter
    private selectedItemProxy: ItemProxy;
    private itemProxyId : string;
    private kindList: Array<ItemProxy>;
    private actionStates: Array<String> = ['Pending Review', 'In Verification', 'Assigned'];
    private userList : Array<any>; // This will eventually be of type KoheseUser
    // TODO Probably want to get this from somewhere else
    private viewList: Array<String> = ['Default','Version Control'];
    private readonly NO_KIND_SPECIFIED: string = '---';

    /* Observables */
    private filterSubject : BehaviorSubject<ProxyFilter>;

    /* Subscriptions */
    private currentTabSub : Subscription;
    private repoStatusSub : Subscription;
    private routeSub : Subscription;

  constructor (protected NavigationService : NavigationService,
               private ItemRepository : ItemRepository,
               private VersionControlService : VersionControlService,
               private SessionService : SessionService,
               private route : ActivatedRoute) {
    super(NavigationService);
  }

  ngOnInit(): void {
    // TODO - Test component restoration logic
    this.repoStatusSub = this.ItemRepository.getRepoStatusSubject()
      .subscribe(update => {
      if (update.connected) {
        treeRoot = this.ItemRepository.getRootProxy();
        this.absoluteRoot = treeRoot;
        this.kindList = this.ItemRepository.getProxyFor('Model-Definitions').
        getDescendants().sort((first: ItemProxy, second: ItemProxy) => {
        return ((first.item.name > second.item.name) ?
          1 : ((first.item.name < second.item.name) ? -1 : 0));
        });
      }
    });
    this.routeSub = this.route.params.subscribe(params => {
      this.itemProxyId = params['id'];
    });

    this.userList = this.SessionService.getUsers();
    this.filterSubject = new BehaviorSubject(this.proxyFilter);

    // TODO set up @output/@input listeners for selectedItemProxy and row objects

    // TODO set up sync listener functionality
  }

  ngOnDestroy(): void {
    this.currentTabSub.unsubscribe();
    this.repoStatusSub.unsubscribe();
  }

  filter(): void {
    let regexFilter: RegExp = new RegExp('^\/(.*)\/([gimy]*)$');
    let filterIsRegex: any = this.proxyFilter.text.match(regexFilter);

    if (filterIsRegex) {
      try {
        this.proxyFilter.textRegex = new RegExp(filterIsRegex[1], filterIsRegex[2]);
        this.proxyFilter.textRegexHighlight = new RegExp('(' + filterIsRegex[1] + ')', 'g' + filterIsRegex[2]);
        this.proxyFilter.invalidRegex = false;
      } catch (e) {
        this.proxyFilter.invalidRegex = true;
      }
    } else {
      let cleanedPhrase: string = this.proxyFilter.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if(this.proxyFilter.text !== '') {
        this.proxyFilter.textRegex = new RegExp(cleanedPhrase, 'i');
        this.proxyFilter.textRegexHighlight = new RegExp('(' + cleanedPhrase + ')', 'gi');
        this.proxyFilter.invalidRegex = false;
      } else {
        this.proxyFilter.textRegex = null;
        this.proxyFilter.textRegexHighlight = null;
        this.proxyFilter.invalidRegex = false;
      }
    }
  }

  getItemCount () {
    return $('#theKT').find('.kt-item').length;
  }

  getItemMatchedCount () {
    return $('#theKT').find('.kti-filterMatched').length;
  }

  getTypeForFilter (val) {
    return val === null ? 'null' : typeof val;
  }

  upLevel(): void {
    if (!isRootDefault) {
      treeRoot = treeRoot.parentProxy;
      isRootDefault = (treeRoot === this.absoluteRoot);
      console.log('::: Setting root to ' + treeRoot.item.name);
    }
  }

  resetRoot(): void {
    treeRoot = this.absoluteRoot;
    isRootDefault = true;
  }

  expandSyncedNodes(): void {
    /*if (this.selectedItemProxy) {
      var ancestorProxy = this.selectedItemProxy.parentProxy;
      while(ancestorProxy && ancestorProxy !== treeRoot) {
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
    }*/
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
  expandAll(): void {
    for (let j: number = 0; j < rows.length; j++) {
      rows[j].expand(true);
    }
  }

  expandFiltered(): void {
    //this.expandMatchingChildren(treeRoot);
  }

  collapseAll(): void {
    for (let j: number = 0; j < rows.length; j++) {
      rows[j].expand(false);
    }
  }

  /*collapseChildren(itemProxy: ItemProxy): void {
    var childrenList = itemProxy.getDescendants();
    this.collapsed[itemProxy.item.id] = true;
    for (var i = 0; i < childrenList.length; i++) {
      var proxy = childrenList[i];
      this.collapsed[proxy.item.id] = true;
    }
  }*/

  /*expandChildren(itemProxy: ItemProxy): void {
    var childrenList = itemProxy.getDescendants();
    this.collapsed[itemProxy.item.id] = false;
    for (var i = 0; i < childrenList.length; i++) {
      var proxy = childrenList[i];
      this.collapsed[proxy.item.id] = false;
    }
  }*/

  /****** End list expansion functions */

  createChildOfSelectedItem(): void {
    this.navigate('Create', {parentId: this.selectedItemProxy.item.id});
  }

  viewSelectionChanged(selection: MatSelectChange): void {
    switch (selection.value) {
      case 'Version Control':
        this.proxyFilter.status = true;
        this.proxyFilter.dirty = false;
        versionControlEnabled = true;
        this.expandFiltered();
        break;
      default :
        this.proxyFilter.status = false;
        this.proxyFilter.dirty = false;
        versionControlEnabled = false;
    }
  }

  kindFilterChanged(selection: MatSelectChange): void {
    if (selection.value) {
      this.proxyFilter.kind = selection.value.kind;
    } else {
      this.proxyFilter.kind = undefined;
    }
  }
  
  getTreeRoot(): ItemProxy {
    return treeRoot;
  }
  
  isRootDefault(): boolean {
    return isRootDefault;
  }
}

@Component({
  selector: 'tree-row',
  templateUrl: './tree-row.component.html'
})
export class TreeRowComponent extends RowComponent
  implements OnInit, OnDestroy {
  /* UI Triggers
     RowComponent : exactFilter
                    collapsed */

  /* Observables
     RowComponent : filterSubject */

  /* Subscriptions */
  private filterSubscription : Subscription;

  constructor(NavigationService : NavigationService,
    private dialogService: DialogService,
    private itemRepository: ItemRepository,
    private versionControlService: VersionControlService) {
    super(NavigationService);
  }

  ngOnInit(): void {
    rows.push(this);
    this.filterSubscription = this.filterSubject.subscribe((newFilter) => {
      this.filter = newFilter;
    });
  }

  ngOnDestroy(): void {
    this.filterSubscription.unsubscribe();
    rows.splice(rows.indexOf(this), 1);
  }

  removeItem(proxy: ItemProxy): void {
    this.dialogService.openCustomTextDialog('Confirm Deletion',
      'Are you sure you want to delete ' + proxy.item.name + '?',
      ['Cancel', 'Delete', 'Delete Recursively']).
      subscribe((result) => {
      if (result) {
        this.itemRepository.deleteItem(proxy, (2 === result));
      }
    });
  }
  
  isVersionControlViewVisible(): boolean {
    return versionControlEnabled;
  }
  
  revertChanges(itemProxy: ItemProxy): void {
    this.dialogService.openYesNoDialog('Undo Changes', 'Are you sure that you '
      + 'want to undo all changes to this item since the previous commit?').
      subscribe((result) => {
      if (result) {
        this.versionControlService.revertItems([itemProxy]);
      }
    });
  }
  
  updateRoot(newRoot: ItemProxy): void {
    treeRoot = newRoot;
    isRootDefault = false;
  }
}
