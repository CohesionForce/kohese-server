import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
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
import * as ItemProxy from '../../../../common/models/item-proxy';
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
      imports: [MaterialModule, PipesModule]
    }).compileComponents();
    
    fixture = TestBed.createComponent(TreeRowComponent);
    component = fixture.componentInstance;
    component.itemProxy = new ItemProxy('Item', MockItem);
    component.filterStream =
      new BehaviorSubject<ProxyFilter>(new ProxyFilter());
    
    fixture.detectChanges();
  });
  
  it('filters based on type', fakeAsync(() => {
    let filterStream: BehaviorSubject<ProxyFilter> =
      component.filterStream as BehaviorSubject<ProxyFilter>;
    let filter: ProxyFilter = filterStream.getValue();
    filter.kind = new KoheseType(new ItemProxy('KoheseModel', MockDataModel),
      new ItemProxy('KoheseView', MockViewData));
    filterStream.next(filter);
    tick();
    expect(component.isVisible()).toEqual(true);
    filter.kind.name = 'Isaiah';
    filterStream.next(filter);
    tick();
    expect(component.isVisible()).toEqual(false);
  }));
  
  it('filters based on the user assigned to an Action', fakeAsync(() => {
    let filterStream: BehaviorSubject<ProxyFilter> =
      component.filterStream as BehaviorSubject<ProxyFilter>;
    component.itemProxy.kind = 'Action';
    let filter: ProxyFilter = filterStream.getValue();
    filter.kind = new KoheseType(new ItemProxy('KoheseModel', MockDataModel),
      new ItemProxy('KoheseView', MockViewData));
    filter.kind.name = 'Action';
    filter.actionAssignee = 'admin';
    component.itemProxy.kind = 'Action';
    component.itemProxy.item.assignedTo = 'admin';
    filterStream.next(filter);
    tick();
    expect(component.isVisible()).toEqual(true);
    filter.actionAssignee = 'John';
    filterStream.next(filter);
    tick();
    expect(component.isVisible()).toEqual(false);
  }));
  
  it('filters based on whether there is a version control status',
    fakeAsync(() => {
    let filterStream: BehaviorSubject<ProxyFilter> =
      component.filterStream as BehaviorSubject<ProxyFilter>;
    let filter: ProxyFilter = filterStream.getValue();
    filter.status = true;
    let statuses: Array<string> = [];
    component.itemProxy.status = statuses;
    filterStream.next(filter);
    tick();
    expect(component.isVisible()).toEqual(false);
    statuses.push('Hezekiah');
    filterStream.next(filter);
    tick();
    expect(component.isVisible()).toEqual(true);
  }));
  
  it('filters based on whether there are unsaved changes', fakeAsync(() => {
    let filterStream: BehaviorSubject<ProxyFilter> =
      component.filterStream as BehaviorSubject<ProxyFilter>;
    let filter: ProxyFilter = filterStream.getValue();
    filter.dirty = true;
    filterStream.next(filter);
    tick();
    expect(component.isVisible()).toEqual(false);
    component.itemProxy.dirty = true;
    filterStream.next(filter);
    tick();
    expect(component.isVisible()).toEqual(true);
  }));
  
  it('filters based on the content of string fields', fakeAsync(() => {
    let filterStream: BehaviorSubject<ProxyFilter> =
      component.filterStream as BehaviorSubject<ProxyFilter>;
    let filter: ProxyFilter = filterStream.getValue();
    filter.filterString = 'Joshua';
    filterStream.next(filter);
    tick();
    expect(component.isVisible()).toEqual(false);
    component.itemProxy.item.description = 'Zechariah Joshua Luke';
    filterStream.next(filter);
    tick();
    expect(component.isVisible()).toEqual(true);
  }));
  
  it('expands tree-rows that pass the filter and have a version control ' +
    'status when the version control view is selected', fakeAsync(() => {
    let filterStream: BehaviorSubject<ProxyFilter> =
      component.filterStream as BehaviorSubject<ProxyFilter>;
    let filter: ProxyFilter = filterStream.getValue();
    let statuses: Array<string> = ['Luke'];
    component.itemProxy.status = statuses;
    filter.status = true;
    filter.filterString = 'Timothy';
    filterStream.next(filter);
    tick();
    expect(component.expanded).toEqual(false);
    component.itemProxy.item.description = 'Titus Philemon Timothy';
    filterStream.next(filter);
    tick();
    expect(component.expanded).toEqual(true);
  }));
});