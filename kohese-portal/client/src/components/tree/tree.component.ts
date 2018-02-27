import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { VersionControlService } from '../../services/version-control/version-control.service';
import { SessionService } from '../../services/user/session.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { Subscription } from 'rxjs/Subscription';

import { ItemProxy } from '../../../../common/models/item-proxy';
import { ProxyFilter } from '../../classes/ProxyFilter.class';
import { RowComponent } from '../../classes/RowComponent.class';
import { KoheseType } from '../../classes/UDT/KoheseType.class';

let treeRoot: ItemProxy;
let isRootDefault: boolean = true;
let treeMap: any = {};
let expandUponInstantiation: boolean = false;
let versionControlEnabled: boolean = false;
let selectedProxyId: string = '';

@Component({
  selector : 'tree-view',
  templateUrl : './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent extends NavigatableComponent
                              implements OnInit, OnDestroy {
    /* UI Toggles */
    private locationSynced: boolean = false;

    /* Data */
    private absoluteRoot : ItemProxy;
    private proxyFilter: ProxyFilter = new ProxyFilter(); // TODO get definition for Filter
    private selectedItemProxy: ItemProxy;
    private koheseTypes: object;
    public actionStates: Array<string> = ['Pending Review', 'In Verification', 'Assigned'];
    public userList : Array<ItemProxy>; // This will eventually be of type KoheseUser
    // TODO Probably want to get this from somewhere else
    public viewList: Array<string> = ['Default', 'Version Control'];
    public selectedView: string = this.viewList[0];
    
    private readonly NO_KIND_SPECIFIED: string = '---';

    /* Subscriptions */
    private repoStatusSub: Subscription;
    private routeParametersSubscription: Subscription;

  constructor (protected NavigationService : NavigationService,
    private typeService: DynamicTypesService,
    private ItemRepository : ItemRepository,
    private VersionControlService : VersionControlService,
    private SessionService : SessionService,
    private route : ActivatedRoute) {
    super(NavigationService);
  }

  ngOnInit(): void {
    this.repoStatusSub = this.ItemRepository.getRepoStatusSubject()
      .subscribe(update => {
      if (update.connected) {
        treeRoot = this.ItemRepository.getRootProxy();
        this.absoluteRoot = treeRoot;
        this.koheseTypes = this.typeService.getKoheseTypes();
        
        treeRoot.visitChildren(undefined, (proxy: ItemProxy) => {
          treeMap[proxy.item.id] = {
            expanded: false
          };
        });
      }
    });
    
    this.routeParametersSubscription = this.route.params.
      subscribe((parameters: Params) => {
      selectedProxyId = parameters['id'];
    });

    this.userList = this.SessionService.getUsers();

    // TODO set up @output/@input listeners for selectedItemProxy and row objects

    // TODO set up sync listener functionality
  }

  ngOnDestroy(): void {
    this.routeParametersSubscription.unsubscribe();
    this.repoStatusSub.unsubscribe();
  }

  filter(): void {
    let show: boolean = true;
    for (let id in treeMap) {
      let row: TreeRowComponent = treeMap[id].row;
      if (row) {
        if (this.proxyFilter.filterString) {
          let proxy: ItemProxy = row.getProxy();
          row.matchesFilter = this.doesProxyMatchFilter(proxy);
          show = row.matchesFilter;
          if (!show) {
            for (let j: number = 0; j < proxy.children.length; j++) {
              if (this.doesProxyMatchFilter(proxy.children[j])) {
                show = true;
                break;
              }
            }
          }
        } else {
          row.matchesFilter = false;
          this.proxyFilter.textRegexHighlight = null;
        }
      
        row.setVisible(show);
      }
    }
  }
  
  doesProxyMatchFilter(proxy: ItemProxy): boolean {
    let matches: boolean = true;
    if (this.proxyFilter.status && (!proxy.status ||
      (proxy.status.length === 0))) {
      matches = false;
    } else if (this.proxyFilter.dirty && !proxy.dirty) {
      matches =  false;
    } else if (this.proxyFilter.kind) {
      if (proxy.kind !== this.proxyFilter.kind.name) {
        matches = false;
      } else if (proxy.kind === 'Action') {
        if (proxy.item.actionState !== this.proxyFilter.actionState) {
          matches = false;
        } else if (proxy.item.assignedTo !== this.proxyFilter.actionAssignee) {
          matches = false;
        }
      }
    }
    
    if (matches) {
      matches = false;
      if (this.proxyFilter.filterString) {
        let filterExpression: RegExp;
        let filterIsRegex: Array<string> = this.proxyFilter.filterString.
          match(new RegExp('^\/(.*)\/([gimy]*)$'));
        if (filterIsRegex) {
          filterExpression = new RegExp(filterIsRegex[1], filterIsRegex[2]);
          this.proxyFilter.textRegexHighlight = new RegExp('(' + filterIsRegex[1]
            + ')', 'g' + filterIsRegex[2]);
        } else {
          let cleanedPhrase: string = this.proxyFilter.filterString.
            replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          filterExpression = new RegExp(this.proxyFilter.filterString, 'i');
          this.proxyFilter.textRegexHighlight = new RegExp('(' + cleanedPhrase
            + ')', 'gi');
        }
      
        for (let key in proxy.item) {
          if (key.charAt(0) !== '$' &&
            (typeof proxy.item[key] === 'string') &&
            proxy.item[key].match(filterExpression)) {
            matches = true;
            break;
          }
        }
      }
    }
    
    return matches;
  }

  getItemCount () {
    return treeRoot.descendantCount;
  }

  getItemMatchedCount () {
    let numberOfVisibleRows: number = 0;
    for (let id in treeMap) {
      if (treeMap[id].row) {
        numberOfVisibleRows++;
      }
    }
    
    return numberOfVisibleRows;
  }

  upLevel(): void {
    if (!isRootDefault) {
      treeRoot = treeRoot.parentProxy;
      isRootDefault = (treeRoot === this.absoluteRoot);
    }
  }

  resetRoot(): void {
    treeRoot = this.absoluteRoot;
    isRootDefault = true;
  }

  expandSyncedNodes(): void {
    // TODO Implement tree sync
  }

  /******** List expansion functions */
  expandAll(): void {
    for (let id in treeMap) {
      treeMap[id].expanded = true;
    }
  }

  collapseAll(): void {
    for (let id in treeMap) {
      treeMap[id].expanded = false;
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

  viewSelectionChanged(): void {
    switch (this.selectedView) {
      case 'Version Control':
        this.proxyFilter.status = true;
        this.proxyFilter.dirty = false;
        versionControlEnabled = true;
        break;
      default:
        this.proxyFilter.status = false;
        this.proxyFilter.dirty = false;
        versionControlEnabled = false;
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
  templateUrl: './tree-row.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeRowComponent extends RowComponent
  implements OnInit, OnDestroy {
  public koheseType: any;
  private _matchesFilter: boolean = false;
  get matchesFilter() {
    return this._matchesFilter;
  }
  set matchesFilter(matches: boolean) {
    this._matchesFilter = matches;
  }

  constructor(NavigationService : NavigationService,
    private dialogService: DialogService,
    private typeService: DynamicTypesService,
    private itemRepository: ItemRepository,
    private versionControlService: VersionControlService) {
    super(NavigationService);
  }

  ngOnInit(): void {
    let treeMapEntry: any = treeMap[this.itemProxy.item.id];
    treeMapEntry.row = this;
    this.koheseType = this.typeService.getKoheseTypes()[this.itemProxy.kind];
    if (!this.koheseType) {
      this.koheseType = {
        name: this.itemProxy.kind,
        icon: 'fa fa-sticky-note'
      };
    }
  }

  ngOnDestroy(): void {
    delete treeMap[this.itemProxy.item.id].row;
  }

  removeItem(): void {
    this.dialogService.openCustomTextDialog('Confirm Deletion',
      'Are you sure you want to delete ' + this.itemProxy.item.name + '?',
      ['Cancel', 'Delete', 'Delete Recursively']).
      subscribe((result: any) => {
      if (result) {
        this.itemRepository.deleteItem(this.itemProxy, (2 === result));
      }
    });
  }
  
  isVersionControlViewVisible(): boolean {
    return versionControlEnabled;
  }
  
  revertChanges(): void {
    this.dialogService.openYesNoDialog('Undo Changes', 'Are you sure that you '
      + 'want to undo all changes to this item since the previous commit?').
      subscribe((result: any) => {
      if (result) {
        this.versionControlService.revertItems([this.itemProxy]);
      }
    });
  }
  
  updateRoot(): void {
    treeRoot = this.itemProxy;
    isRootDefault = false;
  }
  
  getSelectedProxyId(): string {
    return selectedProxyId;
  }
  
  public getTreeMapEntry(): any {
    return treeMap[this.itemProxy.item.id];
  }
}
