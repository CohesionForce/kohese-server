import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule, MatDatepickerModule, MatDialogModule,
  MatExpansionModule, MatIconModule, MatInputModule, MatSelectModule,
  MatTooltipModule } from '@angular/material';
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
        MarkdownEditorModule
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

  it('retrieves elements to display in a table based on the given ' +
    'PropertyDefinition', () => {
    let propertyDefinitions: Array<PropertyDefinition> = component.viewModel.
      formatDefinitions[component.viewModel.defaultFormatKey[
      FormatDefinitionType.DEFAULT]].containers[0].contents;
    expect(component.getTableElements(propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedGlobalTypeAttribute');
    })[0].propertyName)).toEqual(component.koheseObject[
      'multivaluedGlobalTypeAttribute'].map((reference: { id: string }) => {
      return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).item;
    }));
    expect(component.getTableElements(propertyDefinitions.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedLocalTypeAttribute');
    })[0].propertyName)).toEqual(component.koheseObject[
      'multivaluedLocalTypeAttribute']);
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
    })[0].propertyName);
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
    
    moveHandler = component.getTableElementMovementFunction(component.
      viewModel.formatDefinitions[component.viewModel.defaultFormatKey[
      FormatDefinitionType.DEFAULT]].containers[1].contents.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedLocalTypeAttribute');
    })[0].propertyName);
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

  it('handles removing elements from tables', () => {
    let removeHandler: (elements: Array<any>) => void = component.
      getTableElementRemovalFunction(component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[1].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedGlobalTypeAttribute');
    })[0].propertyName);
    let references: Array<{ id: string }> = component.koheseObject[
      'multivaluedGlobalTypeAttribute'];
    let elements: Array<any> = references.map((reference: { id: string }) => {
      return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).item;
    });
    removeHandler([elements[1]]);
    expect(component.koheseObject['multivaluedGlobalTypeAttribute'].indexOf(
      references[1])).toBe(-1);

    removeHandler = component.getTableElementRemovalFunction(component.
      viewModel.formatDefinitions[component.viewModel.defaultFormatKey[
      FormatDefinitionType.DEFAULT]].containers[1].contents.filter(
      (propertyDefinition: PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedLocalTypeAttribute');
    })[0].propertyName);
    elements = component.koheseObject['multivaluedLocalTypeAttribute'].slice(
      0);
    removeHandler([elements[1]]);
    expect(component.koheseObject['multivaluedLocalTypeAttribute'].indexOf(
      elements[1])).toBe(-1);
  });
});
