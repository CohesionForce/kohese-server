import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module';
import { TermViewComponent } from './term-view.component';
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
        {provide: DataProcessingService, useClass: MockDataProcessingService}
      ]
    }).compileComponents();

    termFixture = TestBed.createComponent(TermViewComponent);
    termComponent = termFixture.componentInstance;

    termComponent.itemProxy = new ItemProxy('Item', MockItem);
    termComponent.itemProxy.analysis = MockAnalysis
    termComponent.filterSubject = new BehaviorSubject('');

    termFixture.detectChanges();
    
  })

  it('instantiates the term component', ()=>{
    expect(termComponent).toBeTruthy(); 
  })
})