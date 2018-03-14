import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../material.module'

import { DocumentViewComponent } from './document-view.component';
import { NavigationService } from '../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { BehaviorSubject } from 'rxjs';
import { MockItem } from '../../../mocks/data/MockItem';
import * as ItemProxy from '../../../../common/src/item-proxy';
import { AnalysisViews } from '../analysis/AnalysisViewComponent.class';


describe('Component: Document View', ()=>{
  let documentViewComponent: DocumentViewComponent;
  let documentViewFixture : ComponentFixture<DocumentViewComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [DocumentViewComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: NavigationService, useClass: MockNavigationService}
      ]
    }).compileComponents();

    documentViewFixture = TestBed.createComponent(DocumentViewComponent);
    documentViewComponent = documentViewFixture.componentInstance;

    documentViewComponent.filterSubject = new BehaviorSubject({
      source : AnalysisViews.TERM_VIEW,
      filter : '',
      filterOptions: {
        exactMatch: false,
        ignoreCase: true
      }
    });
    documentViewComponent.proxyStream = new BehaviorSubject(new ItemProxy('Item', MockItem()));
    documentViewFixture.detectChanges();
    
  })

  it('instantiates the Document View component', ()=>{
    expect(documentViewComponent).toBeTruthy(); 
  })
})