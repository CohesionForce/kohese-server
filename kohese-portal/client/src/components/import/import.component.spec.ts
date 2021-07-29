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
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module'; // deprecated
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Other External Dependencies
import { MarkdownModule } from 'ngx-markdown';
import { ToastrModule } from 'ngx-toastr';

// Kohese
import { TreeViewModule } from '../tree/tree.module';
import { ImportComponent } from './import.component';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

// Mocks
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';

describe('Component: ', ()=>{
  let importComponent: ImportComponent;
  let importFixture : ComponentFixture<ImportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportComponent],
      imports: [
        BrowserAnimationsModule,
        MarkdownModule,
        ToastrModule.forRoot(),
        MaterialModule,
        TreeViewModule
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: MAT_DIALOG_DATA, useValue: {}},
      ]
    }).compileComponents();

    importFixture = TestBed.createComponent(ImportComponent);
    importComponent = importFixture.componentInstance;

    importFixture.detectChanges();

  })

  afterEach(() => {
    importFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the Import component', ()=>{
    //pending();
    expect(importComponent).toBeTruthy();
  })
})
