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
import * as ItemProxy from '../../../../common/src/item-proxy';

import { MockItemRepository} from '../../../mocks/services/MockItemRepository';
import { MockItem } from '../../../mocks/data/MockItem';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

describe('Component: Action Table', ()=>{
  let actionTableComponent: ActionTableComponent;
  let actionTableFixture : ComponentFixture<ActionTableComponent>;
  let mockItemRepository = new MockItemRepository();
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
    let itemProxy = mockItemRepository.getRootProxy(); 
    itemProxy.getSubtreeAsList = ()=>{ 
      return [
        { depth: 0, proxy: new ItemProxy('Item', MockItem())},
        { depth: 0, proxy: new ItemProxy('Item', MockItem())},
        { depth: 0, proxy: new ItemProxy('Item', MockItem())}
      ]
    }
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
