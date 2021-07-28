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
import { BehaviorSubject } from 'rxjs';

// Kohese
import { AnalysisViews } from '../AnalysisViewComponent.class';
import { TermViewComponent } from './term-view.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { AnalysisService } from '../../../services/analysis/analysis.service';
import { DataProcessingService } from '../../../services/data/data-processing.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { PipesModule } from '../../../pipes/pipes.module';
import { MaterialModule } from '../../../material.module'; // deprecated

// Mocks
import { MockItem } from '../../../../mocks/data/MockItem';
import { MockAnalysis } from '../../../../mocks/data/MockAnalysis';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockAnalysisService } from '../../../../mocks/services/MockAnalysisService';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { MockDataProcessingService } from '../../../../mocks/services/MockDataProcessingService';

describe('Component: Term View', ()=>{
  let termComponent: TermViewComponent;
  let termFixture : ComponentFixture<TermViewComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [TermViewComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule,
         PipesModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: NavigationService, useClass: MockNavigationService},
        {provide: AnalysisService, useClass: MockAnalysisService},
        {provide: DataProcessingService, useClass: MockDataProcessingService},
        { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository }
      ]
    }).compileComponents();

    termFixture = TestBed.createComponent(TermViewComponent);
    termComponent = termFixture.componentInstance;

    let mockItem = new ItemProxy('Item', MockItem());
    mockItem.analysis = MockAnalysis();
    termComponent.proxyStream = new BehaviorSubject(mockItem);
    termComponent.filterSubject = new BehaviorSubject({
      filter: '',
      source: AnalysisViews.TERM_VIEW,
      filterOptions : {
        exactMatch: false,
        ignoreCase: false
      }
    });

    termFixture.detectChanges();

  })

  afterEach(() => {
    termFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the term component', ()=>{
    expect(termComponent).toBeTruthy();
  })
})
