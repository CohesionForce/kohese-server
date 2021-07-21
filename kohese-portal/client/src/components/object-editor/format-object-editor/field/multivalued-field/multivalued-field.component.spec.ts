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


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QueryList } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../../material.module';
import { MatExpansionPanel } from '@angular/material';
import { MarkdownModule } from 'ngx-markdown';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

import { FormatDefinitionType } from '../../../../../../../common/src/FormatDefinition.interface';
import { PropertyDefinition } from '../../../../../../../common/src/PropertyDefinition.interface';
import { TreeConfiguration } from '../../../../../../../common/src/tree-configuration';
import { KoheseModel } from '../../../../../../../common/src/KoheseModel';
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
import { DirectivesModule } from '../../../../../directives/directives.module'

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
        RouterModule.forRoot([]),
        FormsModule,
        MaterialModule,
        MarkdownModule,
        TableModule,
        MarkdownEditorModule,
        TreeViewModule,
        DirectivesModule
      ],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService },
        { provide: SessionService, useClass: MockSessionService },
        { provide: APP_BASE_HREF, useValue : '/' } // acts as <head> for routerModule. Describes non-static URL pieces
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<MultivaluedFieldComponent> =
      TestBed.createComponent(MultivaluedFieldComponent);
    component = componentFixture.componentInstance;

    let treeConfiguration: TreeConfiguration = TestBed.inject(ItemRepository).
      getTreeConfig().getValue().config;
    let modelProxy : KoheseModel = TreeConfiguration.getWorkingTree().getModelProxyFor('KoheseModel');
    component.koheseObject = modelProxy.item;
    component.dataModel = component.koheseObject;
    component.viewModel = modelProxy.view.item;
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

  afterEach(() => {
    TestBed.resetTestingModule();
  })

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
      'multivaluedGlobalTypeAttribute'].slice(0);
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

  it('determines whether a drop on this instance of ' +
    'MultivaluedFieldComponent should be allowed', () => {
    let dataTransfer: DataTransfer = new DataTransfer();
    dataTransfer.setData('MultivaluedFieldComponent/' + component.
      propertyDefinition.propertyName + '/Index', '' + 0);
    let dragOverEventPlaceholder: any = {
      dataTransfer: dataTransfer,
      currentTarget: document.createElement('div'),
      preventDefault: () => {}
    };
    let preventDefaultSpy: jasmine.Spy = spyOn(dragOverEventPlaceholder,
      'preventDefault');
    component.draggedOver(dragOverEventPlaceholder);
    expect(preventDefaultSpy).toHaveBeenCalled();

    let dataModel: any = TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseModel').item;
    component.koheseObject = dataModel['multivaluedVariantAttribute'][1];
    component.dataModel = dataModel.localTypes['Variant'];
    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[1].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return ((propertyDefinition.tableDefinition != null) &&
        (propertyDefinition.propertyName ===
        'multivaluedVariantAttribute'));
    })[0];
    dataTransfer.clearData();
    dataTransfer.setData('MultivaluedFieldComponent/' + component.koheseObject[
      'discriminant'] + '/Index', '' + 0);
    preventDefaultSpy.calls.reset();
    component.draggedOver(dragOverEventPlaceholder);
    expect(preventDefaultSpy).toHaveBeenCalled();

    dataTransfer.clearData();
    preventDefaultSpy.calls.reset();
    component.draggedOver(dragOverEventPlaceholder);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('moves values', () => {
    let values: Array<any> = component.koheseObject[component.
      propertyDefinition.propertyName].slice(0);
    component.moveValue(2, 0, true);
    expect(component.koheseObject[component.propertyDefinition.propertyName]).
      toEqual([values[2], values[0], values[1]]);

    component.moveValue(2, 0, false);
    expect(component.koheseObject[component.propertyDefinition.propertyName]).
      toEqual([values[2], values[1], values[0]]);

    let dataModel: any = TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseModel').item;
    component.koheseObject = dataModel['multivaluedVariantAttribute'][1];
    values = component.koheseObject['value'].slice(0);
    component.dataModel = dataModel.localTypes['Variant'];
    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[1].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return ((propertyDefinition.tableDefinition != null) &&
        (propertyDefinition.propertyName ===
        'multivaluedVariantAttribute'));
    })[0];
    component.moveValue(2, 0, true);
    expect(component.koheseObject['value']).toEqual([values[2], values[0],
      values[1]]);
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
