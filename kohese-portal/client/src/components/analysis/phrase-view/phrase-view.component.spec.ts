import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module';
import { PhraseViewComponent } from './phrase-view.component';
import { BehaviorSubject } from 'rxjs';
import * as ItemProxy from '../../../../../common/src/item-proxy';
import { MockItem } from '../../../../mocks/data/MockItem';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { AnalysisService } from '../../../services/analysis/analysis.service';
import { MockAnalysisService } from '../../../../mocks/services/MockAnalysisService';
import { DataProcessingService } from '../../../services/data/data-processing.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { MockDataProcessingService } from '../../../../mocks/services/MockDataProcessingService';
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
        {provide: DataProcessingService, useClass: MockDataProcessingService}
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

  it('instantiates the phrase component', ()=>{
    expect(phraseComponent).toBeTruthy(); 
  })
})