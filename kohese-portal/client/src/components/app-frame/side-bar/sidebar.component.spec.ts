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
import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../material.module';

// Kohese
import { SideBarComponent } from './sidebar.component';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { CurrentUserService } from '../../../services/user/current-user.service';
import { LensService } from '../../../services/lens-service/lens.service';

// Mocks
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockCurrentUserService } from '../../../../mocks/services/MockCurrentUserService';
import { MockLensService } from '../../../../mocks/services/MockLensService';

describe('Component: SideBar', ()=>{
  let sideBarComponent: SideBarComponent;
  let sideBarFixture : ComponentFixture<SideBarComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [SideBarComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: DialogService, useClass: MockDialogService},
        {provide: CurrentUserService, useClass: MockCurrentUserService},
        {provide: LensService, useClass: MockLensService}
      ]
    }).compileComponents();

    sideBarFixture = TestBed.createComponent(SideBarComponent);
    sideBarComponent = sideBarFixture.componentInstance;

    sideBarFixture.detectChanges();

  })

  afterEach(() => {
    sideBarFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the SideBar component', ()=>{
    expect(sideBarComponent).toBeTruthy();
  })
})
