import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { of as ObservableOf } from 'rxjs';

import { MaterialModule } from '../../material.module'

import { DocumentViewComponent } from './document-view.component';
import { NavigationService } from '../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { DialogService } from '../../services/dialog/dialog.service';
import { MockDialogService } from '../../../mocks/services/MockDialogService';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { BehaviorSubject } from 'rxjs';
import { MockItem, MockDocument } from '../../../mocks/data/MockItem';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
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
        {provide: NavigationService, useClass: MockNavigationService},
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: DialogService, useClass: MockDialogService},
        DynamicTypesService
      ]
    }).compileComponents();

    documentViewFixture = TestBed.createComponent(DocumentViewComponent);
    documentViewComponent = documentViewFixture.componentInstance;
    documentViewComponent.proxyStream = ObservableOf(TreeConfiguration.
      getWorkingTree().getProxyFor('test-uuid1'));
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
    documentViewComponent.proxyStream = new BehaviorSubject(TreeConfiguration.
      getWorkingTree().getProxyFor('test-uuid1'));
    expect(documentViewComponent).toBeTruthy();
  })

  it('loads the whole document when incremental load is off', ()=>{
    let rootProxy = TreeConfiguration.getWorkingTree().getRootProxy();
    documentViewComponent.proxyStream = new BehaviorSubject(rootProxy);
    documentViewComponent.incrementalLoad = false;
    documentViewFixture.detectChanges();
    expect(documentViewComponent.itemsLoaded).toBe(rootProxy.descendantCount + 1);
  })

  it('loads only a subset of the document when incremental load is on', ()=>{
    let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getRootProxy();
    let item: any = MockItem();
    item.parentId = '';
    for (let j: number = 0; j < 33; j++) {
      item.id = item.id + j;
      new ItemProxy('Item', item);
    }
    documentViewComponent.proxyStream = new BehaviorSubject(proxy);
    documentViewComponent.incrementalLoad = true;
    documentViewFixture.detectChanges();
    expect(documentViewComponent.itemsLoaded).toBe(20);
  })

  it('stops loading at the character limit', ()=>{
    let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getRootProxy();
    // TODO: Need to determine why we are adding the word Description 8000 times to the second child item of the Root
    for (let j: number = 0; j < 8000; j++) {
      proxy.children[2].item.description += "Description";
    }
    documentViewComponent.proxyStream = new BehaviorSubject(proxy);
    documentViewComponent.incrementalLoad = true;
    documentViewFixture.detectChanges();
    expect(documentViewComponent.itemsLoaded).toBe(28);
  })

  afterEach(()=>{
    ItemProxy.getWorkingTree().reset();
  })
})
