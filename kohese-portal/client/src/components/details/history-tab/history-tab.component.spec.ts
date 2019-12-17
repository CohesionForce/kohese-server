import { TestBed, ComponentFixture} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { HistoryTabComponent} from './history-tab.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { MockItem } from '../../../../mocks/data/MockItem';

import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
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
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: NavigationService, useClass: MockNavigationService},
        { provide: DynamicTypesService, useClass: MockDynamicTypesService }
      ]
    }).compileComponents();

    historyFixture = TestBed.createComponent(HistoryTabComponent);
    historyComponent = historyFixture.componentInstance;

    historyComponent.proxyStream = new BehaviorSubject(new ItemProxy('Item', MockItem()));

    historyFixture.detectChanges();

  })

  it('instantiates the history component', ()=>{
    expect(historyComponent).toBeTruthy();
  })
})
