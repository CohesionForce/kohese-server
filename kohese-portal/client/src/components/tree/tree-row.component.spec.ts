import { TestBed, ComponentFixture } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MaterialModule } from '../../material.module';
import { NavigationService } from '../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { DialogService } from '../../services/dialog/dialog.service';
import { MockDialogService } from '../../../mocks/services/MockDialogService';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../mocks/services/MockDynamicTypesService';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { TreeRowComponent } from './tree-row.component';
import { TreeRow } from './tree-row.class';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';

describe('Component: tree-row', () => {
  let component: TreeRowComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TreeRowComponent],
      imports: [MaterialModule],
      providers: [
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: DialogService, useClass: MockDialogService },
        { provide: DynamicTypesService, useClass: MockDynamicTypesService },
        { provide: ItemRepository, useClass: MockItemRepository }
      ]
    }).compileComponents();
    
    let fixture: ComponentFixture<TreeRowComponent> = TestBed.createComponent(
      TreeRowComponent);
    component = fixture.componentInstance;
    let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getRootProxy();
    let row: TreeRow = new TreeRow(proxy);
    row.depth = 3;
    component.treeRow = row;
    component.treeRootStream = new BehaviorSubject<ItemProxy>(proxy);
    
    fixture.detectChanges();
  });
  
  it('calculates the correct number of pixels by which to indent', () => {
    expect(component.getIndentationStyle()['padding-left']).toEqual('45px');
  });
});