import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { KTableComponent } from './k-table.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { MockAction } from '../../../../mocks/data/MockItem';
import { MockDataModel } from '../../../../mocks/data/MockDataModel';
import { MoveDirection } from '../k-proxy-selector/proxy-table/proxy-table.component';

describe('Component: k-table', () => {
  let component: KTableComponent;
  let references: Array<any> = [{ id: 'Kurios Iesous' }, { id: 'test-uuid3' },
    { id: 'test-uuid1' }];
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KTableComponent],
      providers: [
        { provide: DynamicTypesService, useClass: MockDynamicTypesService },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    
    let fixture: ComponentFixture<KTableComponent> = TestBed.createComponent(
      KTableComponent);
    component = fixture.componentInstance;
    component.proxy = new ItemProxy('Action', MockAction());
    component.proxy.model = new ItemProxy('KoheseModel', MockDataModel());
    component.proxy.item.predecessors = references;
    component.property = {
      propertyName: {
        kind: 'Action',
        attribute: 'predecessors'
      },
      hideLabel: false,
      labelOrientation: 'Top',
      kind: 'table',
      tableDefinition: {
        columns: [
          'name'
        ],
        expandedFormat: {
          column1: [],
          column2: [],
          column3: [],
          column4: []
        }
      }
    };
    fixture.detectChanges();
  });
  
  it('moves an ItemProxy in the table', () => {
    let reference: any = references[2];
    expect(component.proxy.item.predecessors.indexOf(reference)).toEqual(2);
    component.move({ moveDirection: MoveDirection.UP,
      candidates: [reference.id] });
    expect(component.proxy.item.predecessors.indexOf(reference)).toEqual(1);
    component.move({ moveDirection: MoveDirection.DOWN,
      candidates: [reference.id] });
    expect(component.proxy.item.predecessors.indexOf(reference)).toEqual(2);
  });
  
  it('removes an ItemProxy from the table', () => {
    let reference: any = component.proxy.item.predecessors[2];
    component.remove({ candidates: [reference.id] });
    expect(component.proxy.item.predecessors.indexOf(reference)).toEqual(-1);
  });
});