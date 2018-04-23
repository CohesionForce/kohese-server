import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../../pipes/pipes.module';

import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockItem } from '../../../../mocks/data/MockItem';
import * as ItemProxy from '../../../../../common/src/item-proxy';

import { JournalComponent } from './journal.component';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../services/user/session.service';
import { MockSessionService } from '../../../../mocks/services/MockSessionService';
import { JournalEntryComponent } from './journal-entry/journal-entry.component';

describe('Component: Journal', ()=>{
  let journalComponent: JournalComponent;
  let journalFixture : ComponentFixture<JournalComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [JournalComponent,
                    JournalEntryComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule,
         PipesModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide : DialogService, useClass: MockDialogService},
        {provide : ItemRepository, useClass: MockItemRepository},
        {provide : SessionService, useClass: MockSessionService}
      ]
    }).compileComponents();

    journalFixture = TestBed.createComponent(JournalComponent);
    journalComponent = journalFixture.componentInstance;
    
    journalComponent.itemProxy = new ItemProxy('Item', MockItem());

    journalFixture.detectChanges();
    
  })

  it('instantiates the Journal component', ()=>{
    expect(JournalComponent).toBeTruthy(); 
  });
  
  it('builds an Observation', fakeAsync(() => {
    journalComponent.observationName = 'Kurios Iesous';
    journalComponent.openObservingActivitySelectionDialog();
    tick();
    spyOn(TestBed.get(ItemRepository), 'buildItem').and.returnValue(Promise.
      resolve());
    journalComponent.addJournalEntry();
    let observation: any = TestBed.get(ItemRepository).buildItem.calls.
      argsFor(0)[1];
    expect(observation.name).toEqual('Kurios Iesous');
    expect(observation.parentId).toEqual(ItemProxy.getWorkingTree().
      getRootProxy().item.id);
  }));

  describe('sorting', ()=>{
    it('sorts by eldest first when observed',()=>{
      pending();
    })
    it('sorts by eldest last when observed', ()=>{
      pending();
    })
    it('sorts by first journal entry made',()=>{
      pending();
    })
    it('sorts by last journal entry made',()=>{
      pending();
    })
    it('sorts by observer',()=>{
      pending();
    })
    it('sorts by journal entry maker', ()=>{
      pending();
    })
    it('sorts by issues first',()=>{
      pending();
    })
    it('sorts by issues last', ()=>{
      pending();
    })
  });
})