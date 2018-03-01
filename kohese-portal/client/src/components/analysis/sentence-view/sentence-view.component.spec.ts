import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module';
import { SentenceViewComponent } from './sentence-view.component';
import { BehaviorSubject } from 'rxjs';
import * as ItemProxy from '../../../../../common/models/item-proxy';
import { MockItem } from '../../../../mocks/data/MockItem';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { AnalysisService } from '../../../services/analysis/analysis.service';
import { MockAnalysisService } from '../../../../mocks/services/MockAnalysisService';
import { DataProcessingService } from '../../../services/data/data-processing.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { MockDataProcessingService } from '../../../../mocks/services/MockDataProcessingService';
import { PipesModule } from '../../../pipes/pipes.module';
import { MockAnalysis } from '../../../../mocks/data/MockAnalysis';

describe('Component: Sentence View', ()=>{
  let sentenceComponent: SentenceViewComponent;
  let sentenceFixture : ComponentFixture<SentenceViewComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [SentenceViewComponent],
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
        {provide: DataProcessingService, useClass: MockDataProcessingService}
      ]
    }).compileComponents();

    sentenceFixture = TestBed.createComponent(SentenceViewComponent);
    sentenceComponent = sentenceFixture.componentInstance;

    sentenceComponent.itemProxy = new ItemProxy('Item', MockItem);
    sentenceComponent.itemProxy.analysis = MockAnalysis
    sentenceComponent.filterSubject = new BehaviorSubject('');

    sentenceFixture.detectChanges();
    
  })

  it('instantiates the sentence component', ()=>{
    expect(sentenceComponent).toBeTruthy(); 
  })
})