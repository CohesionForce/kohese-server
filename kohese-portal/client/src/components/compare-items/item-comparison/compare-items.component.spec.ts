import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../../../material.module';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { CompareItemsComponent } from './compare-items.component';

describe('Component: compare-items', () => {
  let component: CompareItemsComponent;

  beforeEach(() => {
    let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      'Kurios Iesous');
    TestBed.configureTestingModule({
      declarations: [CompareItemsComponent],
      imports : [
        MaterialModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {
          baseProxy: proxy,
          changeProxy: proxy
        } },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DynamicTypesService, useClass: MockDynamicTypesService },
        { provide: DialogService, useClass: MockDialogService },
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: MatDialogRef, useValue: { close: () => {} } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    let compareItemsFixture: ComponentFixture<CompareItemsComponent> = TestBed.
      createComponent(CompareItemsComponent);
    component = compareItemsFixture.componentInstance;

    compareItemsFixture.detectChanges();
  });
  
  it('responds to selecting a base ItemProxy', async () => {
    let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      'test-uuid3');
    await component.proxySelectionChanged(component.baseProxySubject, proxy);
    expect(component.baseProxySubject.getValue()).toBe(proxy);
    expect(component.selectedBaseVersion).toBeTruthy();
    expect(component.baseVersions.length).toBeGreaterThan(0);
  });
  
  it('responds to selecting a change ItemProxy', async () => {
    let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      'test-uuid3');
    await component.proxySelectionChanged(component.changeProxySubject, proxy);
    expect(component.changeProxySubject.getValue()).toBe(proxy);
    expect(component.selectedChangeVersion).toBeTruthy();
    expect(component.changeVersions.length).toBeGreaterThan(0);
  });
  
  it('compares two objects', async () => {
    let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      'Kurios Iesous');
    await component.proxySelectionChanged(component.baseProxySubject, proxy);
    await component.proxySelectionChanged(component.changeProxySubject, proxy);
    await component.compare();
    expect(component.comparison).toBeDefined();
  });
  
  it('toggles the value of the showDifferencesOnlySubject', () => {
    expect(component.showDifferencesOnlySubject.getValue()).toEqual(true);
    component.toggleShowingDifferencesOnly();
    expect(component.showDifferencesOnlySubject.getValue()).toEqual(false);
  });
});
