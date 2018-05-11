import { ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { VirtualScrollComponent } from 'angular2-virtual-scroll';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeRow } from './tree-row.class';

export class Tree {
  private _rowMap: Map<string, TreeRow> = new Map<string, TreeRow>();
  private _rows: Array<TreeRow> = [];
  
  private _visibleRows: Array<TreeRow> = [];
  get visibleRows() {
    return this._visibleRows;
  }
  
  private _rootSubject: BehaviorSubject<ItemProxy> =
    new BehaviorSubject<ItemProxy>(undefined);
  get rootSubject() {
    return this._rootSubject;
  }
  
  private _selectedIdSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  get selectedIdSubject() {
    return this._selectedIdSubject;
  }
  
  @ViewChild(VirtualScrollComponent)
  private _virtualScrollComponent: VirtualScrollComponent;
  
  private _rootSubscription: Subscription;
  private _updateVisibleRowsSubscriptions: Array<Subscription> = [];
  
  public constructor(protected _route: ActivatedRoute) {
    this._rootSubscription = this._rootSubject.subscribe((proxy: ItemProxy) => {
      console.log('Jesus Christ is LORD!');
      if (proxy) {
        this.rootChanged(proxy);
        this.showRows();
      }
    });
    
    this._route.params.subscribe((parameters: Params) => {
      this._selectedIdSubject.next(parameters['id']);
      this.showSelection();
    });
  }
  
  protected prepareForDismantling(): void {
    for (let j: number = 0; j < this._updateVisibleRowsSubscriptions.length;
      j++) {
      this._updateVisibleRowsSubscriptions[j].unsubscribe();
    }
    
    this._rootSubscription.unsubscribe();
  }
  
  protected buildRow(proxy: ItemProxy): TreeRow {
    let row: TreeRow = new TreeRow(proxy);
    this._rowMap.set(proxy.item.id, row);
    this._rows.push(row);
    this._updateVisibleRowsSubscriptions.push(row.updateVisibleRows.
      subscribe((updateVisibleRows: boolean) => {
      if (updateVisibleRows) {
        this.showRows();
      }
    }));
    
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
    this._updateVisibleRowsSubscriptions.push(row.updateVisibleRows.
      subscribe((updateVisibleRows: boolean) => {
      if (updateVisibleRows) {
        this.showRows();
      }
    }));
    
    return row;
  }
  
  public getRow(id: string): TreeRow {
    return this._rowMap.get(id);
  }
  
  protected deleteRow(id: string): void {
    let row: TreeRow = this._rowMap.get(id);
    this._rows.splice(this._rows.indexOf(row), 1);
    this._rowMap.delete(id);
  }
  
  public showRows(): void {
    this._visibleRows = [];
    this.preTreeTraversalActivity();
    
    let root: TreeRow = this._rowMap.get(this._rootSubject.getValue().item.id);
    let rootRowChildrenProxies: Array<ItemProxy> = root.getRowChildrenProxies();
    for (let j: number = 0; j < rootRowChildrenProxies.length; j++) {
      this.processRow(this._rowMap.get(rootRowChildrenProxies[j].item.id));
    }
    
    this.postTreeTraversalActivity();
    
    for (let j: number = 0; j < this._visibleRows.length; j++) {
      this._visibleRows[j].updateDisplay.next(true);
    }
  }
  
  private processRow(row: TreeRow): void {
    this.preRowProcessingActivity(row);
    if (row.visible) {
      let rowParentProxy: ItemProxy = row.getRowParentProxy();
      let addRow: boolean = !rowParentProxy;
      if (rowParentProxy) {
        let parentRow: TreeRow = this._rowMap.get(rowParentProxy.item.id);
        /* The parent TreeRow's expansion should be checked after the root is
        compared to parentRow's ItemProxy */
        addRow = ((rowParentProxy === this._rootSubject.getValue()) ||
          parentRow.expanded);
      }
      
      if (addRow) {
        this._visibleRows.push(row);
        
        let depth: number = 0;
        while (rowParentProxy) {
          depth++;
          rowParentProxy = this._rowMap.get(rowParentProxy.item.id).getRowParentProxy();
        }
        row.depth = depth;
        
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
  
  public rootChanged(root: ItemProxy): void {
    // Subclasses may override this function
  }
  
  protected clear(): void {
    this._visibleRows = [];
    this._rows.length = 0;
    this._rowMap.clear();
  }
  
  public expandAll(): void {
    let expandFunction: (row: TreeRow) => void = (row: TreeRow) => {
      if (row.visible) {
        row.expanded = true;
        let rowChildrenProxies: Array<ItemProxy> = row.getRowChildrenProxies();
        for (let j: number = 0; j < rowChildrenProxies.length; j++) {
          expandFunction(this._rowMap.get(rowChildrenProxies[j].item.id));
        }
      }
    };
    let rowChildrenProxies: Array<ItemProxy> = this._rowMap.get(this._rootSubject.getValue().item.id).
      getRowChildrenProxies();
    for (let j: number = 0; j < rowChildrenProxies.length; j++) {
      expandFunction(this._rowMap.get(rowChildrenProxies[j].item.id));
    }

    this.showRows();
  }
  
  public collapseAll(): void {
    let collapseFunction: (row: TreeRow) => void = (row: TreeRow) => {
      if (row.visible) {
        row.expanded = false;
        let rowChildrenProxies: Array<ItemProxy> = row.getRowChildrenProxies();
        for (let j: number = 0; j < rowChildrenProxies.length; j++) {
          collapseFunction(this._rowMap.get(rowChildrenProxies[j].item.id));
        }
      }
    };
    let rowChildrenProxies: Array<ItemProxy> = this._rowMap.get(this._rootSubject.getValue().item.id).
      getRowChildrenProxies();
    for (let j: number = 0; j < rowChildrenProxies.length; j++) {
      collapseFunction(this._rowMap.get(rowChildrenProxies[j].item.id));
    }

    this.showRows();
  }
  
  public showSelection(): void {
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