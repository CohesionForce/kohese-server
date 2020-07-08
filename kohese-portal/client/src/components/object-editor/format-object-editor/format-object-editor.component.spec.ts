import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatSelectModule, MatIconModule, MatTooltipModule, MatCheckboxModule,
  MatInputModule, MatDatepickerModule, MatExpansionModule,
  MatDialogModule } from '@angular/material';
import { MarkdownModule, MarkdownService, MarkedOptions } from 'ngx-markdown';

import { TableModule } from '../../table/table.module';
import { MarkdownEditorModule } from '../../markdown-editor/markdown-editor.module';
import { FormatObjectEditorComponent } from './format-object-editor.component';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { PropertyDefinition } from '../../../../../common/src/PropertyDefinition.interface';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';

describe('FormatObjectEditorComponent', () => {
  let component: FormatObjectEditorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormatObjectEditorComponent],
      imports: [
        CommonModule,
        FormsModule,
        BrowserAnimationsModule,
        MatSelectModule,
        MatIconModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatInputModule,
        MatDatepickerModule,
        MatExpansionModule,
        MatDialogModule,
        MarkdownModule,
        TableModule,
        MarkdownEditorModule
      ],
      providers: [
        MarkdownService,
        MarkedOptions,
        { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository }
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<FormatObjectEditorComponent> =
      TestBed.createComponent(FormatObjectEditorComponent);
    component = componentFixture.componentInstance;

    let treeConfiguration: TreeConfiguration = TestBed.get(ItemRepository).
      getTreeConfig().getValue().config;
    component.object = treeConfiguration.getProxyFor('KoheseModel').item;
    component.formatDefinitionType = FormatDefinitionType.DEFAULT;
    component.type = component.object;

    componentFixture.detectChanges();
  });

  it('retrieves elements to display in a table based on the given ' +
    'PropertyDefinition', () => {
    let propertyDefinitions: Array<PropertyDefinition> = component.viewModel.
      formatDefinitions[component.viewModel.defaultFormatKey[
      FormatDefinitionType.DEFAULT]].containers[0].contents;
    expect(component.getTableElements(propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedGlobalTypeAttribute');
    })[0])).toEqual(component.object['multivaluedGlobalTypeAttribute'].map(
      (reference: { id: string }) => {
      return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).item;
    }));
    expect(component.getTableElements(propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedLocalTypeAttribute');
    })[0])).toEqual(component.object['multivaluedLocalTypeAttribute']);
  });

  it('retrieves column identifiers for a given PropertyDefinition', () => {
    let propertyDefinitions: Array<PropertyDefinition> = component.viewModel.
      formatDefinitions[component.viewModel.defaultFormatKey[
      FormatDefinitionType.DEFAULT]].containers[1].contents;
    expect(component.getTableColumns(propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedGlobalTypeAttribute');
    })[0])).toEqual([
      'globalTypeAttribute',
      'multivaluedGlobalTypeAttribute',
      'localTypeAttribute',
      'multivaluedLocalTypeAttribute',
      'enumerationAttribute',
      'multivaluedEnumerationAttribute'
    ]);
    expect(component.getTableColumns(propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedLocalTypeAttribute');
    })[0])).toEqual([
      'globalTypeAttribute',
      'multivaluedGlobalTypeAttribute',
      'localTypeAttribute',
      'multivaluedLocalTypeAttribute',
      'enumerationAttribute',
      'multivaluedEnumerationAttribute'
    ]);
  });

  it('handles moving elements in tables', () => {
    let moveHandler: (elements: Array<any>, referenceElement: any, moveBefore:
      boolean) => void = component.getTableElementMovementFunction(component.
      viewModel.formatDefinitions[component.viewModel.defaultFormatKey[
      FormatDefinitionType.DEFAULT]].containers[1].contents.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedGlobalTypeAttribute');
    })[0]);
    let elements: Array<any> = component.object[
      'multivaluedGlobalTypeAttribute'].map((reference: { id: string }) => {
      return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).item;
    });
    moveHandler([elements[1]], elements[0], true);
    expect(component.object['multivaluedGlobalTypeAttribute'][0].id).toBe(
      elements[1].id);
    expect(component.object['multivaluedGlobalTypeAttribute'][1].id).toBe(
      elements[0].id);
    moveHandler([elements[1]], elements[0], false);
    expect(component.object['multivaluedGlobalTypeAttribute'][0].id).toBe(
      elements[0].id);
    expect(component.object['multivaluedGlobalTypeAttribute'][1].id).toBe(
      elements[1].id);
    
    moveHandler = component.getTableElementMovementFunction(component.
      viewModel.formatDefinitions[component.viewModel.defaultFormatKey[
      FormatDefinitionType.DEFAULT]].containers[1].contents.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedLocalTypeAttribute');
    })[0]);
    elements = [...component.object['multivaluedLocalTypeAttribute']];
    moveHandler([elements[1]], elements[0], true);
    // expect(component.object['multivaluedLocalTypeAttribute'][0]).toBe(elements[
    //   1]);
    // expect(component.object['multivaluedLocalTypeAttribute'][1]).toBe(elements[
    //   0]);
    moveHandler([elements[0]], elements[1], false);
    // expect(component.object['multivaluedLocalTypeAttribute'][0]).toBe(elements[
    //   0]);
    // expect(component.object['multivaluedLocalTypeAttribute'][1]).toBe(elements[
    //   1]);
  });

  it('handles removing elements from tables', () => {
    let removeHandler: (elements: Array<any>) => void = component.
      getTableElementRemovalFunction(component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[1].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedGlobalTypeAttribute');
    })[0]);
    let references: Array<{ id: string }> = component.object[
      'multivaluedGlobalTypeAttribute'];
    let elements: Array<any> = references.map((reference: { id: string }) => {
      return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).item;
    });
    removeHandler([elements[1]]);
    expect(component.object['multivaluedGlobalTypeAttribute'].indexOf(
      references[1])).toBe(-1);

    removeHandler = component.getTableElementRemovalFunction(component.
      viewModel.formatDefinitions[component.viewModel.defaultFormatKey[
      FormatDefinitionType.DEFAULT]].containers[1].contents.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedLocalTypeAttribute');
    })[0]);
    elements = component.object['multivaluedLocalTypeAttribute'].slice(0);
    removeHandler([elements[1]]);
    expect(component.object['multivaluedLocalTypeAttribute'].indexOf(elements[
      1])).toBe(-1);
  });

  it('determines whether a given PropertyDefinition corresponds to an ' +
    'enumeration attribute', () => {
    let propertyDefinitions: Array<PropertyDefinition> = component.viewModel.
      formatDefinitions[component.viewModel.defaultFormatKey[
      FormatDefinitionType.DEFAULT]].containers[0].contents;
    expect(component.isEnumerationAttribute(propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'enumerationAttribute');
    })[0])).toBe(true);
  });

  it('retrieves the representation of a given EnumerationValue', () => {
    expect(component.getEnumerationValueRepresentation(component.viewModel.
      formatDefinitions[component.viewModel.defaultFormatKey[
      FormatDefinitionType.DEFAULT]].containers[0].contents.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'enumerationAttribute');
    })[0], component.selectedType.localTypes['Enumeration'].values[0])).toBe(
      'Enumeration Value 1');
  });
});
