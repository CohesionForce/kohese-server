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

fdescribe('FormatObjectEditorComponent', () => {
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
    component.object['enumerationAttribute'] = 'EnumerationValue';
    component.formatDefinitionType = FormatDefinitionType.DEFAULT;
    component.type = component.object;

    componentFixture.detectChanges();
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
      'Enumeration Value');
  });
});
