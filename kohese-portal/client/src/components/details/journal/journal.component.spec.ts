import {
  TestBed,
  ComponentFixture,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../../pipes/pipes.module';

import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockItem } from '../../../../mocks/data/MockItem';
import { MockDataModel } from '../../../../mocks/data/MockDataModel';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

import { JournalComponent, JournalOrdering } from './journal.component';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { SessionService } from '../../../services/user/session.service';
import { MockSessionService } from '../../../../mocks/services/MockSessionService';

// TODO: This needs to be implemented
fdescribe('Component: Journal', () => {
  let journalComponent: JournalComponent;
  let journalFixture: ComponentFixture<JournalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JournalComponent],
      imports: [
        CommonModule,
        MaterialModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        PipesModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: SessionService, useClass: MockSessionService },
      ],
    }).compileComponents();

    journalFixture = TestBed.createComponent(JournalComponent);
    journalComponent = journalFixture.componentInstance;

    journalComponent.itemProxy = MockItemRepository.singleton.getProxyFor(
      'test-uuid6'
    );

    try {
      // Date must be past 500,000 to return valid 600456789000

      //Tuesday, January 10, 1989 5:33:09 PM
      let obs1 = new ItemProxy('Observation', {
        name: 'Observation1',
        id: 'obs1',
        observedBy: 'admin',
        observedOn: 600456789000,
        createdBy: 'dphillips',
        createdOn: 600456789000,
        context: [{ id: 'test-uuid6' }],
      });
      obs1.item.modifiedOn = 600486789000;

      //Tuesday, January 10, 1989 5:49:49 PM
      let obs2 = new ItemProxy('Observation', {
        name: 'Observation2',
        id: 'obs2',
        observedBy: 'guser',
        observedOn: 600457789000,
        createdBy: 'ephillips',
        createdOn: 600457789000,
        context: [{ id: 'test-uuid6' }],
      });
      obs2.item.modifiedOn = 600476789000;

      //Tuesday, January 10, 1989 5:34:59 PM
      let iss1 = new ItemProxy('Issue', {
        name: 'Issue1',
        id: 'iss1',
        observedBy: 'tuser',
        observedOn: 600456899000,
        createdBy: 'gphilliphs',
        createdOn: 600456899000,
        issueState: 'Observed',
        context: [{ id: 'test-uuid6' }],
      });

    } catch (err) {
      console.log('*** Error: ' + JSON.stringify(err));
      console.log(err.stack);
    }

    journalFixture.detectChanges();
  });

  it('instantiates the Journal component', () => {
    expect(JournalComponent).toBeTruthy();
  });

  // Want to test by order of sorting
  describe('sorting', () => {
    function retrieveOrderedObservationIds(sortOrder: JournalOrdering) {

      // Configure JournalComponent observation order
      journalComponent.selectedOrdering = sortOrder;

      // Retrieve mock observations with no Filter in getObervations parameter
      const noFilter = '';
      let observations = journalComponent.getObservations(noFilter);

      // Iterates array observations and retrieve the itemId for each entry in order
      let actualOrder = [];
      observations.forEach((proxy) => {
        actualOrder.push(proxy.item.id);
      });

      return actualOrder;
    }

    it('sorts by eldest first when observed', () => {
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.ELDEST_FIRST_WHEN_OBSERVED);
      let expectedOrder = ['obs1', 'iss1', 'obs2'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by eldest last when observed', () => {
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.ELDEST_LAST_WHEN_OBSERVED);
      let expectedOrder = ['obs2', 'iss1', 'obs1'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by first journal entry made', () => {
      //createdOn attribute
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.ELDEST_FIRST_JOURNAL_ENTRY_MADE);
      let expectedOrder = ['obs1', 'iss1', 'obs2'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by last journal entry made', () => {
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.ELDEST_LAST_JOURNAL_ENTRY_MADE);
      let expectedOrder = ['obs2', 'iss1', 'obs1'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by observer', () => {
      //ObservedBy
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.OBSERVER);
      let expectedOrder = ['obs1', 'obs2', 'iss1'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by journal entry maker', () => {
      //Refers to the "createdBy" attribute
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.JOURNAL_ENTRY_MAKER);
      let expectedOrder = ['obs1', 'obs2', 'iss1'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by issues first', () => {
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.ISSUES_FIRST);
      let expectedOrder = ['iss1', 'obs1', 'obs2'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by issues last', () => {
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.ISSUES_LAST);
      let expectedOrder = ['obs1', 'obs2', 'iss1'];
      expect(actualOrder).toEqual(expectedOrder);
    });
  });
});
