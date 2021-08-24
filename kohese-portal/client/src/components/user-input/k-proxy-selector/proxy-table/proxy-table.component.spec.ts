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


// Angular
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { of as ObservableOf } from 'rxjs';
import { MaterialModule } from '../../../../material.module';

// Kohese
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { ProxyTableComponent } from './proxy-table.component';
import { ItemProxy } from '../../../../../../common/src/item-proxy';

// Mocks
import { MockDialogService } from '../../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';

describe('Component: proxy-table', () => {
  let component: ProxyTableComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProxyTableComponent],
      imports: [MaterialModule],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    let fixture: ComponentFixture<ProxyTableComponent> = TestBed.
      createComponent(ProxyTableComponent);
    component = fixture.componentInstance;
    component.columns = ['name'];
    component.dataStream = ObservableOf([{ id: 'test-uuid2' },
      { id: 'test-uuid3' }, { id: 'test-uuid1' }]);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('can change the check state associated with an ItemProxy', () => {
    let itemProxy: ItemProxy = component.dataSource[2];
    expect(component.selection.indexOf(itemProxy)).toEqual(-1);
    component.checkStateChanged(itemProxy);
    expect(component.selection.indexOf(itemProxy)).not.toEqual(-1);
    component.checkStateChanged(itemProxy);
    expect(component.selection.indexOf(itemProxy)).toEqual(-1);
  });

  it('can calculate the minimum width of the checkbox column', () => {
    expect(component.getCheckboxColumnWidth()['min-width']).toEqual(
      ProxyTableComponent.CHECKBOX_COLUMN_WIDTH + 'px');
  });

  it('can calculate the minimum width of non-checkbox columns', () => {
    expect(component.getColumnWidthStyle(3)['min-width']).toEqual('100px');
    expect(component.getColumnWidthStyle(103 + ProxyTableComponent.
      CHECKBOX_COLUMN_WIDTH)['min-width']).toEqual('103px');
  });

  it('can calculate the minimum width of rows', () => {
    expect(component.getRowWidthStyle(3)['min-width']).toEqual('140px');
  });
});
