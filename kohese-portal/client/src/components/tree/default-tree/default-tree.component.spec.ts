import { TestBed, ComponentFixture, fakeAsync,
  tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MaterialModule } from '../../../material.module';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { DefaultTreeComponent } from './default-tree.component';
import { TreeRow } from '../tree-row/tree-row.class';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { KoheseModel } from '../../../../../common/src/KoheseModel';
import { Filter } from '../../filter/filter.class';
import { MockItem } from '../../../../mocks/data/MockItem';
import { MockDataModel } from '../../../../mocks/data/MockDataModel';

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
        { provide: DynamicTypesService, useClass: MockDynamicTypesService }
      ]
    }).compileComponents();
    
    let fixture: ComponentFixture<DefaultTreeComponent> = TestBed.
      createComponent(DefaultTreeComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });
  
  it('builds a TreeRow for a new Item', fakeAsync(() => {
    new KoheseModel(MockDataModel());
    KoheseModel.modelDefinitionLoadingComplete();
    let item: any = MockItem();
    item.id = 'Kurios Iesous';
    item.parentId = 'test-uuid3';
    for (let j: number = 0; j < component.visibleRows.length; j++) {
      if (item.parentId === (component.visibleRows[j].object as ItemProxy).
        item.id) {
        component.visibleRows[j].expanded = true;
        break;
      }
    }
    TreeConfiguration.getWorkingTree().getChangeSubject().next({
      type: 'create',
      kind: 'Item',
      id: item.id,
      proxy: new ItemProxy('Item', item)
    });
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
    proxy.deleteItem();
    TreeConfiguration.getWorkingTree().getChangeSubject().next({
      type: 'delete',
      kind: 'Item',
      id: proxy.item.id,
      proxy: proxy
    });
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

    expect(true).toEqual(true);
  }));
  
  it('filters when a search string is provided', (done: Function) => {
    expect(component.filterSubject.getValue()).not.toBeDefined();
    component.searchStringChanged('Search String');
    setTimeout(() => {
      let filter: Filter = component.filterSubject.getValue();
      expect(filter).not.toBeDefined();
      done();
    }, 1000);
  });
});