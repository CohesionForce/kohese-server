import { Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  ChangeDetectionStrategy, ChangeDetectorRef, ViewChild,
  AfterViewInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';
import { SessionService } from '../../services/user/session.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { VersionControlService } from '../../services/version-control/version-control.service';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ItemProxy } from '../../../../common/src/item-proxy';
import { ProxyFilter } from '../../classes/ProxyFilter.class';
import { VirtualScrollComponent } from 'angular2-virtual-scroll';

let rowMap: Map<string, TreeRow> = new Map<string, TreeRow>();
let matchingRows: Array<TreeRow> = [];
let _root: ItemProxy;

@Component({
  selector : 'tree-view',
  templateUrl : './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeComponent extends NavigatableComponent
                              implements OnInit, AfterViewInit, OnDestroy {
    /* UI Toggles */
    private locationSynced: boolean = false;

    /* Data */
    private absoluteRoot : ItemProxy;
    get root() {
      return _root;
    }
    set root(root: ItemProxy) {
      _root = root;
    }
    public isRootDefault: boolean = true;
    public selectedProxyIdStream: BehaviorSubject<string> = new BehaviorSubject<string>('');
    public proxyFilter: ProxyFilter = new ProxyFilter();
    public filterStream: BehaviorSubject<ProxyFilter> = new BehaviorSubject<ProxyFilter>(this.proxyFilter);
    // TODO Probably want to get this from somewhere else
    public viewList: Array<string> = ['Default', 'Version Control'];
    public selectedViewStream: BehaviorSubject<string> = new BehaviorSubject<string>(this.viewList[0]);
    public _numberOfRowsVisible: number = 0;
    get numberOfRowsVisible() {
      return this._numberOfRowsVisible;
    }
    get matchingRows() {
      return matchingRows;
    }
    private koheseTypes: object;
    public actionStates: Array<string> = ['Pending Review', 'In Verification', 'Assigned'];
    public userList : Array<ItemProxy>; // This will eventually be of type KoheseUser
    private readonly NO_KIND_SPECIFIED: string = '---';

    /* Subscriptions */
    private repoStatusSub: Subscription;
    private routeParametersSubscription: Subscription;
    private _itemProxySubscription: Subscription;
    private _rowUpdateSubscriptions: Array<Subscription> = [];
    
    @ViewChild(VirtualScrollComponent)
    public tree: VirtualScrollComponent;

  constructor (protected NavigationService : NavigationService,
    private typeService: DynamicTypesService,
    private ItemRepository : ItemRepository,
    private SessionService : SessionService,
    private route : ActivatedRoute,
    private _changeDetector: ChangeDetectorRef) {
    super(NavigationService);
  }

  ngOnInit(): void {
    this.repoStatusSub = this.ItemRepository.getRepoStatusSubject()
      .subscribe(update => {
      if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
        this.root = this.ItemRepository.getRootProxy();
        this.absoluteRoot = this.root;
        this.koheseTypes = this.typeService.getKoheseTypes();
        
        this.root.visitChildren(undefined, (proxy: ItemProxy) => {
          let row: TreeRow = new TreeRow(proxy);
          rowMap.set(proxy.item.id, row);
        });
        
        for (let j: number = 0; j < this.root.children.length; j++) {
          let row: TreeRow = rowMap.get(this.root.children[j].item.id);
          matchingRows.push(row);
        }
        
        this._itemProxySubscription = this.ItemRepository.getChangeSubject().
          subscribe((notification: any) => {
          if ('create' === notification.type) {
            let row: TreeRow = new TreeRow(notification.proxy);
            rowMap.set(notification.id, row);
            this._rowUpdateSubscriptions.push(row.update.subscribe((updateUi: boolean) => {
              if (updateUi) {
                this.tree.refresh(true);
                console.log("Jesus Christ is LORD!");
              }
            }));
            matchingRows.splice(notification.proxy.parentProxy.children.indexOf(notification.proxy), 0, row);
          } else if ('delete' === notification.type) {
            let row: TreeRow = rowMap.get(notification.id);
            row.expand(false, false);
            matchingRows.splice(matchingRows.indexOf(row), 1);
            rowMap.delete(notification.id);
          }
        });
      }
    });

    this.routeParametersSubscription = this.route.params.
      subscribe((parameters: Params) => {
      this.selectedProxyIdStream.next(parameters['id']);
    });

    this.userList = this.SessionService.getUsers();

    // TODO set up sync listener functionality
  }
  
  public ngAfterViewInit(): void {
    for (let row of Array.from(rowMap.values())) {
      this._rowUpdateSubscriptions.push(row.update.subscribe((updateUi: boolean) => {
        if (updateUi) {
          this.tree.refresh(true);
          console.log("Jesus Christ is LORD!");
        }
      }));
    }
  }

  ngOnDestroy(): void {
    this.routeParametersSubscription.unsubscribe();
    for (let j: number = 0; j < this._rowUpdateSubscriptions.length; j++) {
      this._rowUpdateSubscriptions[j].unsubscribe();
    }
    this._itemProxySubscription.unsubscribe();
    this.repoStatusSub.unsubscribe();
  }

  filter(): void {
    this.filterStream.next(this.proxyFilter);
  }

  upLevel(): void {
    this.whenRootChanges(this.root.parentProxy);
  }

  resetRoot(): void {
    this.whenRootChanges(this.absoluteRoot);
  }

  expandSyncedNodes(): void {
    // TODO Implement tree sync
  }

  /******** List expansion functions */
  expandAll(): void {
    for (let row of Array.from(rowMap.values())) {
      if (row.visible) {
        row.expand(true, false);
      }
    }
  }

  collapseAll(): void {
    for (let row of Array.from(rowMap.values())) {
      if (row.visible) {
        row.expand(false, false);
      }
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

  viewSelectionChanged(viewSelected: string): void {
    switch (viewSelected) {
      case 'Version Control':
        this.proxyFilter.status = true;
        this.proxyFilter.dirty = false;
        break;
      default:
        this.proxyFilter.status = false;
        this.proxyFilter.dirty = false;
    }
    
    this.selectedViewStream.next(viewSelected);
    this.filterStream.next(this.proxyFilter);
  }
  
  public whenRootChanges(proxy: ItemProxy): void {
    this.root = proxy;
    this.isRootDefault = (this.root === this.absoluteRoot);
    matchingRows.length = 0;
    for (let j: number = 0; j < proxy.children.length; j++) {
      let row: TreeRow = rowMap.get(proxy.children[j].item.id);
      matchingRows.push(row);
      if (row.expanded) {
        row.expand(true, false);
      }
    }
    
    this.tree.refresh(true);
  }
  
  public whenRowVisibilityChanges(visible: boolean): void {
    if (visible) {
      this._numberOfRowsVisible++;
    } else {
      this._numberOfRowsVisible--;
    }
  }
  
  public whenTreeIsScrolled(scrollEvent: any): void {
    /*let treeHtmlElement: any = scrollEvent.path[0];
    let percentageScrolled: number = treeHtmlElement.scrollTop /
      (treeHtmlElement.scrollHeight - treeHtmlElement.offsetHeight);
    let visibleRows: Array<TreeRow> = [];
    for (let treeRow of Array.from(rowMap.values())) {
      treeRow.inView = false;
      if (treeRow.expanded && treeRow.visible) {
        //treeRow.inView = false;
        visibleRows.push(treeRow);
      }
    }
    
    let startingIndex: number = Math.floor(percentageScrolled * visibleRows.length);
    let numberOfRowsThatCanBeViewed: number = Math.floor((treeHtmlElement.offsetHeight / TreeRow.ROW_HEIGHT) + 1);
    console.log("Jesus Christ is LORD!");
    console.log(percentageScrolled);
    console.log(startingIndex);
    console.log(numberOfRowsThatCanBeViewed);
    console.log(scrollEvent);
    console.log("Jesus Christ is LORD!");
    for (let j: number = 0; (j < visibleRows.length) && (j <= (startingIndex +
      numberOfRowsThatCanBeViewed)); j++) {
      visibleRows[j].inView = true;
      visibleRows[j].update.next(true);
    }*/
  }
}

export class TreeRow {
  private _expanded: boolean = false;
  get expanded() {
    return this._expanded;
  }
  private _visible: boolean = true;
  get visible() {
    return this._visible;
  }
  private _matchesFilter: boolean = true;
  get matchesFilter() {
    return this._matchesFilter;
  }
  get itemProxy() {
    return this._proxy;
  }
  private _update: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  get update() {
    return this._update;
  }
  
  constructor(private _proxy: ItemProxy) {
  }
  
  public filter(proxyFilter: ProxyFilter): void {
    let show: boolean = true;
    if (proxyFilter.filterString || proxyFilter.kind || proxyFilter.status ||
      proxyFilter.dirty || proxyFilter.status) {
      this._matchesFilter = this.doesProxyMatchFilter(this._proxy, proxyFilter,
        false);
      show = this._matchesFilter;
      if (!show) {
        for (let j: number = 0; j < this._proxy.children.length; j++) {
          if (this.doesProxyMatchFilter(this._proxy.children[j], proxyFilter,
            true)) {
            show = true;
            break;
          }
        }
      }
    } else {
      this._matchesFilter = false;
      proxyFilter.textRegexHighlight = null;
    }
    
    /* Expand tree-rows that have version control system changes to one or more
    children */
    if (proxyFilter.status && show) {
      this.expand(true, false);
    }
    
    if (show !== this._visible) {
      this._visible = show;
      if (show) {
        let parentRow: TreeRow = rowMap.get(this._proxy.parentProxy.item.id);
        matchingRows.splice(matchingRows.indexOf(parentRow) + 1, 0, this);
      } else {
        matchingRows.splice(matchingRows.indexOf(this), 1);
      }
      
      this._update.next(true);
    }
  }
  
  private doesProxyMatchFilter(proxy: ItemProxy, proxyFilter: ProxyFilter,
    checkChildren: boolean): boolean {
    let matches: boolean = true;
    if (proxyFilter.status && (!proxy.status ||
      (proxy.status.length === 0))) {
      matches = false;
    } else if (proxyFilter.dirty && !proxy.dirty) {
      matches =  false;
    } else if (proxyFilter.kind) {
      if (proxy.kind !== proxyFilter.kind.name) {
        matches = false;
      } else if (proxy.kind === 'Action') {
        if (proxyFilter.actionState && (proxy.item.actionState !==
          proxyFilter.actionState)) {
          matches = false;
        } else if (proxyFilter.actionAssignee && (proxy.item.assignedTo !==
          proxyFilter.actionAssignee)) {
          matches = false;
        }
      }
    }
    
    if (matches) {
      matches = false;
      let filterExpression: RegExp;
      let filterIsRegex: Array<string> = proxyFilter.filterString.
        match(new RegExp('^\/(.*)\/([gimy]*)$'));
      if (filterIsRegex) {
        filterExpression = new RegExp(filterIsRegex[1], filterIsRegex[2]);
        proxyFilter.textRegexHighlight = new RegExp('(' + filterIsRegex[1]
          + ')', 'g' + filterIsRegex[2]);
      } else {
        let cleanedPhrase: string = proxyFilter.filterString.
          replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filterExpression = new RegExp(proxyFilter.filterString, 'i');
        proxyFilter.textRegexHighlight = new RegExp('(' + cleanedPhrase
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
    
    if (!matches && checkChildren) {
      for (let j: number = 0; j < proxy.children.length; j++) {
        if (this.doesProxyMatchFilter(proxy.children[j], proxyFilter, true)) {
          matches = true;
          break;
        }
      }
    }
    
    return matches;
  }
  
  public expand(expand: boolean, recurse: boolean): void {
    this._expanded = expand;
    let matchIndex: number = matchingRows.indexOf(this);
    let rows: Array<TreeRow> = [];
    this.getMatchingRows(this._proxy, rows);
    if (expand) {
      matchingRows.splice(matchIndex + 1, 0, ...rows);
    } else {
      matchingRows.splice(matchIndex + 1, rows.length);
    }
    
    this._update.next(true);
    
    if (recurse) {
      for (let j: number = 0; j < this._proxy.children.length; j++) {
        rowMap.get(this._proxy.children[j].item.id).expand(expand, true);
      }
    }
  }
  
  private getMatchingRows(proxy: ItemProxy, rows: Array<TreeRow>): void {
    for (let j: number = 0; j < proxy.children.length; j++) {
      let row: TreeRow = rowMap.get(proxy.children[j].item.id);
      if (row.visible) {
        rows.push(row);
        if (row.expanded) {
          this.getMatchingRows(row.itemProxy, rows);
        }
      }
    }
  }
}

@Component({
  selector: 'tree-row',
  templateUrl: './tree-row.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeRowComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  private _treeRow: TreeRow;
  get treeRow() {
    return this._treeRow;
  }
  @Input('treeRow')
  set treeRow(treeRow: TreeRow) {
    this._treeRow = treeRow;
  }
  @Input()
  public selectedViewStream: BehaviorSubject<string>;
  @Input()
  public selectedProxyIdStream: BehaviorSubject<string>;
  @Input()
  public filterStream: BehaviorSubject<ProxyFilter>;
  public koheseType: any;
  
  @Output()
  public rootChanged: EventEmitter<ItemProxy> = new EventEmitter<ItemProxy>();
  @Output()
  public visibilityChanged: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  
  private _filterStreamSubscription: Subscription;
  private _updateSubscription: Subscription;
  
  constructor(private _navigationService: NavigationService,
    private dialogService: DialogService,
    private typeService: DynamicTypesService,
    private itemRepository: ItemRepository,
    private versionControlService: VersionControlService,
    private _changeDetector: ChangeDetectorRef) {
    super(_navigationService);
  }

  public ngOnInit(): void {
    this.koheseType = this.typeService.getKoheseTypes()[this._treeRow.
      itemProxy.kind];
    if (!this.koheseType) {
      this.koheseType = {
        name: this._treeRow.itemProxy.kind,
        icon: 'fa fa-sticky-note'
      };
    }
    
    this._filterStreamSubscription = this.filterStream.
      subscribe((proxyFilter: ProxyFilter) => {
      let visibilityBeforeFiltering: boolean = this._treeRow.visible;
      console.log("Jesus Christ is LORD!");
      this._treeRow.filter(proxyFilter);
      if (visibilityBeforeFiltering !== this._treeRow.visible) {
        this.visibilityChanged.emit(!visibilityBeforeFiltering);
      }
    });
    
    this._updateSubscription = this._treeRow.update.subscribe((updateUi: boolean) => {
      this._changeDetector.markForCheck();
    });
    
    this.visibilityChanged.emit(this._treeRow.visible);
  }
  
  public ngOnDestroy(): void {
    this._updateSubscription.unsubscribe();
    this._filterStreamSubscription.unsubscribe();
  }

  public removeItem(): void {
    this.dialogService.openCustomTextDialog('Confirm Deletion',
      'Are you sure you want to delete ' + this._treeRow.itemProxy.item.name +
      '?', ['Cancel', 'Delete', 'Delete Recursively']).
      subscribe((result: any) => {
      if (result) {
        this.itemRepository.deleteItem(this._treeRow.itemProxy,
          (2 === result));
      }
    });
  }
  
  public revertChanges(): void {
    this.dialogService.openYesNoDialog('Undo Changes', 'Are you sure that you '
      + 'want to undo all changes to this item since the previous commit?').
      subscribe((result: any) => {
      if (result) {
        this.versionControlService.revertItems([this._treeRow.itemProxy]);
      }
    });
  }
  
  public getIndentationStyle(): object {
    let indentationAmount: number = 0;
    let parentProxy: ItemProxy = this._treeRow.itemProxy.parentProxy;
    while (parentProxy && (parentProxy !== _root)) {
      indentationAmount += 15;
      parentProxy = parentProxy.parentProxy;
    }
    
    return {
      'padding-left': indentationAmount + 'px'
    };
  }
}
