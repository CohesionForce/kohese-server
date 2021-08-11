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

import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../../../material.module';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

// Other External Dependencies
import { MarkdownModule } from 'ngx-markdown';

// Kohese
import { MarkdownEditorModule } from '../../../../../components/markdown-editor/markdown-editor.module';
import { KoheseModel } from '../../../../../../../common/src/KoheseModel';
import { KoheseViewModel } from '../../../../../../../common/src/KoheseModel.interface';
import { FormatDefinitionType } from '../../../../../../../common/src/FormatDefinition.interface';
import { PropertyDefinition } from '../../../../../../../common/src/PropertyDefinition.interface';
import { TreeConfiguration } from '../../../../../../../common/src/tree-configuration';
import { DialogService } from '../../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../../../services/user/session.service';
import { FormatObjectEditorComponent } from '../../format-object-editor.component';
import { MultivaluedFieldComponent } from '../multivalued-field/multivalued-field.component';
import { SinglevaluedFieldComponent } from './singlevalued-field.component';
import { TableModule } from '../../../../../components/table/table.module';
import { TreeViewModule } from '../../../../tree/tree.module';

// Mocks
import { MockDialogService } from '../../../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../../../mocks/services/MockItemRepository';
import { MockSessionService } from '../../../../../../mocks/services/MockSessionService';
import { SecurityContext } from '@angular/core';

describe('SinglevaluedFieldComponent', () => {
  let component: SinglevaluedFieldComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        SinglevaluedFieldComponent,
        FormatObjectEditorComponent,
        MultivaluedFieldComponent
      ],
      imports: [
        RouterModule.forRoot([]),
        FormsModule,
        BrowserAnimationsModule,
        MaterialModule,
        MarkdownModule.forRoot({
          sanitize: SecurityContext.NONE
        }),
        MarkdownEditorModule,
        TableModule,
        TreeViewModule
      ],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService },
        { provide: SessionService, useClass: MockSessionService },
        { provide: APP_BASE_HREF, useValue : '/' } // acts as <head> for routerModule. Describes non-static URL pieces
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<SinglevaluedFieldComponent> =
      TestBed.createComponent(SinglevaluedFieldComponent);
    component = componentFixture.componentInstance;

    let treeConfiguration: TreeConfiguration = TestBed.inject(ItemRepository).
      getTreeConfig().getValue().config;
    let modelProxy : KoheseModel = TreeConfiguration.getWorkingTree().getModelProxyFor('KoheseModel');
    component.koheseObject = modelProxy.item;
    component.dataModel = component.koheseObject;
    component.viewModel = modelProxy.view.item;
    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      header.contents[0];
    component.formatDefinitionType = FormatDefinitionType.DEFAULT;

    componentFixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('retrieves a string representation of the associated attribute', () => {
    expect(component.getAttributeRepresentation()).toBe('Name*');

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'description');
    })[0];
    expect(component.getAttributeRepresentation()).toBe('Description');
  });

  it('retrieves a string representation of a given Date', () => {
    expect(component.getDateString(0)).toBe('1970-01-01T00:00:00.000Z');
    expect(component.getDateString(null)).toBeUndefined();
  });

  it('retrieves candidate state transitions for the associated attribute',
    () => {
    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'stateAttribute');
    })[0];
    expect(component.getStateTransitionCandidates()).toEqual(['FirstToSecond',
      'FirstToThird']);
  });

  it('determines if the associated PropertyDefinition corresponds to a ' +
    'local type-typed attribute', () => {
    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'localTypeAttribute');
    })[0];
    expect(component.isLocalTypeAttribute()).toBe(true);

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'enumerationAttribute');
    })[0];
    expect(component.isLocalTypeAttribute()).toBe(true);

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'variantAttribute');
    })[0];
    expect(component.isLocalTypeAttribute()).toBe(true);

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'globalTypeAttribute');
    })[0];
    expect(component.isLocalTypeAttribute()).toBe(false);
  });

  it('allows selection of global type references', async () => {
    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'globalTypeAttribute');
    })[0];
    await component.openObjectSelector(undefined);
    expect(component.koheseObject[component.propertyDefinition.propertyName].
      id).toBe(TreeConfiguration.getWorkingTree().getRootProxy().item.id);

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'parentId');
    })[0];
    await component.openObjectSelector(undefined);
    expect(component.koheseObject[component.propertyDefinition.propertyName]).
      toBe(TreeConfiguration.getWorkingTree().getRootProxy().item.id);

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedGlobalTypeAttribute');
    })[0];
    await component.openObjectSelector(undefined);
    expect(component.koheseObject[component.propertyDefinition.propertyName][
      0].id).toBe(TreeConfiguration.getWorkingTree().getRootProxy().item.id);

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName ===
        'multivaluedGlobalTypeAttribute');
    })[0];
    await component.openObjectSelector(1);
    expect(component.koheseObject[component.propertyDefinition.propertyName][
      1].id).toBe(TreeConfiguration.getWorkingTree().getRootProxy().item.id);
  });

  it('provides a default value for the attribute corresponding to the ' +
    'associated PropertyDefinition', () => {
    Date.prototype.getTime = () => { return -1; };

    // Default value
    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'stateAttribute');
    })[0];
    expect(component.getDefaultValue()).toBe('First');

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'booleanAttribute');
    })[0];
    expect(component.getDefaultValue()).toBe(false);

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'numberAttribute');
    })[0];
    expect(component.getDefaultValue()).toBe(0);

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'timeAttribute');
    })[0];
    expect(component.getDefaultValue()).toBe(-1);

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'usernameAttribute');
    })[0];
    expect(component.getDefaultValue()).toBe('admin');

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'stringAttribute');
    })[0];
    expect(component.getDefaultValue()).toBe('');

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'maskedStringAttribute');
    })[0];
    expect(component.getDefaultValue()).toBe('');

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'markdownAttribute');
    })[0];
    expect(component.getDefaultValue()).toBe('');

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'globalTypeAttribute');
    })[0];
    expect(component.getDefaultValue()).toBeUndefined();

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'localTypeAttribute');
    })[0];
    expect(component.getDefaultValue()).toEqual({
      booleanAttribute: false,
      multivaluedBooleanAttribute: [],
      numberAttribute: 0,
      multivaluedNumberAttribute: [],
      timeAttribute: -1,
      multivaluedTimeAttribute: [],
      stateAttribute: 'First',
      multivaluedStateAttribute: ['First', 'First'],
      usernameAttribute: 'admin',
      multivaluedUsernameAttribute: [],
      stringAttribute: '',
      multivaluedStringAttribute: [],
      maskedStringAttribute: '',
      multivaluedMaskedStringAttribute: [],
      markdownAttribute: '',
      multivaluedMarkdownAttribute: [],
      globalTypeAttribute: null,
      multivaluedGlobalTypeAttribute: [],
      localTypeAttribute: null,
      multivaluedLocalTypeAttribute: [],
      enumerationAttribute: null,
      multivaluedEnumerationAttribute: [],
      variantAttribute: { discriminant: 'booleanAttribute', value: null },
      multivaluedVariantAttribute: []
    });

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'enumerationAttribute');
    })[0];
    expect(component.getDefaultValue()).toBeNull();

    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'variantAttribute');
    })[0];
    expect(component.getDefaultValue()).toEqual(
      { discriminant: 'booleanAttribute', value: null });
  });

  it('determines whether two Variant references are equal', () => {
    expect(component.areVariantDiscriminantsEqual(
      { discriminant: '', value: null },
      { discriminant: '', value: ''})).toBe(true);
  });

  it('retrieves the data model for the local type-typed attribute ' +
    'corresponding to the associated PropertyDefinition', () => {
    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'localTypeAttribute');
    })[0];
    expect(component.getLocalTypeDataModel()).toBe(component.dataModel.
      localTypes['Local Type']);
  });

  it('retrieves the view model for the local type-typed attribute ' +
    'corresponding to the associated PropertyDefinition', () => {
    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'localTypeAttribute');
    })[0];
    expect(component.getLocalTypeViewModel()).toBe(component.viewModel.
      localTypes['Local Type']);
  });

  it('retrieves the PropertyDefinition corresponding to a Variant member',
    () => {
    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'variantAttribute');
    })[0];
    component.formatDefinitionType = FormatDefinitionType.DOCUMENT;
    expect(component.getVariantPropertyDefinition('booleanAttribute')).toBe(
      (component.viewModel.localTypes['Variant'] as KoheseViewModel).
      formatDefinitions[(component.viewModel.localTypes[
      'Variant'] as KoheseViewModel).defaultFormatKey[FormatDefinitionType.
      DEFAULT]].containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'booleanAttribute');
    })[0]);
  });
});
