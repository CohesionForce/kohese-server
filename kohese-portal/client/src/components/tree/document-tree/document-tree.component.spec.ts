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


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of as ObservableOf } from 'rxjs';

import { MaterialModule } from '../../../material.module';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { DocumentTreeComponent } from './document-tree.component';
import { Filter } from '../../filter/filter.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';

describe('DocumentTreeComponent', () => {
  let component: DocumentTreeComponent;
  let fixture: ComponentFixture<DocumentTreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTreeComponent ],
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        MaterialModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<any>({
              id: 'test-uuid5'
            })
          }
        },
        { provide: DialogService, useClass: MockDialogService },
        DynamicTypesService,
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: ItemRepository, useClass: MockItemRepository }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentTreeComponent);
    component = fixture.componentInstance;
    component.selectedProxyStream = ObservableOf(TreeConfiguration.
      getWorkingTree().getProxyFor('test-uuid5'));

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters after a search string is entered', (done: Function) => {
    expect(component.filterSubject.getValue()).not.toBeDefined();
    component.searchStringChanged('Search String');
    setTimeout(() => {
      let filter: Filter = component.filterSubject.getValue();
      expect(filter.rootElement.criteria[0]).toEqual(component.
        searchCriterion);
      done();
    }, 1000);
  });
});
