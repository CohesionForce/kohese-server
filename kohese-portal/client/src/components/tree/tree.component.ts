import {
  Component, OnInit, OnDestroy, ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { VirtualScrollComponent } from 'angular2-virtual-scroll';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';
import { SessionService } from '../../services/user/session.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { TreeRow } from './tree-row.class';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { ProxyFilter } from '../../classes/ProxyFilter.class';

@Component({
  selector: 'tree-view',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  /* UI Toggles */
  private _synchronizeWithSelection: boolean = true;
  get synchronizeWithSelection() {
    return this._synchronizeWithSelection;
  }

  /* Data */
  private _rowMap: Map<string, TreeRow> = new Map<string, TreeRow>();
  private _rows: Array<TreeRow> = [];
  private _visibleRows: Array<TreeRow> = [];
  get visibleRows() {
    return this._visibleRows;
  }
  private _treeRootStream: BehaviorSubject<ItemProxy>;
  get treeRootStream() {
    return this._treeRootStream;
  }
  private absoluteRoot: ItemProxy;
  public isRootDefault: boolean = true;
  public selectedProxyIdStream: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public proxyFilter: ProxyFilter = new ProxyFilter();
  private _filterDelayIdentifier: any;
  // TODO Probably want to get this from somewhere else
  public viewList: Array<string> = ['Default', 'Version Control'];
  public selectedViewStream: BehaviorSubject<string> = new BehaviorSubject<string>(this.viewList[0]);
  private koheseTypes: object;
  public actionStates: Array<string> = ['Pending Review', 'In Verification', 'Assigned'];
  public userList: Array<ItemProxy>; // This will eventually be of type KoheseUser
  private readonly NO_KIND_SPECIFIED: string = '---';
  @ViewChild(VirtualScrollComponent)
  private _virtualScrollComponent: VirtualScrollComponent;

  /* Subscriptions */
  private routeParametersSubscription: Subscription;
  private _treeRootChangeSubscription: Subscription;
  private _itemProxySubscription: Subscription;
  private _updateVisibleRowsSubscriptions: Array<Subscription> = [];

  constructor(protected NavigationService: NavigationService,
    private typeService: DynamicTypesService,
    private ItemRepository: ItemRepository,
    private SessionService: SessionService,
    private route: ActivatedRoute,
    private _changeDetector: ChangeDetectorRef) {
    super(NavigationService);
  }

  ngOnInit(): void {
    let repositoryStatusSubscription: Subscription = this.ItemRepository.
      getRepoStatusSubject().subscribe(update => {
        switch (update.state) {
          case RepoStates.KOHESEMODELS_SYNCHRONIZED:
          case RepoStates.SYNCHRONIZATION_SUCCEEDED:
            this.absoluteRoot = this.ItemRepository.getRootProxy();
            this._treeRootStream = new BehaviorSubject<ItemProxy>(this.
              absoluteRoot);
            this.koheseTypes = this.typeService.getKoheseTypes();

            this.absoluteRoot.visitChildren(undefined, (proxy: ItemProxy) => {
              this.addTreeRow(proxy);
            });

            this._treeRootChangeSubscription = this._treeRootStream.subscribe(
              (proxy: ItemProxy) => {
                this.changeTreeRoot(proxy);
              });

            this._itemProxySubscription = this.ItemRepository.
              getChangeSubject().subscribe((notification: any) => {
                switch (notification.type) {
                  case 'create':
                    {
                      let row: TreeRow = new TreeRow(notification.proxy);
                      this._rowMap.set(notification.id, row);
                      let parentRowIndex: number = this._rows.indexOf(this._rowMap.
                        get(notification.proxy.parentProxy.item.id));
                      let parentRowIndexOffset: number = notification.proxy.
                        parentProxy.children.indexOf(notification.proxy);
                      if (0 !== parentRowIndexOffset) {
                        parentRowIndexOffset += notification.proxy.parentProxy.
                          children[parentRowIndexOffset].descendantCount;
                      }
                      this._rows.splice(parentRowIndex + parentRowIndexOffset + 1, 0,
                        row);
                      this._updateVisibleRowsSubscriptions.push(row.
                        updateVisibleRows.subscribe((updateVisibleRows: boolean) => {
                        if (updateVisibleRows) {
                          this.setVisibleRows();
                        }
                      }));
                    }
                    break;
                  case 'delete':
                    {
                      let row: TreeRow = this._rowMap.get(notification.id);
                      this._rows.splice(this._rows.indexOf(row), 1);
                      this._rowMap.delete(notification.id);
                    }
                    break;
                  case 'loaded':
                    this.absoluteRoot.visitChildren(undefined, (proxy: ItemProxy) => {
                      this.addTreeRow(proxy);
                    });
                    this.setVisibleRows();
                    this.showSelection();
                    return;
              }

                this.setVisibleRows();
              });

            this.routeParametersSubscription = this.route.params.
              subscribe((parameters: Params) => {
                this.selectedProxyIdStream.next(parameters['id']);
                if (this._synchronizeWithSelection) {
                  this.showSelection();
                }
              });

            this.setVisibleRows();
            this.showSelection();

            if (repositoryStatusSubscription) {
              repositoryStatusSubscription.unsubscribe();
            }
        }
      });

    if (this.absoluteRoot) {
      /* The ItemRepository was already in an eligible state for dependent
      initialization to be performed */
      repositoryStatusSubscription.unsubscribe();
    }

    this.userList = this.SessionService.getUsers();
  }

  ngOnDestroy(): void {
    this.routeParametersSubscription.unsubscribe();
    for (let j: number = 0; j < this._updateVisibleRowsSubscriptions.length;
      j++) {
      this._updateVisibleRowsSubscriptions[j].unsubscribe();
    }
    this._treeRootChangeSubscription.unsubscribe();
    this._itemProxySubscription.unsubscribe();
  }

  filter(): void {
    this.setVisibleRows();
  }

  upLevel(): void {
    this.changeTreeRoot(this._treeRootStream.getValue().parentProxy);
  }

  resetRoot(): void {
    this.changeTreeRoot(this.absoluteRoot);
  }

  /******** List expansion functions */
  expandAll(): void {
    let expandFunction: (row: TreeRow) => void = (row: TreeRow) => {
      if (row.visible) {
        row.expanded = true;
        this.applyToChildTreeRows(row.itemProxy, expandFunction);
      }
    };
    this.applyToChildTreeRows(this._treeRootStream.getValue(), expandFunction);

    this.setVisibleRows();
  }

  collapseAll(): void {
    let collapseFunction: (row: TreeRow) => void = (row: TreeRow) => {
      if (row.visible) {
        row.expanded = false;
        this.applyToChildTreeRows(row.itemProxy, collapseFunction);
      }
    };
    this.applyToChildTreeRows(this._treeRootStream.getValue(),
      collapseFunction);

    this.setVisibleRows();
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
    this.filter();
  }

  public whenFilterStringChanges(): void {
    if (this._filterDelayIdentifier) {
      clearTimeout(this._filterDelayIdentifier);
    }

    this._filterDelayIdentifier = setTimeout(() => {
      this.filter();
      this._filterDelayIdentifier = undefined;
    }, 1000);
  }

  public toggleSelectionSynchronization(): void {
    this._synchronizeWithSelection = !this._synchronizeWithSelection;
    if (this._synchronizeWithSelection) {
      this.showSelection();
    }
  }

  private showSelection(): void {
    let id: string = this.selectedProxyIdStream.getValue();
    if (id) {
      let selectedRow: TreeRow = this._rowMap.get(id);
      if (selectedRow) {
        let parentId: string = selectedRow.itemProxy.parentProxy.item.id;
        let treeRootId: string = this._treeRootStream.getValue().item.id;
        while (parentId !== treeRootId) {
          let parentRow: TreeRow = this._rowMap.get(parentId);
          if (!parentRow) {
            break;
          }

          parentRow.expanded = true;
          parentId = parentRow.itemProxy.parentProxy.item.id;
        }

        this.setVisibleRows();
        if (this._virtualScrollComponent) {
          this._virtualScrollComponent.scrollInto(selectedRow);
        }
      }
    }
  }

  private changeTreeRoot(proxy: ItemProxy): void {
    // This purpose of this check is to prevent non-terminating looping
    if (proxy !== this._treeRootStream.getValue()) {
      this._treeRootStream.next(proxy);
    }
    this.isRootDefault = (proxy === this.absoluteRoot);
    this.setVisibleRows();
  }

  private addTreeRow(forProxy): TreeRow {
    let row: TreeRow = new TreeRow(forProxy);
    this._updateVisibleRowsSubscriptions.push(row.updateVisibleRows.
      subscribe((updateVisibleRows: boolean) => {
        if (updateVisibleRows) {
          this.setVisibleRows();
        }
      }));
    this._rowMap.set(forProxy.item.id, row);
    this._rows.push(row);
    return row;
  }

  private setVisibleRows(): void {
    this._visibleRows = [];
    let treeRoot: ItemProxy = this._treeRootStream.getValue();
    let addRowsFunction: (row: TreeRow) => void = (row: TreeRow) => {
      row.filter(this.proxyFilter);
      if (row.visible) {
        let parentRow: TreeRow = this._rowMap.get(row.itemProxy.parentProxy.
          item.id);
        /* The parent TreeRow's expansion should be checked after isRootDefault
        is checked */
        if (this.isRootDefault || parentRow.expanded || (row.itemProxy.
          parentProxy === treeRoot)) {
          this._visibleRows.push(row);
          if (row.expanded) {
            this.applyToChildTreeRows(row.itemProxy, addRowsFunction);
          }
        }
      }
    };
    this.applyToChildTreeRows(treeRoot, addRowsFunction);
    // Update this tree first and then tree-rows
    this._changeDetector.markForCheck();
    for (let j: number = 0; j < this._visibleRows.length; j++) {
      this._visibleRows[j].updateDisplay.next(true);
    }
  }

  private applyToChildTreeRows(proxy: ItemProxy, functionToApply: (row:
    TreeRow) => void): void {
    for (let j: number = 0; j < proxy.children.length; j++) {
      let childProxy = proxy.children[j];
      let row: TreeRow = this._rowMap.get(childProxy.item.id);
      if (row){
        functionToApply(row);
      } else {
        console.log('*** Error: Row needed for child: ' + childProxy.item.id);
      }
    }
  }
}
