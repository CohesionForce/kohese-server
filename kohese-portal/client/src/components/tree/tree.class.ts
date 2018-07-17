import { ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { VirtualScrollComponent } from 'angular2-virtual-scroll';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../services/dialog/dialog.service';
import { TreeRow } from './tree-row/tree-row.class';
import { RowAction, MenuAction } from './tree-row/tree-row.component';
import { Filter } from '../filter/filter.class';
import { FilterComponent } from '../filter/filter.component';

export abstract class Tree {
  private _rowMap: Map<string, TreeRow> = new Map<string, TreeRow>();
  private _rows: Array<TreeRow> = [];

  private _visibleRows: Array<TreeRow> = [];
  get visibleRows() {
    return this._visibleRows;
  }

  private _rootSubject: BehaviorSubject<TreeRow> =
    new BehaviorSubject<TreeRow>(undefined);
  get rootSubject() {
    return this._rootSubject;
  }

  private _rootRowActions: Array<RowAction> = [
    new RowAction('Expand Descendants', 'Expands all descendants',
      'fa fa-caret-down', (row: TreeRow) => {
      return (this.getChildren(row).length > 0);
      }, (row: TreeRow) => {
      this.expandDescendants(row);
    }),
    new RowAction('Collapse Descendants', 'Collapses all descendants',
      'fa fa-caret-right', (row: TreeRow) => {
      return (this.getChildren(row).length > 0);
      }, (row: TreeRow) => {
      this.collapseDescendants(row);
    }),
    new RowAction('Set Parent As Root', 'Set this row\'s parent as the root',
      'fa fa-level-up', (row: TreeRow) => {
      return !!this.getParent(row);
      }, (row: TreeRow) => {
      this.setRowAsRoot(this.getParent(row));
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
      return (this.getChildren(row).length > 0);
    }, (row: TreeRow) => {
      this.expandDescendants(row);
    }),
    new MenuAction('Collapse Descendants', 'Collapses all descendants',
    'fa fa-caret-right', (row: TreeRow) => {
      return (this.getChildren(row).length > 0);
    }, (row: TreeRow) => {
      this.collapseDescendants(row);
    })
  ];
  get menuActions() {
    return this._menuActions;
  }

  protected _selectedIdSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  private _filterSubject: BehaviorSubject<Filter> =
    new BehaviorSubject<Filter>(undefined);
  get filterSubject() {
    return this._filterSubject;
  }
  
  private _filterDelayIdentifier: any;

  @ViewChild(VirtualScrollComponent)
  private _virtualScrollComponent: VirtualScrollComponent;

  private _rootSubscription: Subscription;
  private _filterSubscription: Subscription;
  private _updateVisibleRowsSubscriptionMap: any = {};

  protected constructor(protected _route: ActivatedRoute,
    protected _dialogService: DialogService) {
    this._rootSubscription = this._rootSubject.subscribe((root: TreeRow) => {
      if (root) {
        root.depth = 0;
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

  protected buildRow(object: any): TreeRow {
    let row: TreeRow = new TreeRow(object);
    row.getText = () => {
      return this.getText(row.object);
    };
    row.getIcon = () => {
      return this.getIcon(row.object);
    };
    row.isRowSelected = () => {
      return (this.getId(row) === this._selectedIdSubject.getValue());
    };
    row.rowSelected = () => {
      this.rowSelected(row);
      this._selectedIdSubject.next(this.getId(row));
      this.showSelection();
    };
    row.isRowRoot = () => {
      return (row === this._rootSubject.getValue());
    };
    row.setRowAsRoot = () => {
      this.setRowAsRoot(row);
    };
    row.hasChildren = () => {
      return ((row !== this._rootSubject.getValue()) && (this.getChildren(row).
        length > 0));
    };
    this._rowMap.set(this.getId(row), row);
    this._rows.push(row);

    let parentRow: TreeRow = this.getParent(row);
    if (parentRow) {
      row.path.push(...parentRow.path);
    }
    row.path.push(this.getId(row));

    this._updateVisibleRowsSubscriptionMap[this.getId(row)] = row.
      updateVisibleRows.subscribe((updateVisibleRows: boolean) => {
      if (updateVisibleRows) {
        this.showRows();
      }
    });

    return row;
  }

  protected insertRow(object: any): TreeRow {
    let row: TreeRow = new TreeRow(object);
    row.getText = () => {
      return this.getText(row.object);
    };
    row.getIcon = () => {
      return this.getIcon(row.object);
    };
    row.isRowSelected = () => {
      return (this.getId(row) === this._selectedIdSubject.getValue());
    };
    row.rowSelected = () => {
      this.rowSelected(row);
      this._selectedIdSubject.next(this.getId(row));
      this.showSelection();
    };
    row.isRowRoot = () => {
      return (row === this._rootSubject.getValue());
    };
    row.setRowAsRoot = () => {
      this.setRowAsRoot(row);
    };
    row.hasChildren = () => {
      return ((row !== this._rootSubject.getValue()) && (this.getChildren(row).
        length > 0));
    };
    this._rowMap.set(this.getId(row), row);

    let parentRow: TreeRow = this.getParent(row);
    row.path.push(...parentRow.path);
    row.path.push(this.getId(row));

    let childrenRows: Array<TreeRow> = this.getChildren(parentRow);
    let rowIndex: number = childrenRows.indexOf(row.
      object);
    let insertionIndex: number = undefined;
    while (undefined === insertionIndex) {
      if (rowIndex === (childrenRows.length - 1)) {
        let previousParent: TreeRow = parentRow;
        parentRow = this.getParent(parentRow);
        if (!parentRow) {
          insertionIndex = (this._rows.length - 1);
        } else {
          childrenRows = this.getChildren(parentRow);
          rowIndex = childrenRows.indexOf(previousParent);
        }
      } else {
        insertionIndex = this._rows.indexOf(childrenRows[rowIndex + 1]);
      }
    }
    this._rows.splice(insertionIndex + 1, 0, row);

    this._updateVisibleRowsSubscriptionMap[this.getId(row)] = row.
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
  
  public searchStringChanged(searchString: string): void {
    if (this._filterDelayIdentifier) {
      clearTimeout(this._filterDelayIdentifier);
    }

    this._filterDelayIdentifier = setTimeout(() => {
      let filter: Filter = this._filterSubject.getValue();
      if (!filter) {
        filter = new Filter();
      }
      filter.content = searchString;
      
      this._filterSubject.next(filter);
      this._filterDelayIdentifier = undefined;
    }, 1000);
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

    let rootRow: TreeRow = this._rootSubject.getValue();
    let rootRowChildrenProxies: Array<TreeRow> = this.getChildren(rootRow);
    for (let j: number = 0; j < rootRowChildrenProxies.length; j++) {
      this.processRow(rootRowChildrenProxies[j]);
    }

    this.postTreeTraversalActivity();

    rootRow.refresh();
    for (let j: number = 0; j < this._visibleRows.length; j++) {
      this._visibleRows[j].refresh();
    }
  }

  private processRow(row: TreeRow): void {
    this.preRowProcessingActivity(row);

    let filter: Filter = this._filterSubject.getValue();
    let show: boolean = !!filter;
    if (show) {
      row.matchesFilter = (-1 !== filter.filter([row.object]).indexOf(row.
        object));
      show = row.matchesFilter;
      if (!row.matchesFilter) {
        let recursiveFilteringFunction: (r: TreeRow) => void = (r: TreeRow) => {
          let rowChildrenProxies: Array<TreeRow> = this.getChildren(r);
          for (let j: number = 0; j < rowChildrenProxies.length; j++) {
            let matches: boolean = (-1 !== filter.filter([rowChildrenProxies[
              j].object]).indexOf(rowChildrenProxies[j].object));
            if (!matches) {
              recursiveFilteringFunction(rowChildrenProxies[j]);
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

    let root: TreeRow = this._rootSubject.getValue();
    let rowParentProxy: TreeRow = this.getParent(row);
    let depth: number = 0;
    if (row !== root) {
      while (rowParentProxy) {
        if (rowParentProxy === root) {
          break;
        }
        depth++;
        rowParentProxy = this.getParent(rowParentProxy);
      }
    }
    row.depth = depth;

    if (row.visible) {
      rowParentProxy = this.getParent(row);
      let addRow: boolean = !rowParentProxy;
      if (rowParentProxy) {
        let parentRow: TreeRow = rowParentProxy;
        /* The parent TreeRow's expansion should be checked after the root is
        compared to parentRow */
        addRow = ((rowParentProxy === root) || parentRow.expanded);
      }

      if (addRow) {
        this._visibleRows.push(row);

        if (row.expanded) {
          let rowChildrenProxies: Array<TreeRow> = this.getChildren(row);
          for (let j: number = 0; j < rowChildrenProxies.length; j++) {
            this.processRow(rowChildrenProxies[j]);
          }
        }
      }
    }
    this.postRowProcessingActivity(row);
  }

  protected abstract getId(row: TreeRow): string;

  protected abstract getParent(row: TreeRow): TreeRow;

  protected abstract getChildren(row: TreeRow): Array<TreeRow>;

  protected abstract getText(object: any): string;

  protected abstract getIcon(object: any): string;

  protected preTreeTraversalActivity(): void {
    // Subclasses may override this function
  }

  protected preRowProcessingActivity(row: TreeRow): void {
    // Subclasses may override this function
  }

  protected postRowProcessingActivity(row: TreeRow): void {
    // Subclasses may override this function
  }

  protected postTreeTraversalActivity(): void {
    // Subclasses may override this function
  }

  protected setRowAsRoot(row: TreeRow) {
    this._rootSubject.next(row);
  }

  protected rowSelected(row: TreeRow): void {
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
        let rowChildrenProxies: Array<TreeRow> = this.getChildren(r);
        for (let j: number = 0; j < rowChildrenProxies.length; j++) {
          expandFunction(rowChildrenProxies[j]);
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
        let rowChildrenProxies: Array<TreeRow> = this.getChildren(r);
        for (let j: number = 0; j < rowChildrenProxies.length; j++) {
          collapseFunction(rowChildrenProxies[j]);
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
        let parentRow: TreeRow = this.getParent(selectedRow);
        if (parentRow) {
          let parentId: string = this.getId(parentRow);
          let rootId: string = this.getId(this._rootSubject.getValue());
          while (parentId !== rootId) {
            let row: TreeRow = this._rowMap.get(parentId);
            if (!row) {
              break;
            }

            row.expanded = true;
            parentRow = this.getParent(row);
            if (parentRow) {
              parentId = this.getId(parentRow);
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
