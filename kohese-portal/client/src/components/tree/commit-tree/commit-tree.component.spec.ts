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
import { of, Observable } from 'rxjs';
import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { MaterialModule } from '../../../material.module';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { LensService } from '../../../services/lens-service/lens.service';
import { MockLensService } from '../../../../mocks/services/MockLensService';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { CommitTreeComponent } from './commit-tree.component';

describe('Component: commit-tree', () => {
  let component: CommitTreeComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommitTreeComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({ id: '' })} },
        { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: LensService, useClass: MockLensService },
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: DynamicTypesService, useClass: MockDialogService } // !!! Change useClass
      ],
      imports: [
        VirtualScrollModule,
        MaterialModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    let fixture: ComponentFixture<CommitTreeComponent> = TestBed.createComponent(CommitTreeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('instantiates the commit-tree component', () => {
    expect(CommitTreeComponent).toBeTruthy();
  })
});
