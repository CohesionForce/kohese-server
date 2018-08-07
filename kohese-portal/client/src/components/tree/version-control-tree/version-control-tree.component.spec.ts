import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { ToastrModule } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MaterialModule } from '../../../material.module';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { MockVersionControlService } from '../../../../mocks/services/MockVersionControlService';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { VersionControlTreeComponent } from './version-control-tree.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { TreeRow } from '../tree-row/tree-row.class';
import { Filter } from '../../filter/filter.class';

describe('Component: version-control-tree', () => {
  let component: VersionControlTreeComponent;
  let descendantProxy: ItemProxy;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VersionControlTreeComponent],
      imports: [
        BrowserAnimationsModule,
        VirtualScrollModule,
        ToastrModule.forRoot(),
        MaterialModule
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository }, {
          provide: ActivatedRoute,
          useValue: { params: new BehaviorSubject<any>({ id: ''}) }
        }, { provide: DialogService, useClass: MockDialogService },
        { provide: NavigationService, useClass: MockNavigationService },
        {
          provide: VersionControlService,
          useClass: MockVersionControlService
        },
        { provide: DynamicTypesService, useClass: MockDynamicTypesService }
      ]
    }).compileComponents();
    
    let fixture: ComponentFixture<VersionControlTreeComponent> = TestBed.
      createComponent(VersionControlTreeComponent);
    component = fixture.componentInstance;
    
    descendantProxy = TreeConfiguration.getWorkingTree().getRootProxy().
      children[0];
    descendantProxy.status['Status'] = 'Status';
    
    fixture.detectChanges();
  });
  
  it('initializes', () => {
    expect(component.getRootRow()).toBeDefined();
    let descendantIndex: number = -1;
    for (let j: number = 0; j < component.visibleRows.length; j++) {
      if (component.visibleRows[j].object === descendantProxy) {
        descendantIndex = j;
        break;
      }
    }
    expect(descendantIndex).not.toEqual(-1);
  });
  
  it('filters after a search string is entered', (done: Function) => {
    expect(component.filterSubject.getValue()).not.toBeDefined();
    component.searchStringChanged('Search String');
    setTimeout(() => {
      let filter: Filter = component.filterSubject.getValue();
      expect(filter.rootElement.criteria[0]).toEqual(component.
        searchCriterion);
      done();
    }, 1000);
  });
});