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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecurityContext } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule} from '../../../material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

// Other External Dependencies
import { MarkdownModule, MarkdownService, MarkedOptions } from 'ngx-markdown';

// Kohese
import { FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../services/user/session.service';
import { MarkdownEditorModule } from '../../markdown-editor/markdown-editor.module';
import { TableModule } from '../../table/table.module';
import { MultivaluedFieldComponent } from './field/multivalued-field/multivalued-field.component';
import { SinglevaluedFieldComponent } from './field/singlevalued-field/singlevalued-field.component';
import { FormatObjectEditorComponent } from './format-object-editor.component';
import { TreeViewModule } from '../../tree/tree.module';

// Mocks
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockSessionService } from '../../../../mocks/services/MockSessionService';

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
        RouterModule.forRoot([], { relativeLinkResolution: 'legacy' }),
        CommonModule,
        FormsModule,
        BrowserAnimationsModule,
        MaterialModule,
        MarkdownModule.forRoot({
          sanitize: SecurityContext.NONE
        }),
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

    let treeConfiguration: TreeConfiguration = TestBed.inject(ItemRepository).
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
