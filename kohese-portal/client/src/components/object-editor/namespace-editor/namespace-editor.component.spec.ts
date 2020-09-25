import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatInputModule, MatSelectModule,
  MatTooltipModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularSplitModule } from 'angular-split';
import { of } from 'rxjs';

import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NamespaceEditorComponent } from './namespace-editor.component';

describe('NamespaceEditorComponent', () => {
  let component: NamespaceEditorComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NamespaceEditorComponent],
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MatInputModule,
        MatTooltipModule,
        MatIconModule,
        MatSelectModule,
        AngularSplitModule
      ],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService }
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<NamespaceEditorComponent> = TestBed.
      createComponent(NamespaceEditorComponent);
    component = componentFixture.componentInstance;
    component.selectedNamespace = TreeConfiguration.getWorkingTree().
      getProxyFor('b32b6e10-ed3c-11ea-8737-9f31b413a913').item;

    componentFixture.detectChanges();
  });

  it('determines if the selected Namespace is valid', () => {
    expect(component.isValid()).toBe(true);
    component.selectedNamespace.name = '';
    expect(component.isValid()).toBe(false);
    component.selectedNamespace = JSON.parse(JSON.stringify(component.
      selectedNamespace));
    expect(component.isValid()).toBe(false);
  });

  it('adds Namespaces', async () => {
    let namespacesBefore: Array<any> = [];
    TreeConfiguration.getWorkingTree().getProxyFor('Model-Definitions').
      visitTree({ includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'Namespace') {
        namespacesBefore.push(itemProxy.item);
      }
    }, undefined);
    await component.add();
    let namespacesAfter: Array<any> = [];
    TreeConfiguration.getWorkingTree().getProxyFor('Model-Definitions').
      visitTree({ includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'Namespace') {
        namespacesAfter.push(itemProxy.item);
      }
    }, undefined);

    expect(namespacesBefore.length).toBe(namespacesAfter.length - 1);
  });

  it('retrieves Namespaces', () => {
    let almostAllNamespaces: Array<any> = component.getNamespaces(true);
    expect(almostAllNamespaces.indexOf(component.selectedNamespace)).toBe(-1);
    let allNamespaces: Array<any> = component.getNamespaces(false);
    expect(allNamespaces.length).toBe(almostAllNamespaces.length + 1);
    expect(allNamespaces.indexOf(component.selectedNamespace)).not.toBe(-1);
  });

  it('removes Namespaces', async () => {
    await component.remove(component.selectedNamespace);
    let selectedNamespaceFound: boolean = false;
    let namespaceNamespaceFound: boolean = false;
    let namespaceDataModelFound: boolean = false;
    let namespaceNamespaceDataModelFound: boolean = false;
    TreeConfiguration.getWorkingTree().getProxyFor('Model-Definitions').
      visitTree({ includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'Namespace') {
        if (itemProxy.item.id === component.selectedNamespace.id) {
          selectedNamespaceFound = true;
        } else if (itemProxy.item.id ===
          '03741da0-ed41-11ea-8737-9f31b413a913') {
          namespaceNamespaceFound = true;
        }
      } else if (itemProxy.item.id === 'Category') {
        namespaceDataModelFound = true;
      } else if (itemProxy.item.id === 'Project') {
        namespaceNamespaceDataModelFound = true;
      }
    }, undefined);

    expect(selectedNamespaceFound).toBe(false);
    expect(namespaceNamespaceFound).toBe(false);
    expect(namespaceDataModelFound).toBe(false);
    expect(namespaceNamespaceDataModelFound).toBe(false);
  });

  it('adds subcomponents to a Namespace', async () => {
    component.selectedNamespace = TreeConfiguration.getWorkingTree().
      getProxyFor('com.kohese').item;
    let namespaceItemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor('03741da0-ed41-11ea-8737-9f31b413a913');
    let matDialogRefPlaceholder: any = {
      updateSize: (width: string, height: string) => {
        return matDialogRefPlaceholder;
      },
      afterClosed: () => {
        return of([[namespaceItemProxy]]);
      }
    };
    spyOn(TestBed.get(DialogService), 'openComponentsDialog').and.returnValue(
      matDialogRefPlaceholder);
    await component.addSubcomponent(true);
    expect(namespaceItemProxy.item.parentId).toBe(component.selectedNamespace.
      id);

    let dataModelItemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor('Project');
    matDialogRefPlaceholder.afterClosed = () => {
      return of([[dataModelItemProxy]]);
    };
    await component.addSubcomponent(false);
    expect(dataModelItemProxy.item.namespace.id).toBe(component.
      selectedNamespace.id);
  });

  it('retrieves subcomponents of a Namespace', () => {
    expect(component.getSubcomponents()).toEqual([TreeConfiguration.
      getWorkingTree().getProxyFor('Category').item, TreeConfiguration.
      getWorkingTree().getProxyFor('03741da0-ed41-11ea-8737-9f31b413a913').
      item]);
  });
});
