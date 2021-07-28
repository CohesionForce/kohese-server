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
import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material.module'; // deprecated
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

// Kohese
import { TypeEditorComponent } from './type-editor.component';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { PipesModule } from '../../pipes/pipes.module';
import { TreeViewModule } from '../tree/tree.module';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ComponentDialogComponent } from '../dialog/component-dialog/component-dialog.component';

// Mocks
import { MockDialogService } from '../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';

describe('Component: Type Editor', ()=>{
  let typeEditorComponent: TypeEditorComponent;
  let typeEditorFixture : ComponentFixture<TypeEditorComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [TypeEditorComponent],
      imports: [
        CommonModule,
        MaterialModule,
        BrowserAnimationsModule,
        PipesModule,
        TreeViewModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        DynamicTypesService,
        {provide: DialogService, useClass: MockDialogService},
        {provide: ItemRepository, useClass: MockItemRepository}
      ]
    }).compileComponents();

    typeEditorFixture = TestBed.createComponent(TypeEditorComponent);
    typeEditorComponent = typeEditorFixture.componentInstance;
    typeEditorFixture.detectChanges();
  });

  afterEach(() => {
    typeEditorFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the Type Editor component', ()=>{
    expect(typeEditorComponent).toBeTruthy();
  });

  it('retrieves all Namespaces', () => {
    expect(typeEditorComponent.getNamespaces().length).toBe(6);
  });

  it('retrieves all types in a given Namespace', () => {
    expect(typeEditorComponent.getNamespaceTypes(TreeConfiguration.
      getWorkingTree().getProxyFor('b32b6e10-ed3c-11ea-8737-9f31b413a913').
      item)).toEqual([TreeConfiguration.getWorkingTree().getProxyFor(
      'Category').item]);
  });

  it('adds Structures', async () => {
    let openComponentsDialogSpy: jasmine.Spy = spyOn(TestBed.get(
      DialogService), 'openComponentsDialog');
    let matDialogRefPlaceholder: MatDialogRef<ComponentDialogComponent> = {
      updateSize: (width: string, height: string) => {
        return matDialogRefPlaceholder;
      },
      afterClosed: () => {
        return of(['Structure',
          { id: 'com.kohese' }]);
      }
    } as MatDialogRef<ComponentDialogComponent>;
    openComponentsDialogSpy.and.returnValue(matDialogRefPlaceholder);
    await typeEditorComponent.add();
    let metatypeInstanceItemProxy: ItemProxy = TreeConfiguration.
      getWorkingTree().getProxyFor('Structure');
    expect(metatypeInstanceItemProxy).toBeDefined();
    expect(metatypeInstanceItemProxy.item.namespace.id).toBe(
      'com.kohese');
  });

  it('removes Structures', async () => {
    typeEditorComponent.selectedType = TreeConfiguration.
      getWorkingTree().getProxyFor('Action').item;
    await typeEditorComponent.delete();
    expect(TreeConfiguration.getWorkingTree().getProxyFor('Action')).
      toBeUndefined();
  });
});
