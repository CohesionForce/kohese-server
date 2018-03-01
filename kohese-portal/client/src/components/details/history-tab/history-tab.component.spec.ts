import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { HistoryTabComponent} from './history-tab.component';
import * as ItemProxy from '../../../../../common/models/item-proxy';
import { MockItem } from '../../../../mocks/data/MockItem';

import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { BehaviorSubject } from 'rxjs';

describe('Component: History Tab', ()=>{
  let historyComponent: HistoryTabComponent;
  let historyFixture : ComponentFixture<HistoryTabComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [HistoryTabComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: NavigationService, useClass: MockNavigationService},
        {provide: ItemRepository, useClass: MockItemRepository}
      ]
    }).compileComponents();

    historyFixture = TestBed.createComponent(HistoryTabComponent);
    historyComponent = historyFixture.componentInstance;

    historyComponent.proxyStream = new BehaviorSubject(new ItemProxy('Item', MockItem));

    historyFixture.detectChanges();
    
  })

  it('instantiates the history component', ()=>{
    expect(historyComponent).toBeTruthy(); 
  })
})