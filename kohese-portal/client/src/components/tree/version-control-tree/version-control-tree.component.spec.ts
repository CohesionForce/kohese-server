import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { ToastrModule } from 'ngx-toastr';

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
import { TreeRow } from '../tree-row.class';

describe('Component: version-control-tree', () => {
  let component: VersionControlTreeComponent;
  let descendantProxy: ItemProxy;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VersionControlTreeComponent],
      imports: [
        VirtualScrollModule,
        ToastrModule.forRoot(),
        MaterialModule
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: ActivatedRoute, useValue: { params: Observable.of('') } },
        { provide: DialogService, useClass: MockDialogService },
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
    let rootRow: TreeRow = component.getRow('ROOT');
    expect(rootRow).toBeDefined();
    expect(component.getRow(descendantProxy.item.id)).toBeDefined();
    let childIndex: number = -1;
    let children: Array<TreeRow> = component.getChildren(rootRow);
    for (let j: number = 0; j < children.length; j++) {
      if (descendantProxy === children[j].object) {
        childIndex = j;
        break;
      }
    }
    expect(childIndex).not.toEqual(-1);
  });
});