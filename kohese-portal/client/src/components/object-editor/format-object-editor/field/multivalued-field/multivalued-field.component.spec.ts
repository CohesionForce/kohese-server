import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QueryList } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule, MatDatepickerModule, MatDialogModule,
  MatExpansionModule, MatIconModule, MatInputModule, MatSelectModule,
  MatTooltipModule, MatExpansionPanel} from '@angular/material';
import { MarkdownModule } from 'ngx-markdown';

import { FormatDefinitionType } from '../../../../../../../common/src/FormatDefinition.interface';
import { PropertyDefinition } from '../../../../../../../common/src/PropertyDefinition.interface';
import { TreeConfiguration } from '../../../../../../../common/src/tree-configuration';
import { MockDialogService } from '../../../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../../../mocks/services/MockItemRepository';
import { MockSessionService } from '../../../../../../mocks/services/MockSessionService';
import { DialogService } from '../../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../../../services/user/session.service';
import { MarkdownEditorModule } from '../../../../markdown-editor/markdown-editor.module';
import { TableModule } from '../../../../table/table.module';
import { FormatObjectEditorComponent } from '../../format-object-editor.component';
import { SinglevaluedFieldComponent } from '../singlevalued-field/singlevalued-field.component';
import { MultivaluedFieldComponent } from './multivalued-field.component';
import { TreeViewModule } from '../../../../tree/tree.module';

describe('MultivaluedFieldComponent', () => {
  let component: MultivaluedFieldComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        MultivaluedFieldComponent,
        FormatObjectEditorComponent,
        SinglevaluedFieldComponent
      ],
      imports: [
        FormsModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatInputModule,
        MatDatepickerModule,
        MatIconModule,
        MatSelectModule,
        MatExpansionModule,
        MatDialogModule,
        MarkdownModule,
        TableModule,
        MarkdownEditorModule,
        TreeViewModule
      ],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService },
        { provide: SessionService, useClass: MockSessionService }
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<MultivaluedFieldComponent> =
      TestBed.createComponent(MultivaluedFieldComponent);
    component = componentFixture.componentInstance;

    let treeConfiguration: TreeConfiguration = TestBed.get(ItemRepository).
      getTreeConfig().getValue().config;
    component.koheseObject = treeConfiguration.getProxyFor('KoheseModel').item;
    component.dataModel = component.koheseObject;
    component.viewModel = treeConfiguration.getProxyFor('view-kohesemodel').item;
    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[1].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return ((propertyDefinition.tableDefinition != null) &&
        (propertyDefinition.propertyName ===
        'multivaluedGlobalTypeAttribute'));
    })[0];
    component.formatDefinitionType = FormatDefinitionType.DEFAULT;

    componentFixture.detectChanges();
  });

  it('retrieves elements to display in a table based on the associated ' +
    'PropertyDefinition', () => {
    let propertyDefinitions: Array<PropertyDefinition> = component.viewModel.
      formatDefinitions[component.viewModel.defaultFormatKey[
      FormatDefinitionType.DEFAULT]].containers[0].contents;
    expect(component.getTableElements()).toEqual(component.koheseObject[
      'multivaluedGlobalTypeAttribute'].map((reference: { id: string }) => {
      return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).item;
    }));

    component.propertyDefinition = propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedLocalTypeAttribute');
    })[0];
    expect(component.getTableElements()).toEqual(component.koheseObject[
      'multivaluedLocalTypeAttribute']);
  });

  it('retrieves column identifiers for the associated PropertyDefinition',
    () => {
    let propertyDefinitions: Array<PropertyDefinition> = component.viewModel.
      formatDefinitions[component.viewModel.defaultFormatKey[
      FormatDefinitionType.DEFAULT]].containers[1].contents;
    expect(component.getTableColumns()).toEqual([
      'booleanAttribute',
      'multivaluedBooleanAttribute',
      'numberAttribute',
      'multivaluedNumberAttribute',
      'timeAttribute',
      'multivaluedTimeAttribute',
      'stateAttribute',
      'multivaluedStateAttribute',
      'usernameAttribute',
      'multivaluedUsernameAttribute',
      'stringAttribute',
      'multivaluedStringAttribute',
      'maskedStringAttribute',
      'multivaluedMaskedStringAttribute',
      'markdownAttribute',
      'multivaluedMarkdownAttribute',
      'globalTypeAttribute',
      'multivaluedGlobalTypeAttribute',
      'localTypeAttribute',
      'multivaluedLocalTypeAttribute',
      'enumerationAttribute',
      'multivaluedEnumerationAttribute',
      'variantAttribute',
      'multivaluedVariantAttribute'
    ]);

    component.propertyDefinition = propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedLocalTypeAttribute');
    })[0];
    expect(component.getTableColumns()).toEqual([
      'booleanAttribute',
      'multivaluedBooleanAttribute',
      'numberAttribute',
      'multivaluedNumberAttribute',
      'timeAttribute',
      'multivaluedTimeAttribute',
      'stateAttribute',
      'multivaluedStateAttribute',
      'usernameAttribute',
      'multivaluedUsernameAttribute',
      'stringAttribute',
      'multivaluedStringAttribute',
      'maskedStringAttribute',
      'multivaluedMaskedStringAttribute',
      'markdownAttribute',
      'multivaluedMarkdownAttribute',
      'globalTypeAttribute',
      'multivaluedGlobalTypeAttribute',
      'localTypeAttribute',
      'multivaluedLocalTypeAttribute',
      'enumerationAttribute',
      'multivaluedEnumerationAttribute',
      'variantAttribute',
      'multivaluedVariantAttribute'
    ]);
  });

  it('provides a function that retrieves text for a table cell', () => {
    let textRetrievalFunction: (row: any, columnId: string) => string =
      component.getTableCellTextRetrievalFunction();
    let referencedItem: any = TreeConfiguration.getWorkingTree().getProxyFor(
      component.koheseObject['multivaluedGlobalTypeAttribute'][0].id).item;
    expect(textRetrievalFunction(referencedItem, 'globalTypeAttribute')).toBe(
      'KoheseModel');
    let textLines: Array<string> = textRetrievalFunction(referencedItem,
      'multivaluedGlobalTypeAttribute').split('\n');
    for (let j: number = 0; j < textLines.length; j++) {
      expect(textLines[j].substring(0, 2)).toBe('\u2022 ');
    }
    
    expect(textRetrievalFunction(referencedItem, 'enumerationAttribute').
      substring(0, 2)).not.toBe('\u2022 ');
  });

  it('provides a function via which elements can be added to a multivalued ' +
    'attribute', async () => {
    let elementAdditionFunction: () => Promise<Array<any>> = component.
      getTableElementAdditionFunction();
    expect(await elementAdditionFunction()).toEqual([TreeConfiguration.
      getWorkingTree().getRootProxy().item]);
  });

  it('provides a function via which elements within a multivalued attribute ' +
    'can be moved', () => {
    let moveHandler: (elements: Array<any>, referenceElement: any, moveBefore:
      boolean) => void = component.getTableElementMovementFunction();
    let elements: Array<any> = component.koheseObject[
      'multivaluedGlobalTypeAttribute'].map((reference: { id: string }) => {
      return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).item;
    });
    moveHandler([elements[1]], elements[0], true);
    expect(component.koheseObject['multivaluedGlobalTypeAttribute'][0].id).
      toBe(elements[1].id);
    expect(component.koheseObject['multivaluedGlobalTypeAttribute'][1].id).
      toBe(elements[0].id);
    moveHandler([elements[1]], elements[0], false);
    expect(component.koheseObject['multivaluedGlobalTypeAttribute'][0].id).
      toBe(elements[0].id);
    expect(component.koheseObject['multivaluedGlobalTypeAttribute'][1].id).
      toBe(elements[1].id);
    
    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[1].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedLocalTypeAttribute');
    })[0];
    moveHandler = component.getTableElementMovementFunction();
    elements = [...component.koheseObject['multivaluedLocalTypeAttribute']];
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

  it('provides a function via which elements can be removed from a ' +
    'multivalued attribute', () => {
    let removeHandler: (elements: Array<any>) => void = component.
      getTableElementRemovalFunction();
    let references: Array<{ id: string }> = component.koheseObject[
      'multivaluedGlobalTypeAttribute'];
    let elements: Array<any> = references.map((reference: { id: string }) => {
      return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).item;
    });
    removeHandler([elements[1]]);
    expect(component.koheseObject['multivaluedGlobalTypeAttribute'].indexOf(
      references[1])).toBe(-1);

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[1].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedLocalTypeAttribute');
    })[0];
    removeHandler = component.getTableElementRemovalFunction();
    elements = component.koheseObject['multivaluedLocalTypeAttribute'].slice(
      0);
    removeHandler([elements[1]]);
    expect(component.koheseObject['multivaluedLocalTypeAttribute'].indexOf(
      elements[1])).toBe(-1);
  });

  it('adds a value to a multivalued attribute', () => {
    expect(component.addValue()).toBeUndefined();
  });

  it('retrieves an identifier for a given object and index', () => {
    expect(component.getMultivaluedAttributeValueIdentifier(3, {})).toBe('3');
  });

  it('expands all Kohese Model local type-typed attribute values', () => {
    component.expandAllMultivaluedAttributeExpansionPanels();
    let expansionPanels: Array<MatExpansionPanel> = (component[
      '_multivaluedAttributeExpansionPanelQueryList'] as QueryList<MatExpansionPanel>).
      toArray();
    expect(expansionPanels.filter((expansionPanel: MatExpansionPanel) => {
      return (expansionPanel.expanded === false);
    }).length).toBe(0);
  });

  it('collapses all Kohese Model local type-typed attribute values', () => {
    component.collapseAllMultivaluedAttributeExpansionPanels();
    let expansionPanels: Array<MatExpansionPanel> = (component[
      '_multivaluedAttributeExpansionPanelQueryList'] as QueryList<MatExpansionPanel>).
      toArray();
    expect(expansionPanels.filter((expansionPanel: MatExpansionPanel) => {
      return (expansionPanel.expanded === true);
    }).length).toBe(0);
  });
});
