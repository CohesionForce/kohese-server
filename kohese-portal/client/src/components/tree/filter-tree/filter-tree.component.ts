import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { Tree } from '../tree.class';
import { RowAction } from '../tree-row/tree-row.component';
import { Filter, FilterElement, FilterCriterion, TypeFilterCriterion,
  PropertyFilterCriterion, FilterCriteriaConnection,
  FilterCriteriaConnectionType } from '../../filter/filter.class';

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
  
  private _inTargetingMode: boolean = false;
  get inTargetingMode() {
    return this._inTargetingMode;
  }
  
  private _isTargetingForCopy: boolean = false;
  
  get FilterCriteriaConnectionType() {
    return FilterCriteriaConnectionType;
  }
  
  private _targetFilterSubscription: Subscription;
  
  public constructor(route: ActivatedRoute, _dialogService: DialogService,
    private _changeDetectorRef: ChangeDetectorRef) {
    super(route, _dialogService, true);
  }
  
  public ngOnInit(): void {
    this.rowActions.push(new RowAction('Change Property', 'Change this ' +
      'criterion\'s target property', 'fa fa-mouse-pointer', (object: any) => {
      return (object instanceof PropertyFilterCriterion);
      }, (object: any) => {
      this._dialogService.openSelectDialog('Criterion Property', '',
        'Property', (object as PropertyFilterCriterion).propertyName,
        (object as PropertyFilterCriterion).getFilterablePropertyNames()).
        afterClosed().subscribe((selection: any) => {
        if (selection) {
          (object as PropertyFilterCriterion).propertyName = selection;
          this.getRow(this.getId(object)).refresh();
        }
      });
    }));
    this.rowActions.push(new RowAction('Change Condition', 'Change this ' +
      'criterion\'s condition', 'fa fa-question', (object: any) => {
      return (object instanceof FilterCriterion);
      }, (object: any) => {
      let criterion: FilterCriterion = (object as FilterCriterion);
      let conditions: any;
      if (criterion instanceof TypeFilterCriterion) {
        conditions = TypeFilterCriterion.CONDITIONS;
      } else if (criterion instanceof PropertyFilterCriterion) {
        conditions = PropertyFilterCriterion.CONDITIONS;
      }
      this._dialogService.openSelectDialog('Criterion Condition', '',
        'Condition', criterion.condition, Object.keys(conditions).map((key:
        any) => {
        return conditions[key];
        })).afterClosed().subscribe((selection: any) => {
        if (selection) {
          criterion.condition = selection;
          this.getRow(this.getId(object)).refresh();
        }
      });
    }));
    this.rowActions.push(new RowAction('Change Value', 'Change this ' +
      'criterion\'s value', 'fa fa-pencil', (object: any) => {
      return (object instanceof FilterCriterion);
      }, (object: any) => {
      this._dialogService.openInputDialog('Criterion Value', '',
        DialogComponent.INPUT_TYPES.TEXT, 'Value',
        (object as FilterCriterion).value).afterClosed().subscribe((value:
        any) => {
        if (value) {
          (object as FilterCriterion).value = value;
          this.getRow(this.getId(object)).refresh();
        }
      });
    }));
    this.rowActions.push(new RowAction('Negate', 'Negate this criterion',
      'fa fa-exclamation', (object: any) => {
        return (object instanceof FilterCriterion);
      }, (object: any) => {
        let criterion: FilterCriterion = (object as FilterCriterion);
        criterion.negate = !criterion.negate;
        this.getRow(this.getId(criterion)).refresh();
    }));
    this.rowActions.push(new RowAction('Swap Case Ignoring', 'Swap case ' +
      'ignoring', 'fa fa-exchange', (object: any) => {
      return (object instanceof FilterCriterion);
      }, (object: any) => {
      let criterion: FilterCriterion = (object as FilterCriterion);
      criterion.ignoreCase = !criterion.ignoreCase;
      this.getRow(this.getId(criterion)).refresh();
    }));
    this.rowActions.push(new RowAction('Change Type', 'Change this ' +
      'connection\'s type', 'fa fa-exchange', (object: any) => {
      return (object instanceof FilterCriteriaConnection);
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
    this.rowActions.push(new RowAction('Target', 'Target this connection ' +
      'for the current action', 'fa fa-crosshairs', (object: any) => {
      return ((object instanceof FilterCriteriaConnection) &&
        (this._inTargetingMode));
      }, (object: any) => {
      let connection: FilterCriteriaConnection =
        (object as FilterCriteriaConnection);
      let selectedObjects: Array<any> = this.selectedObjectsSubject.getValue();
      for (let j: number = 0; j < selectedObjects.length; j++) {
        let selectedElement: FilterElement = selectedObjects[j];
        if (this._isTargetingForCopy) {
          if (selectedElement instanceof TypeFilterCriterion) {
            let original: TypeFilterCriterion =
              (selectedElement as TypeFilterCriterion);
            let copy: TypeFilterCriterion = new TypeFilterCriterion(original.
              condition, original.value);
            selectedElement = Object.assign(copy, original);
          } else if (selectedElement instanceof PropertyFilterCriterion) {
            let original: PropertyFilterCriterion =
              (selectedElement as PropertyFilterCriterion);
            let copy: PropertyFilterCriterion = new PropertyFilterCriterion(
              original.propertyName, original.condition, original.value);
            selectedElement = Object.assign(copy, original);
          } else {
            let original: FilterCriteriaConnection =
              (selectedElement as FilterCriteriaConnection);
            let copy: FilterCriteriaConnection = new FilterCriteriaConnection(
              original.type);
            selectedElement = Object.assign(copy, original);
          }
        } else {
          let parent: FilterCriteriaConnection = this.getParent(
            selectedElement);
          if (parent) {
            if (selectedElement instanceof FilterCriterion) {
              parent.criteria.splice(parent.criteria.indexOf((
                selectedElement as FilterCriterion)), 1);
            } else {
              parent.connections.splice(parent.connections.indexOf(
                (selectedElement as FilterCriteriaConnection)), 1);
            }
          }
        }
        
        if (selectedElement instanceof FilterCriterion) {
          connection.criteria.push(selectedElement as FilterCriterion);
        } else {
          connection.connections.push(
            selectedElement as FilterCriteriaConnection);
        }
        
        if (this._isTargetingForCopy) {
          this.buildRow(selectedElement);
        }
        
        this.getRow(this.getId(connection)).expanded = true;
      }
      
      this._inTargetingMode = false;
      this.refresh();
    }));
    
    this.rootRowActions.push(...this.rowActions);
    
    this._targetFilterSubscription = this._targetFilterSubject.subscribe((
      filter: Filter) => {
      this.clear();
      
      if (filter) {
        let elementStack: Array<FilterCriteriaConnection> = [filter.
          rootElement];
        while (elementStack.length > 0) {
          let connection: FilterCriteriaConnection = elementStack.pop();
          this.buildRow(connection);
          
          for (let j: number = 0; j < connection.criteria.length; j++) {
            this.buildRow(connection.criteria[j]);
          }
          
          elementStack.push(...connection.connections);
        }
        
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
    let elementStack: Array<FilterCriteriaConnection> = [this.
      _targetFilterSubject.getValue().rootElement];
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
  
  protected getChildren(object: any): Array<any> {
    let children: Array<FilterElement> = [];
    if (object instanceof FilterCriteriaConnection) {
      let connection: FilterCriteriaConnection =
        (object as FilterCriteriaConnection);
      children.push(...connection.connections);
      children.push(...connection.criteria);
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
  
  public addCriterionToSelectedConnections(criterionType: string): void {
    let selectedObjects: Array<any> = this.selectedObjectsSubject.getValue();
    for (let j: number = 0; j < selectedObjects.length; j++) {
      let connection: FilterCriteriaConnection =
        (selectedObjects[j] as FilterCriteriaConnection);
      let criterion: FilterCriterion;
      if (criterionType === 'TypeFilterCriterion') {
        criterion = new TypeFilterCriterion(TypeFilterCriterion.CONDITIONS.
          SUBCLASS_OF, '');
      } else {
        criterion = new PropertyFilterCriterion('', PropertyFilterCriterion.
          CONDITIONS.BEGINS_WITH, '');
      }
      
      connection.criteria.push(criterion);
      this.buildRow(criterion);
      this.getRow(this.getId(connection)).expanded = true;
    }
    
    this.refresh();
  }
  
  public addConnectionToSelectedConnections(type:
    FilterCriteriaConnectionType): void {
    let selectedObjects: Array<any> = this.selectedObjectsSubject.getValue();
    for (let j: number = 0; j < selectedObjects.length; j++) {
      let connection: FilterCriteriaConnection =
        (selectedObjects[j] as FilterCriteriaConnection);
      let newConnection: FilterCriteriaConnection =
        new FilterCriteriaConnection(type);
      connection.connections.push(newConnection);
      this.buildRow(newConnection);
      this.getRow(this.getId(connection)).expanded = true;
    }
    
    this.refresh();
  }
  
  public deleteSelectedElements(): void {
    let proceed: boolean = true;
    if (!this.areSelectedElementsCriteria()) {
      this._dialogService.openYesNoDialog('Delete Elements Recursively',
        'One or more connections are selected. Deleting connections should ' +
        'delete all descendants of those connections also. Are you sure ' +
        'that you want to proceed?').subscribe((response: any) => {
        if (response) {
          this._deleteSelectedElements();
        }
      });
    } else {
      this._deleteSelectedElements();
    }
  }
  
  private _deleteSelectedElements(): void {
    let selectedObjects: Array<any> = this.selectedObjectsSubject.getValue();
    for (let j: number = 0; j < selectedObjects.length; j++) {
      let selectedElement: FilterElement = selectedObjects[j];
      let elementStack: Array<FilterCriteriaConnection> = [this.
        _targetFilterSubject.getValue().rootElement];
      searchLoop: while (elementStack.length > 0) {
        let connection: FilterCriteriaConnection = elementStack.pop();
        for (let j: number = 0; j < connection.criteria.length; j++) {
          if (selectedElement === connection.criteria[j]) {
            this.deleteRow(this.getId(connection.criteria[j]));
            connection.criteria.splice(j, 1);
            break searchLoop;
          }
        }
        
        for (let j: number = 0; j < connection.connections.length; j++) {
          if (selectedElement === connection.connections[j]) {
            this.deleteRow(this.getId(connection.connections[j]));
            connection.connections.splice(j, 1);
            break searchLoop;
          } else {
            elementStack.push(connection.connections[j]);
          }
        }
      }
    }
    
    selectedObjects.length = 0;
    this.selectedObjectsSubject.next(selectedObjects);
    this.refresh();
  }
  
  public enterCopyTargetingMode(): void {
    this._isTargetingForCopy = true;
    this._inTargetingMode = true;
    
    this.refresh();
  }
  
  public enterMoveTargetingMode(): void {
    this._isTargetingForCopy = false;
    this._inTargetingMode = true;
    
    this.refresh();
  }
  
  public exitTargetingMode(): void {
    this._inTargetingMode = false;
    
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
}