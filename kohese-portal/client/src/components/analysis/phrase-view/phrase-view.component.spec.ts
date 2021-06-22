/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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


import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module';
import { PhraseViewComponent } from './phrase-view.component';
import { BehaviorSubject } from 'rxjs';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { MockItem } from '../../../../mocks/data/MockItem';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { AnalysisService } from '../../../services/analysis/analysis.service';
import { MockAnalysisService } from '../../../../mocks/services/MockAnalysisService';
import { DataProcessingService } from '../../../services/data/data-processing.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { MockDataProcessingService } from '../../../../mocks/services/MockDataProcessingService';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { PipesModule } from '../../../pipes/pipes.module';
import { MockAnalysis } from '../../../../mocks/data/MockAnalysis';
import { AnalysisViews } from '../AnalysisViewComponent.class';

describe('Component: Phrase View', ()=>{
  let phraseComponent: PhraseViewComponent;
  let phraseFixture : ComponentFixture<PhraseViewComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [PhraseViewComponent],
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

    phraseFixture = TestBed.createComponent(PhraseViewComponent);
    phraseComponent = phraseFixture.componentInstance;

    let mockProxy = new ItemProxy('Item', MockItem());
    mockProxy.analysis = MockAnalysis();
    phraseComponent.proxyStream = new BehaviorSubject(mockProxy);
    phraseComponent.filterSubject = new BehaviorSubject({
      filter: '',
      source: AnalysisViews.TERM_VIEW,
      filterOptions : {
        exactMatch: false,
        ignoreCase: false
      }
    });


    phraseFixture.detectChanges();

  })

  afterEach(() => {
    phraseFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the phrase component', ()=>{
    expect(phraseComponent).toBeTruthy();
  })
})
