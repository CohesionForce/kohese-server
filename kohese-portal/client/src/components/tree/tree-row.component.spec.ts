import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { NavigationService } from '../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { DialogService } from '../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../mocks/services/MockDynamicTypesService';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { VersionControlService } from '../../services/version-control/version-control.service';
import { MockVersionControlService } from '../../../mocks/services/MockVersionControlService';
import { TreeRowComponent } from './tree-row.component';
import { MockItem } from '../../../mocks/data/MockItem';
import { MockDataModel } from '../../../mocks/data/MockDataModel';
import { MockViewData } from '../../../mocks/data/MockViewData';
import { ProxyFilter } from '../../classes/ProxyFilter.class';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { TreeRow } from './tree-row.class';
import * as ItemProxy from '../../../../common/src/item-proxy';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

describe('Component: TreeRow', () => {
  let fixture: ComponentFixture<TreeRowComponent>;
  let component: TreeRowComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TreeRowComponent],
      providers: [
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: DialogService, useValue: {} },
        { provide: DynamicTypesService, useClass: MockDynamicTypesService },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: VersionControlService,
          useClass: MockVersionControlService },
        { provide: ChangeDetectorRef, useValue: {} }
      ],
      imports: [ToastrModule.forRoot(), MaterialModule, PipesModule]
    }).compileComponents();
    
    fixture = TestBed.createComponent(TreeRowComponent);
    component = fixture.componentInstance;
    component.treeRow = new TreeRow(new ItemProxy('Item', MockItem()));
    component.treeRootStream = new BehaviorSubject<ItemProxy>(ItemProxy.
      getRootProxy());
    
    fixture.detectChanges();
  });
  
  it('filters based on type', () => {
    let filter: ProxyFilter = new ProxyFilter();
    filter.kind = new KoheseType(new ItemProxy('KoheseModel', MockDataModel()),
      new ItemProxy('KoheseView', MockViewData()));
    component.treeRow.filter(filter);
    expect(component.treeRow.visible).toEqual(true);
    filter.kind.name = 'Isaiah';
    component.treeRow.filter(filter);
    expect(component.treeRow.visible).toEqual(false);
  });
  
  it('filters based on the user assigned to an Action', () => {
    component.treeRow.itemProxy.kind = 'Action';
    let filter: ProxyFilter = new ProxyFilter();
    filter.kind = new KoheseType(new ItemProxy('KoheseModel', MockDataModel()),
      new ItemProxy('KoheseView', MockViewData()));
    filter.kind.name = 'Action';
    filter.actionAssignee = 'admin';
    component.treeRow.itemProxy.kind = 'Action';
    component.treeRow.itemProxy.item.assignedTo = 'admin';
    component.treeRow.filter(filter);
    expect(component.treeRow.visible).toEqual(true);
    filter.actionAssignee = 'John';
    component.treeRow.filter(filter);
    expect(component.treeRow.visible).toEqual(false);
  });
  
  it('filters based on whether there is a version control status',
    () => {
    let filter: ProxyFilter = new ProxyFilter();
    filter.status = true;
    let statuses: Array<string> = [];
    component.treeRow.itemProxy.status = statuses;
    component.treeRow.filter(filter);
    expect(component.treeRow.visible).toEqual(false);
    statuses.push('Hezekiah');
    component.treeRow.filter(filter);
    expect(component.treeRow.visible).toEqual(true);
  });
  
  it('filters based on whether there are unsaved changes', () => {
    let filter: ProxyFilter = new ProxyFilter();
    filter.dirty = true;
    component.treeRow.filter(filter);
    expect(component.treeRow.visible).toEqual(false);
    component.treeRow.itemProxy.dirty = true;
    component.treeRow.filter(filter);
    expect(component.treeRow.visible).toEqual(true);
  });
  
  it('filters based on the content of string fields', () => {
    let filter: ProxyFilter = new ProxyFilter();
    filter.filterString = 'Joshua';
    component.treeRow.filter(filter);
    expect(component.treeRow.visible).toEqual(false);
    component.treeRow.itemProxy.item.description = 'Zechariah Joshua Luke';
    component.treeRow.filter(filter);
    expect(component.treeRow.visible).toEqual(true);
  });
  
  it('calculates the correct number of pixels by which to indent', () => {
    expect(component.getIndentationStyle()['padding-left']).toEqual('30px');
  });
});