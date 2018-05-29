import { TestBed, ComponentFixture, fakeAsync,
  tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { MaterialModule } from '../../../material.module';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { DefaultTreeComponent } from './default-tree.component';
import { TreeRow } from '../tree-row.class';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { KoheseModel } from '../../../../../common/src/KoheseModel';
import { MockItem } from '../../../../mocks/data/MockItem';
import { MockDataModel } from '../../../../mocks/data/MockDataModel';

describe('Component: default-tree', () => {
  let component: DefaultTreeComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DefaultTreeComponent],
      imports: [
        VirtualScrollModule,
        MaterialModule
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: { params: Observable.of('') } },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService }
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
      if (item.parentId === component.visibleRows[j].itemProxy.item.id) {
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
      if (item.id === component.visibleRows[j].itemProxy.item.id) {
        newRowIndex = j;
        break;
      }
    }
    expect(newRowIndex).toEqual(6);
  }));
  
  it('retrieves the TreeRow for an ID', () => {
    expect(component.getRow('Kurios Iesous')).toBeDefined();
  });
  
  it('removes the TreeRow for a deleted Item', fakeAsync(() => {
    let numberOfVisibleRows: number = component.visibleRows.length;
    let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor('test-uuid6');
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
    let initialTreeRoot: ItemProxy = component.rootSubject.getValue();
    let initialVisibleRows: Array<TreeRow> = component.visibleRows;
    component.rootSubject.next(TreeConfiguration.getWorkingTree().
      getRootProxy().children[0]);
    tick();
    expect(initialTreeRoot).not.toBe(component.rootSubject.getValue());
    expect(component.visibleRows.indexOf(initialVisibleRows[0])).toEqual(-1);
  }));
  
  it('synchronizes with selection', fakeAsync(() => {
    component.selectedIdSubject.next('Item');
    tick();

    let index: number = -1;
    for (let j: number = 0; j < component.visibleRows.length; j++) {
      if ('Item' === component.visibleRows[j].itemProxy.item.id) {
        index = j;
        break;
      }
    }
    expect(index).toEqual(-1);

    /* Since the selection is to be synchronized by default, call the
    toggleSelectionSynchronization function twice to trigger showing the
    selected Item */
    component.toggleSelectionSynchronization();
    component.toggleSelectionSynchronization();

    for (let j: number = 0; j < component.visibleRows.length; j++) {
      if ('Item' === component.visibleRows[j].itemProxy.item.id) {
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
    component.selectedIdSubject.next(id);
    tick();
    /* Since the selection is to be synchronized by default, call the
    toggleSelectionSynchronization function twice to trigger showing the
    selected Item */
    component.toggleSelectionSynchronization();
    component.toggleSelectionSynchronization();

    expect(true).toEqual(true);
  }));
});