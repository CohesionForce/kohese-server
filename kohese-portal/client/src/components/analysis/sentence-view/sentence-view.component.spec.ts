import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module';
import { SentenceViewComponent } from './sentence-view.component';
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
        {provide: DataProcessingService, useClass: MockDataProcessingService},
        { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository }
      ]
    }).compileComponents();

    sentenceFixture = TestBed.createComponent(SentenceViewComponent);
    sentenceComponent = sentenceFixture.componentInstance;

    let mockProxy = new ItemProxy('Item', MockItem());
    mockProxy.analysis = MockAnalysis();
    sentenceComponent.proxyStream = new BehaviorSubject(mockProxy);
    sentenceComponent.filterSubject = new BehaviorSubject({
      filter: '',
      source: AnalysisViews.TERM_VIEW,
      filterOptions : {
        exactMatch: false,
        ignoreCase: false
      }
    });

    sentenceFixture.detectChanges();

  })

  it('instantiates the sentence component', ()=>{
    expect(sentenceComponent).toBeTruthy();
  })
})
