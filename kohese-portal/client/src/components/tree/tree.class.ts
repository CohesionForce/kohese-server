
import {tap} from 'rxjs/operators';
import { ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { VirtualScrollComponent } from 'angular2-virtual-scroll';
import { BehaviorSubject ,  Observable ,  Subscription } from 'rxjs';

import { DialogService } from '../../services/dialog/dialog.service';
import { TreeRow } from './tree-row/tree-row.class';
import { DisplayableEntity, Action,
  ActionGroup } from './tree-row/tree-row.component';
import { Filter, FilterCriterion } from '../filter/filter.class';
import { FilterComponent } from '../filter/filter.component';

export enum TargetPosition {
  BEFORE = 'Before', AFTER = 'After', CHILD = 'Child'
}

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

  private _anchorAction: Action = new Action('Anchor', 'Set the object of ' +
    'this row as the root', 'fa fa-anchor', (object: any) => {
    return (object !== this._rootSubject.getValue() && !this.
      _inTargetingMode);
    }, (object: any) => {
    this.setRoot(object);
  });

  private _absoluteRoot: any;
  get absoluteRoot() {
    return this._absoluteRoot;
  }
  set absoluteRoot(absoluteRoot: any) {
    this._absoluteRoot = absoluteRoot;
  }

  private absoluteRootAction: Action = new Action('AbsoluteRoot', 'return to the absolute root of this object',
    'fa fa-arrow-circle-o-up', (object: any) => {
      return (object !== this._absoluteRoot && !this._inTargetingMode);
    }, (object: any) => {
      if (this._absoluteRoot) {
        this.setRoot(this._absoluteRoot);
      } else {
        console.log('*** No Absolute Root Available');
      }
    }
  )

  private _showRootWithDescendants: boolean = false;
  get showRootWithDescendants() {
    return this._showRootWithDescendants;
  }
  set showRootWithDescendants(showRootWithDescendants: boolean) {
    this._showRootWithDescendants = showRootWithDescendants;
    if (this.showRootWithDescendants) {
      if (this._rowActions.indexOf(this._anchorAction) !== -1) {
        this._rowActions.splice(this._rowActions.indexOf(this._anchorAction),
          1);
      }
    } else if (this._rowActions.indexOf(this._anchorAction) === -1) {
      this._rowActions.push(this._anchorAction);
    }
  }

  private _canMoveRows: boolean = false;
  get canMoveRows() {
    return this._canMoveRows;
  }
  set canMoveRows(canMoveRows: boolean) {
    this._canMoveRows = canMoveRows;
  }

  private _expandDescendantsAction: Action = new Action('Expand Descendants',
    'Expand All', 'fa fa-chevron-down', (object: any) => {
    return (this.getChildren(object).length > 0);
    }, (object: any) => {
    this.expandDescendants(this._rowMap.get(this.getId(object)));
  });

  private _collapseDescendantsAction: Action = new Action('Collapse ' +
    'Descendants', 'Collapse All', 'fa fa-chevron-up', (object:
    any) => {
    return (this.getChildren(object).length > 0);
    }, (object: any) => {
    this.collapseDescendants(this._rowMap.get(this.getId(object)));
  });

  private _targetBeforeAction: Action = new Action(TargetPosition.BEFORE,
    'Place the targeting object or objects under this object', 'fa ' +
    'fa-crosshairs', (object: any) => {
    return true;
    }, async (object: any) => {
    let selectedObjects: Array<any> = this._selectedObjectsSubject.getValue();
    for (let j: number = 0; j < selectedObjects.length; j++) {
      let targetingObject: any = selectedObjects[j];
      await this.target(object, targetingObject, TargetPosition.BEFORE);
    }

    this.exitTargetingMode();
  });
  private _targetAfterAction: Action = new Action(TargetPosition.AFTER,
    'Place the targeting object or objects after this object', 'fa ' +
    'fa-crosshairs', (object: any) => {
    return true;
    }, async (object: any) => {
    let selectedObjects: Array<any> = this._selectedObjectsSubject.getValue();
    for (let j: number = 0; j < selectedObjects.length; j++) {
      let targetingObject: any = selectedObjects[j];
      await this.target(object, targetingObject, TargetPosition.AFTER);
    }

    this.exitTargetingMode();
  });
  private _targetChildAction: Action = new Action(TargetPosition.CHILD,
    'Place the targeting object or objects under this object', 'fa ' +
    'fa-crosshairs', (object: any) => {
    return true;
    }, async (object: any) => {
    let selectedObjects: Array<any> = this._selectedObjectsSubject.getValue();
    for (let j: number = 0; j < selectedObjects.length; j++) {
      let targetingObject: any = selectedObjects[j];
      await this.target(object, targetingObject, TargetPosition.CHILD);
    }

    this.exitTargetingMode();
  });

  private _targetActionGroup: ActionGroup = new ActionGroup('Target', 'Target ' +
    'this object for the current action', 'fa fa-crosshairs', (object:
    any) => {
    return (this._inTargetingMode && (-1 === this._selectedObjectsSubject.
      getValue().indexOf(this.rootSubject.getValue())) && (-1 === this.
      _selectedObjectsSubject.getValue().indexOf(object)) && !this.
      isAncestorSelected(this._selectedObjectsSubject.getValue(), object));
    }, [this._targetBeforeAction, this._targetAfterAction, this.
    _targetChildAction]);

  private _exitTargetingModeAction: Action = new Action('Exit ' +
    'Targeting Mode', 'Exit Targeting Mode', 'fa fa-times', (object: any) => {
    return this._inTargetingMode;
    }, (object: any) => {
    this.exitTargetingMode();
  });

  private _moveAction: Action = new Action('Move', 'Move this object', 'fa fa-arrow-circle-o-right', (object: any) => {
    return this.mayMove(object);
  }, (object: any) => {
    let selectedObjects: Array<any> = this.selectedObjectsSubject.getValue();
    selectedObjects.push(object);
    this.selectedObjectsSubject.next(selectedObjects);
    this._inTargetingMode = true;
    this.refresh();
  });

  private focusParentAction: Action = new Action('Set Parent As Root', 'Set the parent of this row\'s ' +
      'object as the root', 'fa fa-level-up', (object: any) => {
      return (object !== this._absoluteRoot && !this._inTargetingMode && !!this.getParent(object));
      }, (object: any) => {
      this.setRoot(this.getParent(object));
    });

  private _rootRowActions: Array<DisplayableEntity> = [
    this._expandDescendantsAction,
    this._collapseDescendantsAction,
    this.focusParentAction,
    this.absoluteRootAction,
    this._targetActionGroup,
    this._exitTargetingModeAction
  ];

  get rootRowActions() {
    return this._rootRowActions;
  }

  private _rootMenuActions: Array<DisplayableEntity> = [];
  get rootMenuActions() {
    return this._rootMenuActions;
  }

  private _rowActions: Array<DisplayableEntity> = [
    this._anchorAction,
    this._targetActionGroup,
    this._exitTargetingModeAction
  ];
  get rowActions() {
    return this._rowActions;
  }

  private _menuActions: Array<Action> = [
    this._expandDescendantsAction,
    this._collapseDescendantsAction,
    this._moveAction

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

  private _inTargetingMode: boolean = false;
  get inTargetingMode() {
    return this._inTargetingMode;
  }

  private _filterSubject: BehaviorSubject<Filter> =
    new BehaviorSubject<Filter>(undefined);
  get filterSubject() {
    return this._filterSubject;
  }

  @ViewChild(VirtualScrollComponent)
  private _virtualScrollComponent: VirtualScrollComponent;

  private _rootSubscription: Subscription;
  private _updateVisibleRowsSubscriptionMap: any = {};

  protected constructor(protected _route: ActivatedRoute,
    protected _dialogService: DialogService) {
    this._rootSubscription = this._rootSubject.subscribe((root: any) => {
      if (root) {
        let rowId = this.getId(root);
        let rootRow = this._rowMap.get(rowId);
        if (rootRow) {
          rootRow.depth = 0;
        }
        this.showRows();
      }
    });
  }

  protected initialize(): void {
    this._route.params.subscribe((parameters: Params) => {
      let focusedRow: TreeRow = this._rowMap.get(parameters['id']);
      if (focusedRow) {
        this.focusedObjectSubject.next(focusedRow.object);
        this.showFocus();
      }
    });
  }

  protected prepareForDismantling(): void {
    this.clear();
    this._rootSubscription.unsubscribe();
  }

  protected buildRow(object: any): TreeRow {
    let row: TreeRow = new TreeRow(object);
    row.getText = () => {
      return this.getText(object);
    };
    row.getTags = () => {
      return this.getTags(object);
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

      if (this._canMoveRows) {
        let descendantTreeRowStack: Array<TreeRow> = [row];
        while (descendantTreeRowStack.length > 0) {
          let descendantRow: TreeRow = descendantTreeRowStack.pop();
          descendantRow.refresh();
          let children: Array<any> = this.getChildren(descendantRow.object);
          for (let j: number = 0; j < children.length; j++) {
            descendantTreeRowStack.push(this._rowMap.get(this.getId(children[
              j])));
          }
        }
      }
    };
    row.isRowRoot = () => {
      return (object === this._rootSubject.getValue());
    };
    row.hasChildren = () => {
      return ((this.getChildren(object).length > 0) && (this.
        _showRootWithDescendants || (object !== this._rootSubject.
        getValue())));
    };
    row.isMultiselectEnabled = () => {
      return this.isMultiselectEnabled(object);
    };
    row.hasError = () => {
      return this.hasError(object);
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
      this._virtualScrollComponent.refresh();
    }
  }

  public openFilterDialog(inputFilter: Filter): Observable<any> {
    return this._dialogService.openComponentDialog(FilterComponent, {
      data: {
        filter: inputFilter
      }
    }).updateSize('90%', '90%').afterClosed().pipe(tap((resultingFilter: Filter) => {
      if (resultingFilter) {
        this._filterSubject.next(resultingFilter);
        this.refresh();
      }
    }));
  }

  public removeFilter(): void {
    this._filterSubject.next(undefined);
    this.refresh();
  }

  public setExpansion(object: any, expand: boolean): void {
    this._rowMap.get(this.getId(object)).expanded = expand;
  }

  public selectAll(): void {
    let selectedObjects: Array<any> = this._selectedObjectsSubject.getValue();
    let rowArray: Array<TreeRow> = Array.from(this._rowMap.values());
    let expandedObjects: Array<any> = [];
    for (let j: number = 0; j < rowArray.length; j++) {
      if (rowArray[j].expanded) {
        expandedObjects.push(rowArray[j].object);
      } else {
        rowArray[j].expanded = true;
      }
    }

    this.refresh();

    let filter: Filter = this._filterSubject.getValue();
    for (let j: number = 0; j < this._visibleRows.length; j++) {
      if (this.isMultiselectEnabled(this._visibleRows[j].object) && (!filter ||
        this._visibleRows[j].matchesFilter)) {
        selectedObjects.push(this._visibleRows[j].object);
      }
    }

    for (let j: number = 0; j < rowArray.length; j++) {
      if (-1 === expandedObjects.indexOf(rowArray[j].object)) {
        rowArray[j].expanded = false;
      }
    }

    this._selectedObjectsSubject.next(selectedObjects);
    this.refresh();
  }

  public deselectAll(): void {
    let selectedObjects: Array<any> = this._selectedObjectsSubject.getValue();
    let rowArray: Array<TreeRow> = Array.from(this._rowMap.values());
    let expandedObjects: Array<any> = [];
    for (let j: number = 0; j < rowArray.length; j++) {
      if (rowArray[j].expanded) {
        expandedObjects.push(rowArray[j].object);
      } else {
        rowArray[j].expanded = true;
      }
    }

    this.refresh();

    let filter: Filter = this._filterSubject.getValue();
    for (let j: number = 0; j < this._visibleRows.length; j++) {
      if (this.isMultiselectEnabled(this._visibleRows[j].object) && (!filter ||
        this._visibleRows[j].matchesFilter)) {
        selectedObjects.splice(selectedObjects.indexOf(this._visibleRows[j].
          object), 1);
      }
    }

    for (let j: number = 0; j < rowArray.length; j++) {
      if (-1 === expandedObjects.indexOf(rowArray[j].object)) {
        rowArray[j].expanded = false;
      }
    }

    this._selectedObjectsSubject.next(selectedObjects);
    this.refresh();
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
    let rootRow: TreeRow = this._rowMap.get(this.getId(root));
    if (this._showRootWithDescendants) {
      this.processRow(rootRow);
    } else {
      let rootChildren: Array<any> = this.getChildren(root);
      for (let j: number = 0; j < rootChildren.length; j++) {
        this.processRow(this._rowMap.get(this.getId(rootChildren[j])));
      }
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
        if (this._showRootWithDescendants) {
          depth++;
        }

        if (parent === root) {
          break;
        }

        if (!this._showRootWithDescendants) {
          depth++;
        }

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

  protected getTags(object: any): Array<string> {
    return [];
  }

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

  protected isMultiselectEnabled(object: any): boolean {
    return this._canMoveRows && this._inTargetingMode;
  }

  protected hasError(object: any): boolean {
    return false;
  }

  protected async target(target: any, targetingObject: any, targetPosition: TargetPosition): Promise<void> {
    // Subclasses may override this function
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

  protected isAncestorSelected(selectedObjects: Array<any>, object: any):
    boolean {
    let isAncestorSelected: boolean = false;
    let parent: any = this.getParent(object);
    while (parent) {
      if (-1 !== selectedObjects.indexOf(parent)) {
        isAncestorSelected = true;
        break;
      }

      parent = this.getParent(parent);
    }

    return isAncestorSelected;
  }

  protected mayMove(object: any): boolean {
    return this._canMoveRows && !this._inTargetingMode;
  }

  private exitTargetingMode(): void {
    let selectedObjects: Array<any> = this._selectedObjectsSubject.getValue();
    selectedObjects.length = 0;
    this._selectedObjectsSubject.next(selectedObjects);
    this._inTargetingMode = false;
    this.refresh();
  }
}
