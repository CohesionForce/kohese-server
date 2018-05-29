import { ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { VirtualScrollComponent } from 'angular2-virtual-scroll';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../services/dialog/dialog.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeRow } from './tree-row.class';
import { RowAction, MenuAction } from './tree-row.component';
import { Filter } from '../filter/filter.class';
import { FilterComponent } from '../filter/filter.component';

export class Tree {
  private _rowMap: Map<string, TreeRow> = new Map<string, TreeRow>();
  private _rows: Array<TreeRow> = [];
  
  private _visibleRows: Array<TreeRow> = [];
  get visibleRows() {
    return this._visibleRows;
  }
  
  protected _rootSubject: BehaviorSubject<ItemProxy> =
    new BehaviorSubject<ItemProxy>(undefined);
  get rootSubject() {
    return this._rootSubject;
  }
  
  private _rootRow: TreeRow;
  get rootRow() {
    return this._rootRow;
  }
  
  private _rootRowActions: Array<RowAction> = [
    new RowAction('Expand Descendants', 'Expands all descendants',
    'fa fa-caret-down', (row: TreeRow) => {
      return (row.getRowChildrenProxies().length > 0);
    }, (row: TreeRow) => {
      this.expandDescendants(row);
    }),
    new RowAction('Collapse Descendants', 'Collapses all descendants',
    'fa fa-caret-right', (row: TreeRow) => {
      return (row.getRowChildrenProxies().length > 0);
    }, (row: TreeRow) => {
      this.collapseDescendants(row);
    })
  ];
  get rootRowActions() {
    return this._rootRowActions;
  }
  
  private _rootMenuActions: Array<MenuAction> = [];
  get rootMenuActions() {
    return this._rootMenuActions;
  }
  
  private _rowActions: Array<RowAction> = [];
  get rowActions() {
    return this._rowActions;
  }
  
  private _menuActions: Array<MenuAction> = [
    new MenuAction('Expand Descendants', 'Expands all descendants',
    'fa fa-caret-down', (row: TreeRow) => {
      return (row.getRowChildrenProxies().length > 0);
    }, (row: TreeRow) => {
      this.expandDescendants(row);
    }),
    new MenuAction('Collapse Descendants', 'Collapses all descendants',
    'fa fa-caret-right', (row: TreeRow) => {
      return (row.getRowChildrenProxies().length > 0);
    }, (row: TreeRow) => {
      this.collapseDescendants(row);
    })
  ];
  get menuActions() {
    return this._menuActions;
  }
  
  private _selectedIdSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  get selectedIdSubject() {
    return this._selectedIdSubject;
  }
  
  private _filterSubject: BehaviorSubject<Filter> =
    new BehaviorSubject<Filter>(undefined);
  get filterSubject() {
    return this._filterSubject;
  }
  
  @ViewChild(VirtualScrollComponent)
  private _virtualScrollComponent: VirtualScrollComponent;
  
  private _rootSubscription: Subscription;
  private _filterSubscription: Subscription;
  private _updateVisibleRowsSubscriptionMap: any = {};
  
  protected constructor(protected _route: ActivatedRoute,
    protected _dialogService: DialogService) {
    this._rootSubscription = this._rootSubject.subscribe((root: ItemProxy) => {
      if (root) {
        this.rootChanged();
        this._rootRow = this._rowMap.get(root.item.id);
        this._rootRow.depth = 0;
        this.showRows();
      }
    });
    
    this._route.params.subscribe((parameters: Params) => {
      this._selectedIdSubject.next(parameters['id']);
      this.showSelection();
    });
    
    this._filterSubscription = this._filterSubject.subscribe((filter:
      Filter) => {
      this.refresh();
    });
  }
  
  protected prepareForDismantling(): void {
    this.clear();
    this._filterSubscription.unsubscribe();
    this._rootSubscription.unsubscribe();
  }
  
  protected buildRow(proxy: ItemProxy): TreeRow {
    let row: TreeRow = new TreeRow(proxy);
    this._rowMap.set(proxy.item.id, row);
    this._rows.push(row);
    this._updateVisibleRowsSubscriptionMap[proxy.item.id] = row.
      updateVisibleRows.subscribe((updateVisibleRows: boolean) => {
      if (updateVisibleRows) {
        this.showRows();
      }
    });
    
    return row;
  }
  
  protected insertRow(proxy: ItemProxy): TreeRow {
    let row: TreeRow = new TreeRow(proxy);
    this._rowMap.set(proxy.item.id, row);
    let parentRowIndex: number = this._rows.indexOf(this._rowMap.get(row.
      getRowParentProxy().item.id));
    let parentRowIndexOffset: number = this._rowMap.get(row.
      getRowParentProxy().item.id).getRowChildrenProxies().indexOf(row.
      itemProxy);
    if (0 !== parentRowIndexOffset) {
      parentRowIndexOffset += this._rowMap.get(row.getRowParentProxy().item.
        id).getRowChildrenProxies()[parentRowIndexOffset].descendantCount;
    }
    this._rows.splice(parentRowIndex + parentRowIndexOffset + 1, 0,
      row);
    this._updateVisibleRowsSubscriptionMap[proxy.item.id] = row.
      updateVisibleRows.subscribe((updateVisibleRows: boolean) => {
      if (updateVisibleRows) {
        this.showRows();
      }
    });
    
    return row;
  }
  
  public getRow(id: string): TreeRow {
    return this._rowMap.get(id);
  }
  
  public refresh(): void {
    this._rootSubject.next(this._rootSubject.getValue());
    if (this._virtualScrollComponent) {
      this._virtualScrollComponent.refresh(true);
    }
  }
  
  public openFilterDialog(): void {
    this._dialogService.openComponentDialog(FilterComponent, {
      data: {
        filter: this._filterSubject.getValue()
      }
    }).updateSize('70%', '70%').afterClosed().subscribe((filter: Filter) => {
      if (filter) {
        this._filterSubject.next(filter);
      }
    });
  }
  
  protected deleteRow(id: string): void {
    delete this._updateVisibleRowsSubscriptionMap[id];
    let row: TreeRow = this._rowMap.get(id);
    this._rows.splice(this._rows.indexOf(row), 1);
    this._rowMap.delete(id);
  }
  
  private showRows(): void {
    this._visibleRows = [];
    this.preTreeTraversalActivity();
    
    let rootRowChildrenProxies: Array<ItemProxy> = this._rootRow.
      getRowChildrenProxies();
    for (let j: number = 0; j < rootRowChildrenProxies.length; j++) {
      this.processRow(this._rowMap.get(rootRowChildrenProxies[j].item.id));
    }
    
    this.postTreeTraversalActivity();
    
    this._rootRow.updateDisplay.next(true);
    for (let j: number = 0; j < this._visibleRows.length; j++) {
      this._visibleRows[j].updateDisplay.next(true);
    }
  }
  
  private processRow(row: TreeRow): void {
    this.preRowProcessingActivity(row);
    
    let filter: Filter = this._filterSubject.getValue();
    let show: boolean = !!filter;
    if (show) {
      row.matchesFilter = (-1 !== filter.filter([row.itemProxy]).indexOf(row.
        itemProxy));
      show = row.matchesFilter;
      if (!row.matchesFilter) {
        let recursiveFilteringFunction: (r: TreeRow) => void = (r: TreeRow) => {
          let rowChildrenProxies: Array<ItemProxy> = r.getRowChildrenProxies();
          for (let j: number = 0; j < rowChildrenProxies.length; j++) {
            let matches: boolean = (-1 !== filter.filter([rowChildrenProxies[
              j]]).indexOf(rowChildrenProxies[j]));
            if (!matches) {
              recursiveFilteringFunction(this._rowMap.get(rowChildrenProxies[j].
                item.id));
            }
            
            if (matches) {
              show = true;
              break;
            }
          }
        };
        recursiveFilteringFunction(row);
      }
    } else {
      row.matchesFilter = false;
      show = true;
    }
    
    if (show !== row.visible) {
      row.visible = show;
    }
    
    let root: ItemProxy = this._rootSubject.getValue();
    let rowParentProxy: ItemProxy = row.getRowParentProxy();
    let depth: number = 0;
    if (row !== this._rootRow) {
      while (rowParentProxy) {
        if (rowParentProxy === root) {
          break;
        }
        depth++;
        rowParentProxy = this._rowMap.get(rowParentProxy.item.id).
          getRowParentProxy();
      }
    }
    row.depth = depth;
    
    if (row.visible) {
      rowParentProxy = row.getRowParentProxy();
      let addRow: boolean = !rowParentProxy;
      if (rowParentProxy) {
        let parentRow: TreeRow = this._rowMap.get(rowParentProxy.item.id);
        /* The parent TreeRow's expansion should be checked after the root is
        compared to parentRow's ItemProxy */
        addRow = ((rowParentProxy === root) || parentRow.expanded);
      }
      
      if (addRow) {
        this._visibleRows.push(row);
        
        if (row.expanded) {
          let rowChildrenProxies: Array<ItemProxy> = row.
            getRowChildrenProxies();
          for (let j: number = 0; j < rowChildrenProxies.length; j++) {
            this.processRow(this._rowMap.get(rowChildrenProxies[j].item.id));
          }
        }
      }
    }
    this.postRowProcessingActivity(row);
  }
  
  public preTreeTraversalActivity(): void {
    // Subclasses may override this function
  }
  
  public preRowProcessingActivity(row: TreeRow): void {
    // Subclasses may override this function
  }
  
  public postRowProcessingActivity(row: TreeRow): void {
    // Subclasses may override this function
  }
  
  public postTreeTraversalActivity(): void {
    // Subclasses may override this function
  }
  
  public rootChanged(): void {
    // Subclasses may override this function
  }
  
  protected clear(): void {
    for (let id in this._updateVisibleRowsSubscriptionMap) {
      delete this._updateVisibleRowsSubscriptionMap[id];
    }
    this._visibleRows = [];
    this._rows.length = 0;
    this._rowMap.clear();
  }
  
  private expandDescendants(row: TreeRow): void {
    let expandFunction: (r: TreeRow) => void = (r: TreeRow) => {
      if (r.visible) {
        r.expanded = true;
        let rowChildrenProxies: Array<ItemProxy> = r.getRowChildrenProxies();
        for (let j: number = 0; j < rowChildrenProxies.length; j++) {
          expandFunction(this._rowMap.get(rowChildrenProxies[j].item.id));
        }
      }
    };
    
    expandFunction(row);

    this.showRows();
  }
  
  private collapseDescendants(row: TreeRow): void {
    let collapseFunction: (r: TreeRow) => void = (r: TreeRow) => {
      if (r.visible) {
        r.expanded = false;
        let rowChildrenProxies: Array<ItemProxy> = r.getRowChildrenProxies();
        for (let j: number = 0; j < rowChildrenProxies.length; j++) {
          collapseFunction(this._rowMap.get(rowChildrenProxies[j].item.id));
        }
      }
    };
    
    collapseFunction(row);

    this.showRows();
  }
  
  protected showSelection(): void {
    let id: string = this._selectedIdSubject.getValue();
    if (id) {
      let selectedRow: TreeRow = this._rowMap.get(id);
      if (selectedRow) {
        let rowParentProxy: ItemProxy = selectedRow.getRowParentProxy();
        if (rowParentProxy) {
          let parentId: string = rowParentProxy.item.id;
          let rootId: string = this._rootSubject.getValue().item.id;
          while (parentId !== rootId) {
            let parentRow: TreeRow = this._rowMap.get(parentId);
            if (!parentRow) {
              break;
            }

            parentRow.expanded = true;
            rowParentProxy = parentRow.getRowParentProxy();
            if (rowParentProxy) {
              parentId = rowParentProxy.item.id;
            } else {
              break;
            }
          }
        }

        this.showRows();
        if (this._virtualScrollComponent) {
          this._virtualScrollComponent.scrollInto(selectedRow);
        }
      }
    }
  }
}