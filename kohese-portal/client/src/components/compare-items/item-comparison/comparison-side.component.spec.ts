import { TestBed, ComponentFixture, fakeAsync,
  tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../../../material.module';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { MockKoheseType } from '../../../../mocks/data/MockKoheseType';
import { ComparisonSideComponent } from './comparison-side.component';

describe('Component: comparison-side', () => {
  let component: ComparisonSideComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComparisonSideComponent],
      imports: [MaterialModule, BrowserAnimationsModule],
      providers: [{ provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    
    let fixture: ComponentFixture<ComparisonSideComponent> = TestBed.
      createComponent(ComparisonSideComponent);
    component = fixture.componentInstance;
    let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      'test-uuid3');
    proxy.model.type = MockKoheseType();
    component.selectedObjectSubject.next(proxy);
    
    fixture.detectChanges();
  });
  
  it('resets the ItemProxy that was being edited when editing is canceled',
    fakeAsync(() => {
    let name: string = 'Kurios Iesous';

    component.toggleEditability();
    tick();
    (component.selectedObjectSubject.getValue() as ItemProxy).item.name = name;
    component.toggleEditability();
    tick();
    expect((component.selectedObjectSubject.getValue() as ItemProxy).item.
      name).not.toEqual(name);
  }));
});