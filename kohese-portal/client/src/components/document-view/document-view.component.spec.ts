import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../material.module'

import { DocumentViewComponent } from './document-view.component';
import { NavigationService } from '../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { BehaviorSubject } from 'rxjs';
import { MockItem, MockDocument } from '../../../mocks/data/MockItem';
import * as ItemProxy from '../../../../common/src/item-proxy';
import { AnalysisViews } from '../analysis/AnalysisViewComponent.class';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { RouterTestingModule } from '@angular/router/testing';


describe('Component: Document View', ()=>{
  let documentViewComponent: DocumentViewComponent;
  let documentViewFixture : ComponentFixture<DocumentViewComponent>;
  ItemProxy.getWorkingTree().reset();

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [DocumentViewComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         InfiniteScrollModule,
         RouterTestingModule
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

  })

  it('instantiates the Document View component', ()=>{
    let documentProxy = new ItemProxy('Item', MockDocument());
    documentViewComponent.proxyStream = new BehaviorSubject(documentProxy);
    expect(documentViewComponent).toBeTruthy();
  })

  it('loads the whole document when incremental load is off', ()=>{
    let documentProxy = new ItemProxy('Item', MockDocument());

    let mockChild = MockItem();
    mockChild.parentId = documentProxy.item.id;
    delete mockChild.id;

    for (let i = 0; i < 5; i++) {
      let childProxy = new ItemProxy('Item', mockChild);
    }

    documentViewComponent.proxyStream = new BehaviorSubject(documentProxy);
    documentViewComponent.incrementalLoad = false;
    documentViewFixture.detectChanges();
    expect(documentViewComponent.itemsLoaded).toBe(6)
  })

  it('loads only a subset of the document when incremental load is on', ()=>{
    let documentProxy = new ItemProxy('Item', MockItem());

    let mockChild = MockItem();
    mockChild.parentId = documentProxy.item.id;
    delete mockChild.id;
    for (let i = 0; i < 40; i++) {
      let childProxy = new ItemProxy('Item', mockChild);
    }

    documentViewComponent.proxyStream = new BehaviorSubject(documentProxy);
    documentViewComponent.incrementalLoad = true;
    documentViewFixture.detectChanges();
    expect(documentViewComponent.itemsLoaded).toBe(12);
  })

  it('stops loading at the character limit', ()=>{
    let documentProxy = new ItemProxy('Item', MockDocument());

    let mockChild = MockDocument();
    mockChild.parentId = documentProxy.item.id;
    delete mockChild.id;

    for (let i = 0; i < 5; i++) {
      let childProxy = new ItemProxy('Item', mockChild);
    }

    documentViewComponent.proxyStream = new BehaviorSubject(documentProxy);
    documentViewComponent.incrementalLoad = true;
    documentViewFixture.detectChanges();
    expect(documentViewComponent.itemsLoaded).toBe(3);
  })

  afterEach(()=>{
    ItemProxy.getWorkingTree().reset();
  })
})
