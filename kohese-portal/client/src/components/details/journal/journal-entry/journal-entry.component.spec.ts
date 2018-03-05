import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../../material.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as ItemProxy from '../../../../../../common/src/item-proxy';
import { MockItem } from '../../../../../mocks/data/MockItem';

import { SessionService } from '../../../../services/user/session.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../../services/navigation/navigation.service';

import { MockSessionService } from '../../../../../mocks/services/MockSessionService';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';
import { MockNavigationService } from '../../../../../mocks/services/MockNavigationService';

import { JournalEntryComponent } from './journal-entry.component';

describe('Component: JournalEntry', ()=>{
  let journalEntryComponent: JournalEntryComponent;
  let journalEntryFixture : ComponentFixture<JournalEntryComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [JournalEntryComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: SessionService, useClass: MockSessionService},
        {provide: NavigationService, useClass: MockNavigationService}


      ]
    }).compileComponents();

    journalEntryFixture = TestBed.createComponent(JournalEntryComponent);
    journalEntryComponent = journalEntryFixture.componentInstance;

    journalEntryComponent.itemProxy = new ItemProxy('Item', MockItem);

    journalEntryFixture.detectChanges();
    
  })

  it('instantiates the Journal Entry component', ()=>{
    expect(journalEntryComponent).toBeTruthy(); 
  })

  describe('entry actions', ()=>{
    it('can add an entry against another entry',()=>{
      pending();
    })
    it('allows a user to edit their comments', ()=>{
      pending();
    })
    it('allows navigation to the details of an observation or issue', ()=>{
      pending();
    })
  })
})