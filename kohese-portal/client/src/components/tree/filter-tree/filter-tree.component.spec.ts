/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { MaterialModule } from '../../../material.module';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { FilterTreeComponent } from './filter-tree.component';
import { Filter, FilterableProperty, ValueInputType, FilterCriterion,
  FilterCriteriaConnection,
  FilterCriteriaConnectionType } from '../../filter/filter.class';

describe('Component: filter-tree', () => {
  let component: FilterTreeComponent;
  let filterableProperty: FilterableProperty = new FilterableProperty(
    'Filterable Property', [], ValueInputType.STRING, []);

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
    component.targetFilterSubject = new BehaviorSubject<Filter>(new Filter());

    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('adds a FilterElement of the specified type to the given connection',
    () => {
    let connection: FilterCriteriaConnection = component.targetFilterSubject.
      getValue().rootElement;
    component.addElementToConnection('FilterCriteriaConnection:AND',
      connection);
    expect(connection.connections.length).toBeGreaterThan(0);
    component.addElementToConnection('FilterCriterion', connection);
    expect(connection.criteria.length).toBeGreaterThan(0);
  });

  it('adds a FilterCriterion to the selected connections', () => {
    let connection: FilterCriteriaConnection = component.targetFilterSubject.
      getValue().rootElement;
    component.selectedObjectsSubject.next([connection]);
    component.addCriterionToSelectedConnections();
    expect(connection.criteria.length).toBeGreaterThan(0);
  });

  it('adds a FilterCriteriaConnection to the selected connections', () => {
    let connection: FilterCriteriaConnection = component.targetFilterSubject.
      getValue().rootElement;
    component.selectedObjectsSubject.next([connection]);
    component.addConnectionToSelectedConnections('AND');
    expect(connection.connections.length).toBeGreaterThan(0);
  });

  it('deletes a FilterCriterion', () => {
    let criterion: FilterCriterion = new FilterCriterion(filterableProperty,
      FilterCriterion.CONDITIONS.CONTAINS, '');
    component.selectedObjectsSubject.next([criterion]);
    component.deleteSelectedElements();
    expect(component.selectedObjectsSubject.getValue().indexOf(criterion)).
      toEqual(-1);
  });

  it('enters Targeting Mode', () => {
    component.enterCopyTargetingMode(undefined);
    expect(component.localInTargetingMode).toEqual(true);
  });

  it('exits Targeting Mode', () => {
    component.localExitTargetingMode();
    expect(component.localInTargetingMode).toEqual(false);
  });

  it('determines if all of the selected objects are connections', () => {
    component.selectedObjectsSubject.next([new FilterCriteriaConnection(
      FilterCriteriaConnectionType.AND), new FilterCriterion(
      filterableProperty, FilterCriterion.CONDITIONS.CONTAINS, '')]);
    expect(component.areSelectedElementsConnections()).toEqual(false);
  });

  it('determines if all of the selected objects are criteria', () => {
    component.selectedObjectsSubject.next([new FilterCriteriaConnection(
      FilterCriteriaConnectionType.AND), new FilterCriterion(
      filterableProperty, FilterCriterion.CONDITIONS.CONTAINS, '')]);
    expect(component.areSelectedElementsCriteria()).toEqual(false);
  });

  it('suppresses display of the Anchor Action', () => {
    let anchorActionPresent: boolean = false;
    for (let j: number = 0; j < component.rowActions.length; j++) {
      if (component.rowActions[j].text === 'Anchor') {
        anchorActionPresent = true;
        break;
      }
    }

    expect(anchorActionPresent).toEqual(false);
  });
});
