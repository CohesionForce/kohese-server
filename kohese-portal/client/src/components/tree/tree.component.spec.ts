import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { NavigationService } from '../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../mocks/services/MockDynamicTypesService';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { SessionService } from '../../services/user/session.service';
import { MockSessionService } from '../../../mocks/services/MockSessionService';
import { ActivatedRoute } from '@angular/router';
import { TreeComponent } from './tree.component';
import { TreeRow } from './tree-row.class';
import { MockItem } from '../../../mocks/data/MockItem';
import * as ItemProxy from '../../../../common/src/item-proxy';
import { Observable } from 'rxjs/Observable';

describe('Component: Tree', () => {
  let fixture: ComponentFixture<TreeComponent>;
  let component: TreeComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TreeComponent],
      providers: [
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: DynamicTypesService, useClass: MockDynamicTypesService },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: SessionService, useClass: MockSessionService },
        { provide: ActivatedRoute, useValue: {
            params: Observable.of({
                id: 7
              })
          } }
      ],
      imports: [FormsModule, BrowserAnimationsModule, MaterialModule,
        PipesModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    
    fixture = TestBed.createComponent(TreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('filters when the selected view changes', () => {
    expect(component.proxyFilter.status).toEqual(false);
    component.viewSelectionChanged('Version Control');
    expect(component.proxyFilter.status).toEqual(true);
  });
  
  it('builds a TreeRow for a new Item and, if that TreeRow should be ' +
    'visible, inserts it into the Array of visible TreeRows at the ' +
    'correct index', fakeAsync(() => {
    let item: any = MockItem();
    item.id = 'Kurios Iesous';
    item.parentId = 'test-uuid3';
    for (let j: number = 0; j < component.visibleRows.length; j++) {
      if (item.parentId === component.visibleRows[j].itemProxy.item.id) {
        component.visibleRows[j].expanded = true;
        break;
      }
    }
    ItemProxy.getChangeSubject().next({
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
  
  it('removes the TreeRow for a deleted Item', fakeAsync(() => {
    let numberOfVisibleRows: number = component.visibleRows.length;
    let proxy: ItemProxy = ItemProxy.getProxyFor('test-uuid6');
    proxy.deleteItem();
    ItemProxy.getChangeSubject().next({
      type: 'delete',
      kind: 'Item',
      id: proxy.item.id,
      proxy: proxy
    });
    tick();
    expect(component.visibleRows.length).toEqual(numberOfVisibleRows - 1);
  }));
  
  it('expands and collapses all TreeRows', () => {
    let numberOfInitiallyVisibleRows: number = component.visibleRows.length;
    component.expandAll();
    expect(component.visibleRows.length).toBeGreaterThan(
      numberOfInitiallyVisibleRows);
    component.collapseAll();
    expect(component.visibleRows.length).toEqual(numberOfInitiallyVisibleRows);
  });
  
  it('correctly responds to the tree root changing', fakeAsync(() => {
    let initialTreeRoot: ItemProxy = component.treeRootStream.getValue();
    let initialVisibleRows: Array<TreeRow> = component.visibleRows;
    component.treeRootStream.next(ItemProxy.getRootProxy().children[0]);
    tick();
    expect(initialTreeRoot).not.toEqual(component.treeRootStream.getValue());
    expect(component.visibleRows.indexOf(initialVisibleRows[0])).toEqual(-1);
  }));
});