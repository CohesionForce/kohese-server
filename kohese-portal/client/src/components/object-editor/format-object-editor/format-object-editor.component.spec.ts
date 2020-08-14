import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule, MatDatepickerModule, MatDialogModule,
  MatExpansionModule, MatIconModule, MatInputModule, MatSelectModule,
  MatTooltipModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MarkdownModule, MarkdownService, MarkedOptions } from 'ngx-markdown';

import { FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockSessionService } from '../../../../mocks/services/MockSessionService';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../services/user/session.service';
import { MarkdownEditorModule } from '../../markdown-editor/markdown-editor.module';
import { TableModule } from '../../table/table.module';
import { MultivaluedFieldComponent } from './field/multivalued-field/multivalued-field.component';
import { SinglevaluedFieldComponent } from './field/singlevalued-field/singlevalued-field.component';
import { FormatObjectEditorComponent } from './format-object-editor.component';
import { TreeViewModule } from '../../tree/tree.module';
import { TreeComponentConfiguration } from '../../tree/tree.component';

describe('FormatObjectEditorComponent', () => {
  let component: FormatObjectEditorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        FormatObjectEditorComponent,
        MultivaluedFieldComponent,
        SinglevaluedFieldComponent
      ],
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
        MarkdownEditorModule,
        TreeViewModule
      ],
      providers: [
        MarkdownService,
        MarkedOptions,
        { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: SessionService, useClass: MockSessionService }
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

  it('provides a function that retrieves text for a table cell', () => {
    expect(component.getTableCellTextRetrievalFunction()(TreeConfiguration.
      getWorkingTree().getProxyFor(component.object[
      'multivaluedGlobalTypeAttribute'][0].id).item, 'globalTypeAttribute')).
      toBe('[object Object]');
  });

  it('provides a Tree component configuration function based on the given ' +
    'TreeComponentConfiguration', () => {
    expect(component.getTreeComponentConfiguration(TreeComponentConfiguration.
      GET_CHILDREN)(component.type)).toEqual([]);
    expect(component.getTreeComponentConfiguration(TreeComponentConfiguration.
      HAS_CHILDREN)(component.type)).toBe(false);
    expect(component.getTreeComponentConfiguration(TreeComponentConfiguration.
      GET_TEXT)(component.type)).toBe('KoheseModel');
    expect(component.getTreeComponentConfiguration(TreeComponentConfiguration.
      GET_ICON)(component.type)).toBe('fa fa-sitemap');
    let maySelectHandler: Function = component.getTreeComponentConfiguration(
      TreeComponentConfiguration.MAY_SELECT);
    expect(maySelectHandler(component.type)).toBe(true);
    expect(maySelectHandler(TreeConfiguration.getWorkingTree().getProxyFor(
      '750c7c00-d658-11ea-80c8-3b7d496d4ca3').item)).toBe(false);
    component.allowKindNarrowingOnly = true;
    expect(maySelectHandler(TreeConfiguration.getWorkingTree().getProxyFor(
      'Item').item)).toBe(false);
    component.getTreeComponentConfiguration(TreeComponentConfiguration.
      ELEMENT_SELECTION_HANDLER)(component.type);
    expect(component.selectedType).toBe(component.type);
  });
});
