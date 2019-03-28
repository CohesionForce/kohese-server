import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of as ObservableOf } from 'rxjs';

import { MaterialModule } from '../../../../material.module';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../../mocks/services/MockDialogService';
import { ProxyTableComponent } from './proxy-table.component';
import { ItemProxy } from '../../../../../../common/src/item-proxy';

describe('Component: proxy-table', () => {
  let component: ProxyTableComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProxyTableComponent],
      imports: [MaterialModule],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    
    let fixture: ComponentFixture<ProxyTableComponent> = TestBed.
      createComponent(ProxyTableComponent);
    component = fixture.componentInstance;
    component.columns = ['name'];
    component.dataStream = ObservableOf([{ id: 'Kurios Iesous' },
      { id: 'test-uuid3' }, { id: 'test-uuid1' }]);
    fixture.detectChanges();
  });
  
  it('can change the check state associated with an ItemProxy', () => {
    let itemProxy: ItemProxy = component.dataSource[2];
    expect(component.selectedIds.indexOf(itemProxy.item.id)).toEqual(-1);
    component.checkStateChanged(true, itemProxy);
    expect(component.selectedIds.indexOf(itemProxy.item.id)).not.toEqual(-1);
    component.checkStateChanged(false, itemProxy);
    expect(component.selectedIds.indexOf(itemProxy.item.id)).toEqual(-1);
  });
  
  it('can determine if the selected ItemProxys may be moved up', () => {
    component.checkStateChanged(true, component.dataSource[2]);
    expect(component.canMoveSelectionUp()).toEqual(true);
    component.checkStateChanged(true, component.dataSource[0]);
    expect(component.canMoveSelectionUp()).toEqual(false);
  });
  
  it('can determine if the selected ItemProxys may be moved down', () => {
    component.checkStateChanged(true, component.dataSource[1]);
    expect(component.canMoveSelectionDown()).toEqual(true);
    component.checkStateChanged(true, component.dataSource[2]);
    expect(component.canMoveSelectionDown()).toEqual(false);
  });
  
  it('can remove the selected ItemProxys', () => {
    component.checkStateChanged(true, component.dataSource[2]);
    component.removeSelection();
    expect(component.selectedIds.length).toEqual(0);
  });
  
  it('can calculate the minimum width of the checkbox column', () => {
    expect(component.getCheckboxColumnWidth()['min-width']).toEqual(
      ProxyTableComponent.CHECKBOX_COLUMN_WIDTH + 'px');
  });
  
  it('can calculate the minimum width of non-checkbox columns', () => {
    expect(component.getColumnWidthStyle(3)['min-width']).toEqual('100px');
    expect(component.getColumnWidthStyle(103 + ProxyTableComponent.
      CHECKBOX_COLUMN_WIDTH)['min-width']).toEqual('103px');
  });
  
  it('can calculate the minimum width of rows', () => {
    expect(component.getRowWidthStyle(3)['min-width']).toEqual('140px');
  });
});