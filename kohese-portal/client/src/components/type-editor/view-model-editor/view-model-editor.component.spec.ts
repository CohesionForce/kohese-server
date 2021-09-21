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
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

// Kohese
import { ObjectEditorModule } from '../../object-editor/object-editor.module';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { KoheseModel } from '../../../../../common/src/KoheseModel';
import { ViewModelEditorComponent } from './view-model-editor.component';
import { TableEditorComponent } from '../format-editor/table-editor/table-editor.component';

// Mocks
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';

describe('ViewModelEditorComponent', () => {
  let component: ViewModelEditorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ViewModelEditorComponent,
        TableEditorComponent
      ],
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MatTooltipModule,
        MatIconModule,
        MatExpansionModule,
        MatInputModule,
        MatBadgeModule,
        MatTableModule,
        MatSelectModule,
        MatDividerModule,
        MatListModule,
        ObjectEditorModule
      ],
      providers: [
        { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository }
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<ViewModelEditorComponent> = TestBed.
      createComponent(ViewModelEditorComponent);
    component = componentFixture.componentInstance;

    let treeConfiguration: TreeConfiguration = TestBed.inject(ItemRepository).
      getTreeConfig().getValue().config;
    let koheseModelProxy : KoheseModel = TreeConfiguration.getWorkingTree().getModelProxyFor('KoheseModel');
    component.dataModel = koheseModelProxy.item;
    component.viewModel = koheseModelProxy.view.item;

    componentFixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('retrieves an identifier for a given EnumerationValue at the given ' +
    'index', () => {
    expect(component.getEnumerationValueIdentifier(3,
      { name: 'EnumerationValue', description: '' })).toBe('3');
  });
});
