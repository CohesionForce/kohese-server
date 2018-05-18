import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../mocks/services/MockDynamicTypesService';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { SessionService } from '../../services/user/session.service';
import { MockSessionService } from '../../../mocks/services/MockSessionService';
import { NavigatorComponent } from './navigator.component';
import { MockItem } from '../../../mocks/data/MockItem';
import { MockDataModel } from '../../../mocks/data/MockDataModel';
import { MockViewData } from '../../../mocks/data/MockViewData';
import { ProxyFilter } from '../../classes/ProxyFilter.class';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { Tree } from '../tree/tree.class';
import { TreeRow } from '../tree/tree-row.class';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { KoheseModel } from '../../../../common/src/KoheseModel';

describe('Component: navigator', () => {
  let component: NavigatorComponent;
  let row: TreeRow;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NavigatorComponent],
      providers: [
        { provide: DynamicTypesService, useClass: MockDynamicTypesService },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: SessionService, useClass: MockSessionService }
      ],
      imports: [
        BrowserAnimationsModule,
        MaterialModule,
        PipesModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    let fixture: ComponentFixture<NavigatorComponent> = TestBed.
      createComponent(NavigatorComponent);
    component = fixture.componentInstance;
    
    row = new TreeRow(TreeConfiguration.getWorkingTree().getProxyFor(
      'test-uuid7'));

    fixture.detectChanges();
  });
  
  it('modifies the filter when the "Version Control" view is selected', () => {
    expect(component.proxyFilter.status).toEqual(false);
    component.viewSelectionChanged('Version Control');
    expect(component.proxyFilter.status).toEqual(true);
  });

  it('filters based on type', () => {
    let tree: Tree = component.viewMap['Default'];
    let filter: ProxyFilter = component.proxyFilter;
    filter.kind = new KoheseType(new KoheseModel(MockDataModel()),
      new ItemProxy('KoheseView', MockViewData()));
    tree.preRowProcessingActivity(row);
    expect(row.visible).toEqual(true);
    filter.kind.dataModelProxy.item.name = 'Isaiah';
    tree.preRowProcessingActivity(row);
    expect(row.visible).toEqual(false);
  });

  it('filters based on the user assigned to an Action', () => {
    row.itemProxy.kind = 'Action';
    let tree: Tree = component.viewMap['Default'];
    let filter: ProxyFilter = component.proxyFilter;
    filter.kind = new KoheseType(new KoheseModel(MockDataModel()),
      new ItemProxy('KoheseView', MockViewData()));
    filter.kind.dataModelProxy.item.name = 'Action';
    filter.actionAssignee = 'admin';
    row.itemProxy.kind = 'Action';
    row.itemProxy.item.assignedTo = 'admin';
    tree.preRowProcessingActivity(row);
    expect(row.visible).toEqual(true);
    filter.actionAssignee = 'John';
    tree.preRowProcessingActivity(row);
    expect(row.visible).toEqual(false);
  });

  it('filters based on whether there is a version control status',
    () => {
    let tree: Tree = component.viewMap['Default'];
    let filter: ProxyFilter = component.proxyFilter;
    filter.status = true;
    let statuses: Array<string> = [];
    row.itemProxy.status = statuses;
    tree.preRowProcessingActivity(row);
    expect(row.visible).toEqual(false);
    statuses.push('Hezekiah');
    tree.preRowProcessingActivity(row);
    expect(row.visible).toEqual(true);
  });

  it('filters based on whether there are unsaved changes', () => {
    let tree: Tree = component.viewMap['Default'];
    let filter: ProxyFilter = component.proxyFilter;
    filter.dirty = true;
    tree.preRowProcessingActivity(row);
    expect(row.visible).toEqual(false);
    row.itemProxy.dirty = true;
    tree.preRowProcessingActivity(row);
    expect(row.visible).toEqual(true);
  });

  it('filters based on the content of string fields', () => {
    let tree: Tree = component.viewMap['Default'];
    let filter: ProxyFilter = component.proxyFilter;
    filter.filterString = 'Joshua';
    tree.preRowProcessingActivity(row);
    expect(row.visible).toEqual(false);
    row.itemProxy.item.description = 'Zechariah Joshua Luke';
    tree.preRowProcessingActivity(row);
    expect(row.visible).toEqual(true);
  });
});
