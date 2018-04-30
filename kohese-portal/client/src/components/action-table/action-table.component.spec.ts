import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../material.module'

import { NavigationService } from '../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { ActionTableComponent } from './action-table.component';
import { PipesModule } from '../../pipes/pipes.module';
import { BehaviorSubject } from 'rxjs';
import { ItemProxy,
  TreeConfiguration } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';

import { MockItemRepository} from '../../../mocks/services/MockItemRepository';
import { MockDataModel } from '../../../mocks/data/MockDataModel';
import { MockKoheseType } from '../../../mocks/data/MockKoheseType';
import { MockItem } from '../../../mocks/data/MockItem';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

describe('Component: Action Table', ()=>{
  let actionTableComponent: ActionTableComponent;
  let actionTableFixture : ComponentFixture<ActionTableComponent>;
  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ActionTableComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         CommonModule,
         PipesModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: NavigationService, useClass : MockNavigationService},
        {provide: ChangeDetectorRef, useValue : {markForCheck : ()=>{}}},
        {provide: ItemRepository, useClass: MockItemRepository}
      ]
    }).compileComponents();

    actionTableFixture = TestBed.createComponent(ActionTableComponent);
    actionTableComponent = actionTableFixture.componentInstance;
    let itemRepository: any = TestBed.get(ItemRepository);
    let itemProxy = itemRepository.getRootProxy();
    itemProxy.getSubtreeAsList = ()=>{
      new KoheseModel(MockDataModel());
      KoheseModel.modelDefinitionLoadingComplete();
      
      return [
        { depth: 0, proxy: new ItemProxy('Item', MockItem())},
        { depth: 0, proxy: new ItemProxy('Item', MockItem())},
        { depth: 0, proxy: new ItemProxy('Item', MockItem())}
      ]
    };
    itemRepository.getProxyFor('Item').type = MockKoheseType();
    actionTableComponent.proxyStream = new BehaviorSubject<any>(itemProxy);
    actionTableComponent.editableStream = new BehaviorSubject<boolean>(true);

    actionTableFixture.detectChanges();

  })

  it('instantiates the actionTable component', ()=>{
    expect(actionTableComponent).toBeTruthy();
  })

  afterEach(()=>{
    ItemProxy.getWorkingTree().reset();
  })
})
