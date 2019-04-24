import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject ,  Subscription } from 'rxjs';

import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row/tree-row.class';
import { Action } from '../tree-row/tree-row.component';
import { Filter, FilterElement, FilterCriterion, FilterCriteriaConnection,
  FilterCriteriaConnectionType,
  FilterableProperty } from '../../filter/filter.class';

class AddRowObject {
  public constructor(public connection: FilterCriteriaConnection) {
  }
}

@Component({
  selector: 'filter-tree',
  templateUrl: './filter-tree.component.html',
  styleUrls: ['../tree.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterTreeComponent extends Tree implements OnInit, OnDestroy {
  private _targetFilterSubject: BehaviorSubject<Filter>;
  get targetFilterSubject() {
    return this._targetFilterSubject;
  }
  @Input('targetFilterSubject')
  set targetFilterSubject(targetFilterSubject: BehaviorSubject<Filter>) {
    this._targetFilterSubject = targetFilterSubject;
  }

  private _localInTargetingMode: boolean = false;
  get localInTargetingMode() {
    return this._localInTargetingMode;
  }

  private _moveOrCopyElement: FilterElement = undefined;
  private _isTargetingForCopy: boolean = false;

  private _addRowObjectMap: Map<FilterCriteriaConnection, AddRowObject> =
    new Map<FilterCriteriaConnection, AddRowObject>();
    
  private _targetFilterSubscription: Subscription;

  public constructor(route: ActivatedRoute, _dialogService: DialogService,
    private _changeDetectorRef: ChangeDetectorRef) {
    super(route, _dialogService);
    this.showRootWithDescendants = true;
  }

  public ngOnInit(): void {
    this.rowActions.push(new Action('Change Type', 'Change this ' +
      'connection\'s type', 'fa fa-exchange', (object: any) => {
      return ((object instanceof FilterCriteriaConnection) && !this.
        _localInTargetingMode);
      }, (object: any) => {
      let connection: FilterCriteriaConnection =
        (object as FilterCriteriaConnection);
      if (connection.type === FilterCriteriaConnectionType.AND) {
        connection.type = FilterCriteriaConnectionType.OR;
      } else {
        connection.type = FilterCriteriaConnectionType.AND;
      }
      this.getRow(this.getId(connection)).refresh();
    }));
    this.rowActions.push(new Action('Copy', 'Copy this element',
      'fa fa-copy', (object: any) => {
      return (!(object instanceof AddRowObject) && !this._localInTargetingMode &&
        (object !== this.rootSubject.getValue()));
      }, (object: any) => {
      this.enterCopyTargetingMode(object);
    }));
    this.rowActions.push(new Action('Move', 'Move this element',
      'fa fa-arrow-circle-o-right', (object: any) => {
      return (!(object instanceof AddRowObject) && !this._localInTargetingMode &&
        (object !== this.rootSubject.getValue()));
      }, (object: any) => {
      this.enterMoveTargetingMode(object);
    }));
    this.rowActions.push(new Action('Target', 'Target this connection ' +
      'for the current action', 'fa fa-crosshairs', (object: any) => {
      return ((object instanceof FilterCriteriaConnection) &&
        (this._localInTargetingMode) && (this._isTargetingForCopy || (this.
        _moveOrCopyElement && (this._moveOrCopyElement !== object) && !this.
        isAncestorSelected([this._moveOrCopyElement], object)) || (!this.
        _moveOrCopyElement && (-1 === this.selectedObjectsSubject.getValue().
        indexOf(this.rootSubject.getValue())) && ((-1 === this.
        selectedObjectsSubject.getValue().indexOf(object)) && !this.
        isAncestorSelected(this.selectedObjectsSubject.getValue(), object)))));
      }, (object: any) => {
      let connection: FilterCriteriaConnection =
        (object as FilterCriteriaConnection);
      if (this._moveOrCopyElement) {
        this.connectionTargeted(connection, this._moveOrCopyElement);
      } else {
        let selectedObjects: Array<any> = this.selectedObjectsSubject.
          getValue();
        for (let j: number = 0; j < selectedObjects.length; j++) {
          this.connectionTargeted(connection, selectedObjects[j]);
        }
      }

      this._localInTargetingMode = false;
      this.refresh();
    }));
    this.rowActions.push(new Action('Exit Targeting Mode', 'Exit ' +
      'Targeting Mode', 'fa fa-times', (object: any) => {
      return (!(object instanceof AddRowObject) && this._localInTargetingMode);
      }, (object: any) => {
      this.localExitTargetingMode();
    }));
    this.rowActions.push(new Action('Delete', 'Delete this element',
      'fa fa-trash', (object: any) => {
      return (!(object instanceof AddRowObject) && !this._localInTargetingMode && (
        object !== this.rootSubject.getValue()));
      }, (object: any) => {
      if (object instanceof FilterCriteriaConnection) {
        this._dialogService.openYesNoDialog('Delete Elements Recursively',
          'Deleting this connection should delete all descendants of this ' +
          'connection also. Are you sure that you want to proceed?').subscribe(
          (response: any) => {
          if (response) {
            this.deleteElement(object as FilterElement);
            this.refresh();
          }
        });
      } else {
        this.deleteElement(object as FilterElement);
        this.refresh();
      }
    }));

    this.rootRowActions.push(...this.rowActions);

    this._targetFilterSubscription = this._targetFilterSubject.subscribe((
      filter: Filter) => {
      this.clear();

      if (filter) {
        this.buildRows(filter.rootElement);
        this.rootSubject.next(filter.rootElement);
      }
    });
  }

  public ngOnDestroy(): void {
    this.prepareForDismantling();
    this._targetFilterSubscription.unsubscribe();
  }

  protected getId(object: any): any {
    return object;
  }

  protected getParent(object: any): any {
    if (object instanceof AddRowObject) {
      return (object as AddRowObject).connection;
    } else {
      let root: FilterCriteriaConnection = this._targetFilterSubject.getValue().
        rootElement;
      if (object === root) {
        return undefined;
      } else {
        let elementStack: Array<FilterCriteriaConnection> = [root];
        while (elementStack.length > 0) {
          let connection: FilterCriteriaConnection = elementStack.pop();
        
          if (object instanceof FilterCriterion) {
            for (let j: number = 0; j < connection.criteria.length; j++) {
              if (object === connection.criteria[j]) {
                return connection;
              }
            }
          }

          for (let j: number = 0; j < connection.connections.length; j++) {
            if (object === connection.connections[j]) {
              return connection;
            } else {
              elementStack.push(connection.connections[j]);
            }
          }
        }
      }
    }
  }

  protected getChildren(object: any): Array<any> {
    let children: Array<FilterElement> = [];
    if (object instanceof FilterCriteriaConnection) {
      let connection: FilterCriteriaConnection =
        (object as FilterCriteriaConnection);
      children.push(...connection.connections);
      children.push(...connection.criteria);
      children.push(this._addRowObjectMap.get(connection));
    }

    return children;
  }

  protected getText(object: any): string {
    return object.toString();
  }

  protected getIcon(object: any): string {
    return '';
  }

  protected postTreeTraversalActivity(): void {
    this._changeDetectorRef.markForCheck();
  }
  
  protected isMultiselectEnabled(object: any): boolean {
    return true;
  }
  
  public addElementToConnection(type: string, connection:
    FilterCriteriaConnection): void {
    let element: FilterElement;
    if (type.startsWith('FilterCriteriaConnection')) {
      let connectionType: FilterCriteriaConnectionType;
      if (type.split(':')[1] === 'AND') {
        connectionType = FilterCriteriaConnectionType.AND;
      } else {
        connectionType = FilterCriteriaConnectionType.OR;
      }
      element = new FilterCriteriaConnection(connectionType);
      connection.connections.push(element as FilterCriteriaConnection);
      let addRowObject: AddRowObject = new AddRowObject(
        element as FilterCriteriaConnection);
      this._addRowObjectMap.set(element as FilterCriteriaConnection,
        addRowObject);
      this.buildRow(addRowObject);
    } else {
      element = new FilterCriterion(this._targetFilterSubject.getValue().
        filterableProperties[0], FilterCriterion.CONDITIONS.CONTAINS, '');
      connection.criteria.push(element as FilterCriterion);
    }
    
    this.buildRow(element);
    if (element instanceof FilterCriteriaConnection) {
      this.getRow(this.getId(element)).expanded = true;
    }
    this.getRow(this.getId(connection)).expanded = true;
    this.refresh();
  }
  
  public addCriterionToSelectedConnections(): void {
    let selectedObjects: Array<any> = this.selectedObjectsSubject.getValue();
    for (let j: number = 0; j < selectedObjects.length; j++) {
      let connection: FilterCriteriaConnection =
        (selectedObjects[j] as FilterCriteriaConnection);
      this.addElementToConnection('FilterCriterion', connection);
    }
  }

  public addConnectionToSelectedConnections(type: string): void {
    let selectedObjects: Array<any> = this.selectedObjectsSubject.getValue();
    for (let j: number = 0; j < selectedObjects.length; j++) {
      let connection: FilterCriteriaConnection =
        (selectedObjects[j] as FilterCriteriaConnection);
      this.addElementToConnection('FilterCriteriaConnection:' + type,
        connection);
    }
  }

  public deleteSelectedElements(): void {
    let selectedObjects: Array<any> = this.selectedObjectsSubject.getValue();
    if (!this.areSelectedElementsCriteria()) {
      this._dialogService.openYesNoDialog('Delete Elements Recursively',
        'One or more connections are selected. Deleting connections should ' +
        'delete all descendants of those connections also. Are you sure ' +
        'that you want to proceed?').subscribe((response: any) => {
        if (response) {
          for (let j: number = 0; j < selectedObjects.length; j++) {
            this.deleteElement(selectedObjects[j] as FilterElement);
          }
          
          this.deselectAll();
        }
      });
    } else {
      for (let j: number = 0; j < selectedObjects.length; j++) {
        this.deleteElement(selectedObjects[j] as FilterElement);
      }
      
      this.deselectAll();
    }
  }

  private deleteElement(element: FilterElement): void {
    this.deleteRow(this.getId(element));
    this._targetFilterSubject.getValue().removeElement(element);
    if (element instanceof FilterCriteriaConnection) {
      this._addRowObjectMap.delete(element);
    }
  }

  public enterCopyTargetingMode(moveOrCopyElement: FilterElement): void {
    this._isTargetingForCopy = true;
    this._moveOrCopyElement = moveOrCopyElement;
    this._localInTargetingMode = true;

    this.refresh();
  }

  public enterMoveTargetingMode(moveOrCopyElement: FilterElement): void {
    this._isTargetingForCopy = false;
    this._moveOrCopyElement = moveOrCopyElement;
    this._localInTargetingMode = true;

    this.refresh();
  }

  public localExitTargetingMode(): void {
    this._localInTargetingMode = false;

    this.refresh();
  }

  public areSelectedElementsCriteria(): boolean {
    let areCriteria: boolean = true;
    let selectedObjects: Array<any> = this.selectedObjectsSubject.getValue();
    for (let j: number = 0; j < selectedObjects.length; j++) {
      if (!(selectedObjects[j] instanceof FilterCriterion)) {
        areCriteria = false;
        break;
      }
    }

    return areCriteria;
  }

  public areSelectedElementsConnections(): boolean {
    let areConnections: boolean = true;
    let selectedObjects: Array<any> = this.selectedObjectsSubject.getValue();
    for (let j: number = 0; j < selectedObjects.length; j++) {
      if (!(selectedObjects[j] instanceof FilterCriteriaConnection)) {
        areConnections = false;
        break;
      }
    }

    return areConnections;
  }

  private buildRows(startingConnection: FilterCriteriaConnection): void {
    let elementStack: Array<FilterCriteriaConnection> = [startingConnection];
    while (elementStack.length > 0) {
      let connection: FilterCriteriaConnection = elementStack.pop();
      let row: TreeRow = this.buildRow(connection);

      for (let j: number = 0; j < connection.criteria.length; j++) {
        this.buildRow(connection.criteria[j]);
      }
      
      let addRowObject: AddRowObject = new AddRowObject(connection);
      this._addRowObjectMap.set(connection, addRowObject);
      row.expanded = true;
      this.buildRow(addRowObject);

      elementStack.push(...connection.connections);
    }
  }
  
  private connectionTargeted(connection: FilterCriteriaConnection, element:
    FilterElement): void {
    if (this._isTargetingForCopy) {
      element = this.copy(element);
    } else {
      let parent: FilterCriteriaConnection = this.getParent(element);
      if (parent) {
        if (element instanceof FilterCriterion) {
          parent.criteria.splice(parent.criteria.indexOf((
            element as FilterCriterion)), 1);
        } else {
          parent.connections.splice(parent.connections.indexOf(
            (element as FilterCriteriaConnection)), 1);
        }
      }
    }

    if (element instanceof FilterCriterion) {
      connection.criteria.push(element as FilterCriterion);
    } else {
      connection.connections.push(element as FilterCriteriaConnection);
    }

    if (this._isTargetingForCopy) {
      if (element instanceof FilterCriteriaConnection) {
        this.buildRows(element);
      } else {
        this.buildRow(element);
      }
    }

    this.getRow(this.getId(connection)).expanded = true;
  }

  private copy(element: FilterElement): FilterElement {
    let copiedElement: FilterElement;
    if (element instanceof FilterCriterion) {
      let original: FilterCriterion = (element as FilterCriterion);
      copiedElement = new FilterCriterion(
        original.property, original.condition, original.value);
      copiedElement = Object.assign(copiedElement, original);
    } else {
      let original: FilterCriteriaConnection =
        (element as FilterCriteriaConnection);
      copiedElement = new FilterCriteriaConnection(
        original.type);
      for (let j: number = 0; j < original.connections.length; j++) {
        (copiedElement as FilterCriteriaConnection).connections.push(this.copy(
          original.connections[j]) as FilterCriteriaConnection);
      }
      for (let j: number = 0; j < original.criteria.length; j++) {
        (copiedElement as FilterCriteriaConnection).criteria.push(this.copy(
          original.criteria[j]) as FilterCriterion);
      }
    }

    return copiedElement;
  }
}
