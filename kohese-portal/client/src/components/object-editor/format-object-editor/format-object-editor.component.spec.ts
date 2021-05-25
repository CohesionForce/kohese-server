import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MaterialModule} from '../../../material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
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
        RouterModule.forRoot([]),
        CommonModule,
        FormsModule,
        BrowserAnimationsModule,
        MaterialModule,
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
        { provide: SessionService, useClass: MockSessionService },
        { provide: APP_BASE_HREF, useValue : '/' } // acts as <head> for routerModule. Describes non-static URL pieces
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

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('provides a function that retrieves text for a table cell', () => {
    expect(component.getTableCellTextRetrievalFunction()(TreeConfiguration.
      getWorkingTree().getProxyFor(component.object[
      'multivaluedGlobalTypeAttribute'][0].id).item, 'globalTypeAttribute')).
      toBe('[object Object]');
  });

  it('retrieves all Namespaces that contain at least one type', () => {
    component.allowKindNarrowingOnly = false;
    expect(component.getNamespaces().length).toBe(3);
    component.allowKindNarrowingOnly = true;
    component.type = TreeConfiguration.getWorkingTree().getProxyFor(
      'Observation').item;
    component.object = TreeConfiguration.getWorkingTree().getProxyFor(
      'ObservationInstance').item;
    expect(component.getNamespaces().length).toBe(1);
  });

  it('retrieves all types in a given Namespace', () => {
    component.allowKindNarrowingOnly = false;
    expect(component.getNamespaceTypes(TreeConfiguration.getWorkingTree().
      getProxyFor('b32b6e10-ed3c-11ea-8737-9f31b413a913').item)).toEqual([
      TreeConfiguration.getWorkingTree().getProxyFor('Category').item]);
    component.allowKindNarrowingOnly = true;
    component.type = TreeConfiguration.getWorkingTree().getProxyFor(
      'Observation').item;
    component.object = TreeConfiguration.getWorkingTree().getProxyFor(
      'ObservationInstance').item;
    expect(component.getNamespaceTypes(TreeConfiguration.getWorkingTree().
      getProxyFor('com.kohese').item)).toEqual([
      TreeConfiguration.getWorkingTree().getProxyFor('Issue').item,
      TreeConfiguration.getWorkingTree().getProxyFor('Observation').item]);
  });

  it('retrieves the Field corresponding to the given attribute name', () => {
    expect(component.getField('globalTypeAttribute', false).propertyDefinition.
      propertyName).toBe('globalTypeAttribute');
    expect(component.getField('multivaluedGlobalTypeAttribute', true).
      propertyDefinition.propertyName).toBe('multivaluedGlobalTypeAttribute');
  });
});
