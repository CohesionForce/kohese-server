import { ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { VirtualScrollComponent } from 'angular2-virtual-scroll';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../services/dialog/dialog.service';
import { TreeRow } from './tree-row.class';
import { RowAction, MenuAction } from './tree-row.component';
import { Filter } from '../filter/filter.class';
import { FilterComponent } from '../filter/filter.component';

export abstract class Tree {
  private _rowMap: Map<any, TreeRow> = new Map<any, TreeRow>();

  private _visibleRows: Array<TreeRow> = [];
  get visibleRows() {
    return this._visibleRows;
  }
  
  private _rootSubject: BehaviorSubject<any> =
    new BehaviorSubject<any>(undefined);
  get rootSubject() {
    return this._rootSubject;
  }

  private _rootRowActions: Array<RowAction> = [
    new RowAction('Expand Descendants', 'Expands all descendants',
      'fa fa-caret-down', (object: any) => {
      return (this.getChildren(object).length > 0);
      }, (object: any) => {
      this.expandDescendants(this._rowMap.get(this.getId(object)));
    }),
    new RowAction('Collapse Descendants', 'Collapses all descendants',
      'fa fa-caret-right', (object: any) => {
      return (this.getChildren(object).length > 0);
      }, (object: any) => {
      this.collapseDescendants(this._rowMap.get(this.getId(object)));
    }),
    new RowAction('Set Parent As Root', 'Set the parent of this row\'s ' +
      'object as the root', 'fa fa-level-up', (object: any) => {
      return !!this.getParent(object);
      }, (object: any) => {
      this.setRoot(this.getParent(object));
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
      'fa fa-caret-down', (object: any) => {
      return (this.getChildren(object).length > 0);
      }, (object: any) => {
      this.expandDescendants(this._rowMap.get(this.getId(object)));
    }),
    new MenuAction('Collapse Descendants', 'Collapses all descendants',
      'fa fa-caret-right', (object: any) => {
      return (this.getChildren(object).length > 0);
      }, (object: any) => {
      this.collapseDescendants(this._rowMap.get(this.getId(object)));
    })
  ];
  get menuActions() {
    return this._menuActions;
  }

  protected focusedObjectSubject: BehaviorSubject<any> =
    new BehaviorSubject<any>(undefined);
  private _selectedObjectsSubject: BehaviorSubject<Array<any>> =
    new BehaviorSubject<Array<any>>([]);
  get selectedObjectsSubject() {
    return this._selectedObjectsSubject;
  }

  private _filterSubject: BehaviorSubject<Filter> =
    new BehaviorSubject<Filter>(undefined);
  get filterSubject() {
    return this._filterSubject;
  }
  
  private _filterDelayIdentifier: any;
  
  get multiselectEnabled() {
    return this._multiselectEnabled;
  }
  set multiselectEnabled(multiselectEnabled: boolean) {
    this._multiselectEnabled = multiselectEnabled;
  }
  
  @ViewChild(VirtualScrollComponent)
  private _virtualScrollComponent: VirtualScrollComponent;

  private _rootSubscription: Subscription;
  private _filterSubscription: Subscription;
  private _updateVisibleRowsSubscriptionMap: any = {};

  protected constructor(protected _route: ActivatedRoute,
    protected _dialogService: DialogService, private _multiselectEnabled:
    boolean) {
    this._rootSubscription = this._rootSubject.subscribe((root: any) => {
      if (root) {
        this._rowMap.get(this.getId(root)).depth = 0;
        this.showRows();
      }
    });

    this._route.params.subscribe((parameters: Params) => {
      let focusedRow: TreeRow = this._rowMap.get(parameters['id']);
      if (focusedRow) {
        this.focusedObjectSubject.next(focusedRow.object);
        this.showFocus();
      }
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
      return this.getText(object);
    };
    row.getIcon = () => {
      return this.getIcon(object);
    };
    row.isRowFocused = () => {
      return (object === this.focusedObjectSubject.getValue());
    };
    row.rowFocused = () => {
      this.rowFocused(row);
      this.focusedObjectSubject.next(object);
      this.showFocus();
    };
    row.isRowSelected = () => {
      return (-1 !== this._selectedObjectsSubject.getValue().indexOf(object));
    };
    row.rowSelected = () => {
      let selectedObjects: Array<any> = this._selectedObjectsSubject.getValue();
      let index: number = selectedObjects.indexOf(object);
      if (-1 === index) {
        selectedObjects.push(object);
      } else {
        selectedObjects.splice(index, 1);
      }
      
      this._selectedObjectsSubject.next(selectedObjects);
    };
    row.isRowRoot = () => {
      return (object === this._rootSubject.getValue());
    };
    row.setRowAsRoot = () => {
      this.setRoot(object);
    };
    row.hasChildren = () => {
      return ((object !== this._rootSubject.getValue()) && (this.getChildren(
        object).length > 0));
    };
    row.isMultiselectEnabled = () => {
      return this._multiselectEnabled;
    };
    let id: any = this.getId(object);
    this._rowMap.set(id, row);

    let parent: any = this.getParent(object);
    if (parent) {
      let parentRow: TreeRow = this._rowMap.get(this.getId(parent));
      if (parentRow) {
        row.path.push(...parentRow.path);
      }
    }
    row.path.push(id);

    this._updateVisibleRowsSubscriptionMap[id] = row.
      updateVisibleRows.subscribe((updateVisibleRows: boolean) => {
      if (updateVisibleRows) {
        this.showRows();
      }
    });

    return row;
  }

  protected getRow(id: any): TreeRow {
    return this._rowMap.get(id);
  }
  
  public getRootRow(): TreeRow {
    return this.getRow(this.getId(this._rootSubject.getValue()));
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
    }).updateSize('90%', '90%').afterClosed().subscribe((filter: Filter) => {
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
    this._rowMap.delete(id);
  }

  private showRows(): void {
    this._visibleRows = [];
    this.preTreeTraversalActivity();

    let root: any = this._rootSubject.getValue();
    let rootChildren: Array<any> = this.getChildren(root);
    for (let j: number = 0; j < rootChildren.length; j++) {
      this.processRow(this._rowMap.get(this.getId(rootChildren[j])));
    }

    this.postTreeTraversalActivity();

    this._rowMap.get(this.getId(root)).refresh();
    for (let j: number = 0; j < this._visibleRows.length; j++) {
      this._visibleRows[j].refresh();
    }
  }

  private processRow(row: TreeRow): void {
    this.preRowProcessingActivity(row);

    let filter: Filter = this._filterSubject.getValue();
    let show: boolean = !!filter;
    if (show) {
      row.matchesFilter = this.filter(row.object);
      show = row.matchesFilter;
      if (!row.matchesFilter) {
        let recursiveFilteringFunction: (object: any) => void = (object:
          any) => {
          let children: Array<any> = this.getChildren(object);
          for (let j: number = 0; j < children.length; j++) {
            let matches: boolean = this.filter(children[j]);
            if (!matches) {
              recursiveFilteringFunction(children[j]);
            }

            if (matches) {
              show = true;
              break;
            }
          }
        };
        recursiveFilteringFunction(row.object);
      }
    } else {
      row.matchesFilter = false;
      show = true;
    }

    if (show !== row.visible) {
      row.visible = show;
    }

    let root: any = this._rootSubject.getValue();
    let parent: any = this.getParent(row.object);
    let depth: number = 0;
    if (row.object !== root) {
      while (parent) {
        if (parent === root) {
          break;
        }
        depth++;
        parent = this.getParent(parent);
      }
    }
    row.depth = depth;

    if (row.visible) {
      parent = this.getParent(row.object);
      let addRow: boolean = !parent;
      if (parent) {
        let parentRow: TreeRow = this._rowMap.get(this.getId(parent));
        /* The parent TreeRow's expansion should be checked after the root is
        compared to parentRow */
        addRow = ((parent === root) || (parentRow && parentRow.expanded));
      }

      if (addRow) {
        this._visibleRows.push(row);

        if (row.expanded) {
          let children: Array<any> = this.getChildren(row.object);
          for (let j: number = 0; j < children.length; j++) {
            this.processRow(this._rowMap.get(this.getId(children[j])));
          }
        }
      }
    }
    this.postRowProcessingActivity(row);
  }
  
  protected abstract getId(object: any): any;
  
  protected abstract getParent(object: any): any;
  
  protected abstract getChildren(object: any): Array<any>;
  
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
  
  protected setRoot(object: any) {
    this._rootSubject.next(object);
  }
  
  protected rowFocused(row: TreeRow): void {
    // Subclasses may override this function
  }
  
  protected filter(object: any): boolean {
    return (-1 !== this._filterSubject.getValue().filter([object]).indexOf(
      object));
  }

  protected clear(): void {
    for (let id in this._updateVisibleRowsSubscriptionMap) {
      delete this._updateVisibleRowsSubscriptionMap[id];
    }
    this._visibleRows = [];
    this._rowMap.clear();
  }

  private expandDescendants(row: TreeRow): void {
    let expandFunction: (r: TreeRow) => void = (r: TreeRow) => {
      if (r.visible) {
        r.expanded = true;
        let children: Array<any> = this.getChildren(r.object);
        for (let j: number = 0; j < children.length; j++) {
          expandFunction(this._rowMap.get(this.getId(children[j])));
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
        let children: Array<any> = this.getChildren(r.object);
        for (let j: number = 0; j < children.length; j++) {
          collapseFunction(this._rowMap.get(this.getId(children[j])));
        }
      }
    };

    collapseFunction(row);

    this.showRows();
  }

  protected showFocus(): void {
    let focusedObject: any = this.focusedObjectSubject.getValue();
    if (focusedObject) {
      let id: string = this.getId(focusedObject);
      let selectedRow: TreeRow = this._rowMap.get(id);
      if (selectedRow) {
        let parent: any = this.getParent(focusedObject);
        if (parent) {
          let parentId: string = this.getId(parent);
          let rootId: string = this.getId(this._rootSubject.getValue());
          while (parentId !== rootId) {
            let row: TreeRow = this._rowMap.get(parentId);
            if (!row) {
              break;
            }

            row.expanded = true;
            parent = this.getParent(row.object);
            if (parent) {
              parentId = this.getId(parent);
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
