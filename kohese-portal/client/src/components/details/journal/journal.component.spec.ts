/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../../pipes/pipes.module';

// Kohese
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { JournalComponent, JournalOrdering } from './journal.component';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { SessionService } from '../../../services/user/session.service';

// Mocks
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockSessionService } from '../../../../mocks/services/MockSessionService';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';

// TODO: This needs to be implemented
describe('Component: Journal', () => {
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

    journalComponent.itemProxy = MockItemRepository.singleton.getProxyFor('test-uuid6');

    try {
      // Date must be past 500,000 to return valid

      /**obs1 --> observedOn = Tuesday, January 10, 1989 5:33:09 PM
       * obs2 --> observedOn = Tuesday, January 10, 1989 5:49:49 PM
       * iss1 --> observedOn = Tuesday, January 10, 1989 5:34:59 PM
       * iss2 --> observedOn = Thursday, January 12, 1989 5:41:39 AM
       * ----------------- First to Last -----------------
       * 'obs1', 'iss1', 'obs2', 'iss2'
       */

      /**obs1 --> createdOn = Sunday, January 22, 1989 7:19:49 AM
       * obs2 --> createdOn = Thursday, February 2, 1989 9:23:09 PM
       * iss1 --> createdOn = Wednesday, January 11, 1989 9:21:39 PM
       * iss2 --> createdOn = Thursday, April 6, 1989 5:44:59 PM
       * ----------------- First to Last -----------------
       * 'iss1', 'obs1', 'obs2', 'iss2'
       */

      /**obs1 --> modifiedOn = Wednesday, February 15, 1989 10:59:49 PM
       * obs2 --> modifiedOn = Saturday, February 4, 1989 6:26:29 AM
       * iss1 --> modifiedOn = Friday, January 13, 1989 1:08:19 AM
       * iss2 --> modifiedOn = Thursday, March 30, 1989 6:48:19 PM
       * ----------------- First to Last -----------------
       * 'iss1', 'obs2', 'obs1', 'iss2'
       */

      /**obs1 --> observedBy = admin1
       * obs2 --> observedBy = admin2
       * iss1 --> observedBy = admin4
       * iss2 --> observedBy = admin3
       * ----------------- First to Last -----------------
       * 'obs1', 'obs2', 'iss2', 'iss1'
       */

      /**obs1 --> createdBy = auser
       * obs2 --> createdBy = duser
       * iss1 --> createdBy = cuser
       * iss2 --> createdBy = buser
       * ----------------- First to Last -----------------
       * 'obs1', 'iss2', 'iss1', 'obs2'
       */

      let obs1 = new ItemProxy('Observation', {
        name: 'Observation1',
        id: 'obs1',
        observedBy: 'admin1',
        // Tuesday, January 10, 1989 5:33:09 PM
        observedOn: 600456789000,
        createdBy: 'auser',
        // Sunday, January 22, 1989 7:19:49 AM
        createdOn: 601456789000,
        context: [{ id: 'test-uuid6' }],
      });
      // Wednesday, February 15, 1989 10:59:49 PM
      obs1.item.modifiedOn = 603586789000;


      let obs2 = new ItemProxy('Observation', {
        name: 'Observation2',
        id: 'obs2',
        observedBy: 'admin2',
        // Tuesday, January 10, 1989 5:49:49 PM
        observedOn: 600457789000,
        createdBy: 'duser',
        // Thursday, February 2, 1989 9:23:09 PM
        createdOn: 602457789000,
        context: [{ id: 'test-uuid6' }],
      });
      // Saturday, February 4, 1989 6:26:29 AM
      obs2.item.modifiedOn = 602576789000;


      let iss1 = new ItemProxy('Issue', {
        name: 'Issue1',
        id: 'iss1',
        observedBy: 'admin4',
        // Tuesday, January 10, 1989 5:34:59 PM
        observedOn: 600456899000,
        createdBy: 'cuser',
        // Wednesday, January 11, 1989 9:21:39 PM
        createdOn: 600556899000,
        issueState: 'Observed',
        context: [{ id: 'test-uuid6' }],
      });
      // Friday, January 13, 1989 1:08:19 AM
      iss1.item.modifiedOn = 600656899000;


      let iss2 = new ItemProxy('Issue', {
        name: 'Issue2',
        id: 'iss2',
        observedBy: 'admin3',
        // Thursday, January 12, 1989 5:41:39 AM
        observedOn: 600586899000,
        createdBy: 'buser',
        // Thursday, April 6, 1989 5:44:59 PM
        createdOn: 607887899000,
        issueState: 'Observed',
        context: [{ id: 'test-uuid6' }],
      });
      // Thursday, March 30, 1989 6:48:19 PM
      iss2.item.modifiedOn = 607286899000;


    } catch (err) {
      console.log('*** Error: ' + JSON.stringify(err));
      console.log(err.stack);
    }

    journalFixture.detectChanges();
  });

  afterEach(() => {
    journalFixture.destroy();
    TestBed.resetTestingModule();
  })

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
      // Refers to observedOn attribute
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.ELDEST_FIRST_WHEN_OBSERVED);
      let expectedOrder = ['obs1', 'iss1', 'obs2', 'iss2'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by eldest last when observed', () => {
      // Refers to the observedOn attribute
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.ELDEST_LAST_WHEN_OBSERVED);
      let expectedOrder = ['iss2', 'obs2', 'iss1', 'obs1'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by first journal entry made', () => {
      // Refers to the createdOn attribute
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.ELDEST_FIRST_JOURNAL_ENTRY_MADE);
      let expectedOrder = ['iss1', 'obs1', 'obs2', 'iss2'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by last journal entry made', () => {
      // Refers to the createdOn attribute
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.ELDEST_LAST_JOURNAL_ENTRY_MADE);
      let expectedOrder = ['iss2', 'obs2', 'obs1', 'iss1'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by observer', () => {
      // Refers to the observedBy attribute
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.OBSERVER);
      let expectedOrder = ['obs1', 'obs2', 'iss2', 'iss1'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by journal entry maker', () => {
      // Refers to the createdBy attribute
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.JOURNAL_ENTRY_MAKER);
      let expectedOrder = ['obs1', 'iss2', 'iss1', 'obs2'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by issues first', () => {
      // Issues are listed first in Journal tab, alphanumerically
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.ISSUES_FIRST);
      let expectedOrder = ['iss1', 'iss2', 'obs1', 'obs2'];
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('sorts by issues last', () => {
      // Issues are listed last in Journal tab, alphanumerically
      let actualOrder = retrieveOrderedObservationIds(JournalOrdering.ISSUES_LAST);
      let expectedOrder = ['obs1', 'obs2', 'iss1','iss2'];
      expect(actualOrder).toEqual(expectedOrder);
    });

  });
});
