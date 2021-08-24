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
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

// Kohese
import { FormatDefinitionEditorComponent } from './format-definition-editor.component';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { PropertyDefinition } from '../../../../../common/src/PropertyDefinition.interface';
import { Attribute } from '../../../../../common/src/Attribute.interface';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { KoheseModel } from '../../../../../common/src/KoheseModel';

// Mocks
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';

describe('FormatDefinitionEditorComponent', () => {
  let component: FormatDefinitionEditorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormatDefinitionEditorComponent],
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MatSelectModule,
        MatInputModule,
        MatCheckboxModule,
        MatIconModule,
        MatExpansionModule
      ],
      providers: [{ provide: ItemRepository, useClass: MockItemRepository }]
    }).compileComponents();

    let componentFixture: ComponentFixture<FormatDefinitionEditorComponent> =
      TestBed.createComponent(FormatDefinitionEditorComponent);
    component = componentFixture.componentInstance;
    let treeConfiguration: TreeConfiguration = TestBed.inject(ItemRepository).
      getTreeConfig().getValue().config;
    let modelProxy : KoheseModel = TreeConfiguration.getWorkingTree().getModelProxyFor('KoheseModel');
    component.dataModel = modelProxy.item;
    component.viewModel = modelProxy.view.item;
    component.formatDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]];
    component.attributes = Object.values(component.dataModel.classProperties).
      map((classPropertiesEntry: { definedInKind: string, definition:
      Attribute }) => {
      return classPropertiesEntry.definition;
    });

    componentFixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('retrieves display options', () => {
    let propertyDefinitions: Array<PropertyDefinition> = component.
      formatDefinition.containers[0].contents;
    expect(component.getUserInterfaceTypes(propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'enumerationAttribute');
    })[0])).toEqual(['Dropdown']);
    expect(component.getUserInterfaceTypes(propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'id');
    })[0])).toEqual(['Text', 'Markdown', 'Masked String']);
    expect(component.getUserInterfaceTypes(propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'modifiedOn');
    })[0])).toEqual(['Date']);
  });

  it('retrieves the appropriate display option identifier for a given ' +
    'display option', () => {
    let propertyDefinitions: Array<PropertyDefinition> = component.
      formatDefinition.containers[0].contents;
    expect(component.getUserInterfaceTypeValue(propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'enumerationAttribute');
    })[0], 'Dropdown')).toBe('');
    expect(component.getUserInterfaceTypeValue(propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'id');
    })[0], 'Masked String')).toBe('maskedString');
    expect(component.getUserInterfaceTypeValue(propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'modifiedOn');
    })[0], 'Date')).toBe('date');
  });
});
