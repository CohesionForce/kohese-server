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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MaterialModule } from '../../../../../../material.module'; // deprecated

// Kohese
import { ItemRepository } from '../../../../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../../../../services/navigation/navigation.service';
import { DialogService } from '../../../../../../services/dialog/dialog.service';
import { SessionService } from '../../../../../../services/user/session.service';
import { StateSummaryDialogComponent } from './state-summary-dialog.component';

// Mocks
import { MockNavigationService } from '../../../../../../../mocks/services/MockNavigationService';
import { MockDialogService } from '../../../../../../../mocks/services/MockDialogService';
import { MockSessionService } from '../../../../../../../mocks/services/MockSessionService';
import { MockItemRepository } from '../../../../../../../mocks/services/MockItemRepository';

describe('StateSummaryDialogComponent', () => {
  let component: StateSummaryDialogComponent;
  let fixture: ComponentFixture<StateSummaryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StateSummaryDialogComponent ],
      imports: [
        MaterialModule
      ],
      providers: [ {
          provide: MAT_DIALOG_DATA,
          useValue: {
            proxies: [],
            kindName: 'Item',
            stateName: 'Approved'
          }
        },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: DialogService, useClass: MockDialogService },
        { provide: SessionService, useClass: MockSessionService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();

    fixture = TestBed.createComponent(StateSummaryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  })


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
