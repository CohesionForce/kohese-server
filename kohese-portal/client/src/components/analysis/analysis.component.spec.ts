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

import { ActivatedRoute } from '@angular/router';
import { from } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Kohese
import { AnalysisComponent } from './analysis.component';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { AnalysisService } from '../../services/analysis/analysis.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { MaterialModule } from '../../material.module'; // deprecated

// Mocks
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockAnalysisService } from '../../../mocks/services/MockAnalysisService';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { MockDialogService } from '../../../mocks/services/MockDialogService';


describe('Component: Analysis', ()=>{
  let analysisComponent: AnalysisComponent;
  let analysisFixture : ComponentFixture<AnalysisComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [AnalysisComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide : NavigationService, useClass: MockNavigationService},
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: AnalysisService, useClass: MockAnalysisService},
        { provide: DialogService, useClass: MockDialogService },
        {provide: ActivatedRoute, useValue:{
          params: from([{id: 1}]),
        }}
      ]
    }).compileComponents();

    analysisFixture = TestBed.createComponent(AnalysisComponent);
    analysisComponent = analysisFixture.componentInstance;

    analysisFixture.detectChanges();

  })

  afterEach(() => {
    analysisFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the analysis component', ()=>{
    expect(analysisComponent).toBeTruthy();
  });

  it('does not produce an error when the URL contains an invalid id', () => {
    expect(analysisComponent.itemProxy).not.toBeDefined();
  });
})
