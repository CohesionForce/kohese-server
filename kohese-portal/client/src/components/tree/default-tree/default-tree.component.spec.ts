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
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

// NPM
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { BehaviorSubject } from 'rxjs';

// Kohese
import { MaterialModule } from '../../../material.module';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { DefaultTreeComponent } from './default-tree.component';
import { TreeRow } from '../tree-row/tree-row.class';
import { ActionGroup } from '../tree-row/tree-row.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { Filter } from '../../filter/filter.class';
import { MockItem } from '../../../../mocks/data/MockItem';

describe('Component: default-tree', () => {
  let component: DefaultTreeComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DefaultTreeComponent],
      imports: [
        BrowserAnimationsModule,
        VirtualScrollModule,
        MaterialModule
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: new BehaviorSubject<any>({ id: ''}) }
        },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService },
        { provide: NavigationService, useClass: MockNavigationService },
        DynamicTypesService
      ]
    }).compileComponents();

    let fixture: ComponentFixture<DefaultTreeComponent> = TestBed.
      createComponent(DefaultTreeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('builds a TreeRow for a new Item', fakeAsync(() => {
    let item: any = MockItem();
    item.id = 'test-new-row';
    item.parentId = 'test-uuid3';
    for (let j: number = 0; j < component.visibleRows.length; j++) {
      if (item.parentId === (component.visibleRows[j].object as ItemProxy).
        item.id) {
        component.visibleRows[j].expanded = true;
        break;
      }
    }
    let proxy = new ItemProxy('Item', item);

    tick();
    let newRowIndex: number;
    for (let j: number = 0; j < component.visibleRows.length; j++) {
      if (item.id === (component.visibleRows[j].object as ItemProxy).item.id) {
        newRowIndex = j;
        break;
      }
    }

    expect(newRowIndex).toEqual(5);
  }));

  it('removes the TreeRow for a deleted Item', fakeAsync(() => {
    let numberOfVisibleRows: number = component.visibleRows.length;
    let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      'test-uuid6');
    proxy.deleteItem(false);
    tick();

    expect(component.visibleRows.length).toEqual(numberOfVisibleRows - 1);
  }));

  it('correctly responds to the tree root changing', fakeAsync(() => {
    let initialTreeRoot: any = component.rootSubject.getValue();
    let initialVisibleRows: Array<TreeRow> = component.visibleRows;
    component.rootSubject.next(TreeConfiguration.getWorkingTree().
      getRootProxy().children[0]);
    tick();
    expect(initialTreeRoot).not.toBe(component.rootSubject.getValue());
    expect(component.visibleRows.indexOf(initialVisibleRows[0])).toEqual(-1);
  }));

  it('synchronizes with selection', fakeAsync(() => {
    let index: number = -1;
    for (let j: number = 0; j < component.visibleRows.length; j++) {
      if ('Item' === (component.visibleRows[j].object as ItemProxy).item.id) {
        index = j;
        break;
      }
    }
    expect(index).toEqual(-1);

    TestBed.get(ActivatedRoute).params.next({ id: 'Item' });
    tick();

    for (let j: number = 0; j < component.visibleRows.length; j++) {
      if ('Item' === (component.visibleRows[j].object as ItemProxy).item.id) {
        index = j;
        break;
      }
    }
    expect(index).not.toEqual(-1);
  }));

  it('does not produce an error when the value of selectedIdSubject is ' +
    'invalid', fakeAsync(() => {
    let id: string = '-1';
    expect(TreeConfiguration.getWorkingTree().getProxyFor(id)).not.
      toBeDefined();
    TestBed.get(ActivatedRoute).params.next({ id: id });
    tick();
    /* Since the selection is to be synchronized by default, call the
    toggleSelectionSynchronization function twice to trigger showing the
    selected Item */
    component.toggleSelectionSynchronization();
    component.toggleSelectionSynchronization();

    // TODO: This test seems to be missing some expect clauses
    expect(true).toEqual(true);
  }));

  it('filters when a search string is provided', (done: Function) => {
    expect(component.filterSubject.getValue()).not.toBeDefined();
    component.searchStringChanged('Search String');
    setTimeout(() => {
      let filter: Filter = component.filterSubject.getValue();
      expect(filter.rootElement.criteria[0]).toEqual(component.
        searchCriterion);
      done();
    }, 1000);
  });

  it('moves an Item before another Item', () => {
    let targetingProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor('test-uuid5');
    targetingProxy.parentProxy.makeChildrenManualOrdered();
    let targetProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor('test-uuid1');
    component.selectedObjectsSubject.next([targetingProxy]);
    (component.rowActions[1] as ActionGroup).actions[0].perform(targetProxy);
    expect(targetingProxy.parentProxy.children.indexOf(targetingProxy)).
      toEqual(targetingProxy.parentProxy.children.indexOf(targetProxy) - 1);
  });

  it('moves an Item after another Item', () => {
    let targetProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor('test-uuid5');
    targetProxy.parentProxy.makeChildrenManualOrdered();
    let targetingProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor('test-uuid2');
    component.selectedObjectsSubject.next([targetingProxy]);
    (component.rowActions[1] as ActionGroup).actions[1].perform(targetProxy);
    expect(targetProxy.parentProxy.children.indexOf(targetProxy)).toEqual(
      targetProxy.parentProxy.children.indexOf(targetingProxy) - 1);
  });

  it('makes an Item a child of another Item', () => {
    let targetProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor('test-uuid5');
    let targetingProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor('test-uuid3');
    component.selectedObjectsSubject.next([targetingProxy]);
    (component.rowActions[1] as ActionGroup).actions[2].perform(targetProxy);
    expect(targetProxy.children.indexOf(targetingProxy)).not.toEqual(-1);
  });
});
