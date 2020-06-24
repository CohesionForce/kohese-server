import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule, MatInputModule, MatCheckboxModule, MatIconModule,
  MatExpansionModule } from '@angular/material';

import { FormatDefinitionEditorComponent } from './format-definition-editor.component';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { PropertyDefinition } from '../../../../../common/src/PropertyDefinition.interface';
import { Attribute } from '../../../../../common/src/Attribute.interface';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

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
    let treeConfiguration: TreeConfiguration = TestBed.get(ItemRepository).
      getTreeConfig().getValue().config;
    component.dataModel = treeConfiguration.getProxyFor('KoheseModel').item;
    component.viewModel = treeConfiguration.getProxyFor('view-kohesemodel').
      item;
    component.formatDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]];
    component.attributes = Object.values(component.dataModel.classProperties).
      map((classPropertiesEntry: { definedInKind: string, definition:
      Attribute }) => {
      return classPropertiesEntry.definition;
    });

    componentFixture.detectChanges();
  });

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