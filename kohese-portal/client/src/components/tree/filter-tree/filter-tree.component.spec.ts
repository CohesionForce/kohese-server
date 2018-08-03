import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MaterialModule } from '../../../material.module';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { FilterTreeComponent } from './filter-tree.component';
import { FilterCriterion, FilterCriteriaConnection,
  FilterCriteriaConnectionType } from '../../filter/filter.class';

describe('Component: filter-tree', () => {
  let component: FilterTreeComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterTreeComponent],
      imports: [MaterialModule],
      providers: [{
          provide: ActivatedRoute,
          useValue: { params: new BehaviorSubject<any>({ id: ''}) }
        }, { provide: DialogService, useClass: MockDialogService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    
    let fixture: ComponentFixture<FilterTreeComponent> = TestBed.
      createComponent(FilterTreeComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });
  
  it('adds a FilterElement of the specified type to the given connection',
    () => {
    let connection: FilterCriteriaConnection = new FilterCriteriaConnection(
      FilterCriteriaConnectionType.AND);
    component.addElementToConnection('FilterCriteriaConnection:AND',
      connection);
    expect(connection.connections.length).toBeGreaterThan(0);
    component.addElementToConnection('FilterCriterion', connection);
    expect(connection.criteria.length).toBeGreaterThan(0);
  });
  
  it('adds a FilterCriterion to the selected connections', () => {
    let connection: FilterCriteriaConnection = new FilterCriteriaConnection(
      FilterCriteriaConnectionType.AND);
    component.selectedObjectsSubject.next([connection]);
    component.addCriterionToSelectedConnections();
    expect(connection.criteria.length).toBeGreaterThan(0);
  });
  
  it('adds a FilterCriteriaConnection to the selected connections', () => {
    let connection: FilterCriteriaConnection = new FilterCriteriaConnection(
      FilterCriteriaConnectionType.AND);
    component.selectedObjectsSubject.next([connection]);
    component.addConnectionToSelectedConnections('AND');
    expect(connection.connections.length).toBeGreaterThan(0);
  });
  
  it('deletes a FilterCriterion', () => {
    let criterion: FilterCriterion = new FilterCriterion(undefined,
      FilterCriterion.CONDITIONS.CONTAINS, '');
    component.selectedObjectsSubject.next([criterion]);
    component.deleteSelectedElements();
    expect(component.selectedObjectsSubject.getValue().indexOf(criterion)).
      toEqual(-1);
  });
  
  it('enters Targeting Mode', () => {
    component.enterCopyTargetingMode(undefined);
    expect(component.inTargetingMode).toEqual(true);
  });
  
  it('exits Targeting Mode', () => {
    component.exitTargetingMode();
    expect(component.inTargetingMode).toEqual(false);
  });
  
  it('determines if all of the selected objects are connections', () => {
    component.selectedObjectsSubject.next([new FilterCriteriaConnection(
      FilterCriteriaConnectionType.AND), new FilterCriterion(undefined,
      FilterCriterion.CONDITIONS.CONTAINS, '')]);
    expect(component.areSelectedElementsConnections()).toEqual(false);
  });
  
  it('determines if all of the selected objects are criteria', () => {
    component.selectedObjectsSubject.next([new FilterCriteriaConnection(
      FilterCriteriaConnectionType.AND), new FilterCriterion(undefined,
      FilterCriterion.CONDITIONS.CONTAINS, '')]);
    expect(component.areSelectedElementsCriteria()).toEqual(false);
  });
});