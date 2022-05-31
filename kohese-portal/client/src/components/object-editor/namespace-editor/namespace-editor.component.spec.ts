/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

// Other External Dependencies
import { AngularSplitModule } from 'angular-split';

// Kohese
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NamespaceEditorComponent } from './namespace-editor.component';

// Mocks
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';

describe('NamespaceEditorComponent', () => {
  let component: NamespaceEditorComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NamespaceEditorComponent],
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MaterialModule,
        AngularSplitModule
      ],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService }
      ]
    }).compileComponents()
      .then(() => {
        let componentFixture: ComponentFixture<NamespaceEditorComponent> = TestBed.createComponent(NamespaceEditorComponent);
        component = componentFixture.componentInstance;

        component.selectedNamespace = TreeConfiguration.getWorkingTree().
          getProxyFor('b32b6e10-ed3c-11ea-8737-9f31b413a913').item;

        componentFixture.detectChanges();
      });

  }));

  afterEach(waitForAsync(() => {
    TestBed.resetTestingModule();
  }));

  it('determines if the selected Namespace is valid', () => {
    expect(component.isValid()).toBe(true);
    component.selectedNamespace.name = '';
    expect(component.isValid()).toBe(false);
    component.selectedNamespace = JSON.parse(JSON.stringify(component.selectedNamespace));
    expect(component.isValid()).toBe(false);
  });

  it('adds Namespaces', async () => {
    let namespacesBefore: Array<any> = [];
    let namespacesAfter: Array<any> = [];
    let modelDefinitionsProxy = TreeConfiguration.getWorkingTree().getProxyFor('Model-Definitions');

    // assertions
    modelDefinitionsProxy.visitTree({ includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'Namespace') {
        namespacesBefore.push(itemProxy.item);
      }
    }, undefined);

    await component.add();
    modelDefinitionsProxy.visitTree({ includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'Namespace') {
        namespacesAfter.push(itemProxy.item);
      }
    }, undefined);

    expect(namespacesBefore.length).toBe(namespacesAfter.length - 1);
  });

  it('retrieves Namespaces', () => {
    let almostAllNamespaces: Array<any> = component.getNamespaces(true);
    let allNamespaces: Array<any> = component.getNamespaces(false);

    expect(almostAllNamespaces.indexOf(component.selectedNamespace)).toBe(-1);
    expect(allNamespaces.length).toBe(almostAllNamespaces.length + 1);
    expect(allNamespaces.indexOf(component.selectedNamespace)).not.toBe(-1);
  });

  it('retrieves enclosing Namespace options', () => {
    let comKoheseItem = TreeConfiguration.getWorkingTree().getProxyFor('com.kohese').item;
    let comKoheseMetamodel = TreeConfiguration.getWorkingTree().getProxyFor('com.kohese.metamodel').item;
    // 'Project'
    let testItem = TreeConfiguration.getWorkingTree().getProxyFor('03741da0-ed41-11ea-8737-9f31b413a913').item;

    let enclosingNamespaceOptions: Array<any> = component.getEnclosingNamespaceOptions();

    expect(enclosingNamespaceOptions.indexOf(comKoheseItem)).toBe(-1);

    expect(enclosingNamespaceOptions.indexOf(comKoheseMetamodel)).toBe(-1);

    // console.log('#############################################################' +
    //   'Retrives NS Ops Expect 3 >>>'+'%s', enclosingNamespaceOptions.indexOf(testItem));
    //   console.log('#############################################################' +
    //   'Retrives NS Ops Expect 3 >>>'+'%o', testItem);
    // console.log('#############################################################' +
    //   'Enclosing NS Ops Expect 3 >>>'+'%o', JSON.parse(JSON.stringify(enclosingNamespaceOptions)));

    expect(enclosingNamespaceOptions.indexOf(testItem)).toBe(-1);
  });

  it('removes Namespaces', async () => {
    await component.remove(component.selectedNamespace);
    let selectedNamespaceFound: boolean = false;
    let namespaceNamespaceFound: boolean = false;
    let namespaceDataModelFound: boolean = false;
    let namespaceNamespaceDataModelFound: boolean = false;
    let modelDefinitionsProxy = TreeConfiguration.getWorkingTree().getProxyFor('Model-Definitions');

    modelDefinitionsProxy.visitTree({ includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'Namespace') {
        if (itemProxy.item.id === component.selectedNamespace.id) {
          selectedNamespaceFound = true;
        } else if (itemProxy.item.id === '03741da0-ed41-11ea-8737-9f31b413a913') {
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

    // Kohese Namespace
    /**
   *    new ItemProxy('Namespace', {
          alias: 'Kohese',
          id: 'com.kohese',
          name: 'Kohese Namespace',
          parentId: 'Model-Definitions',
          editable: false
        });
     */
    component.selectedNamespace = TreeConfiguration.getWorkingTree().getProxyFor('com.kohese').item;

    // 'Project'
    /**
   *    new ItemProxy('Namespace', {
          alias: 'SubSubGlobal',
          id: '03741da0-ed41-11ea-8737-9f31b413a913',
          name: 'Sub-Sub-Global Namespace',
          parentId: 'b32b6e10-ed3c-11ea-8737-9f31b413a913'
        });
     */
    let namespaceItemProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor('03741da0-ed41-11ea-8737-9f31b413a913');

    // 'Project'
    /**
   *    new ItemProxy('Namespace', {
          alias: 'SubSubGlobal',
          id: '03741da0-ed41-11ea-8737-9f31b413a913',
          name: 'Sub-Sub-Global Namespace',
          parentId: 'b32b6e10-ed3c-11ea-8737-9f31b413a913'
        });
     */
    let dataModelItemProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor('Project');


    // id: 'com.kohese'
    let selectedNamespaceID = component.selectedNamespace.id;
    let matDialogRefPlaceholder: any = {
      updateSize: (width: string, height: string) => {
        return matDialogRefPlaceholder;
      },
      afterClosed: () => {
        return of([[namespaceItemProxy]]);
      }
    };

    spyOn(TestBed.inject(DialogService), 'openComponentsDialog').and.returnValue(matDialogRefPlaceholder);
    await component.addSubcomponent(true);

    // namespaceItemProxy.item.parentId = 'b32b6e10-ed3c-11ea-8737-9f31b413a913'

    // 'Category'
    /** new ItemProxy('Namespace', {
          alias: 'SubGlobal',
          id: 'b32b6e10-ed3c-11ea-8737-9f31b413a913',
          name: 'Sub-Global Namespace',
          parentId: 'com.kohese'
        });
    */

    // component.selectedNamespace.id = 'com.kohese'
    expect(namespaceItemProxy.item.parentId).toBe(component.selectedNamespace.id);

    matDialogRefPlaceholder.afterClosed = () => {
      return of([[dataModelItemProxy]]);
    };

    await component.addSubcomponent(false);
    expect(dataModelItemProxy.item.namespace.id).toBe(component.selectedNamespace.id);
  });

  it('retrieves subcomponents of a Namespace', () => {
    let categoryItem = TreeConfiguration.getWorkingTree().getProxyFor('Category').item;
    let projectItem = TreeConfiguration.getWorkingTree().getProxyFor('03741da0-ed41-11ea-8737-9f31b413a913').item;
    expect(component.getSubcomponents()).toEqual([categoryItem, projectItem]);
  });
});
