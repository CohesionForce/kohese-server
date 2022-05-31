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


import { FormatModule } from './format-editor/format.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeEditorComponent } from './type-editor.component';
import { AttributeEditorComponent } from './attribute-editor/attribute-editor.component';
import { DataModelEditorComponent } from './data-model-editor/data-model-editor.component';
import { ViewModelEditorComponent } from './view-model-editor/view-model-editor.component';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { StateMachineEditorModule } from '../state-machine-editor/state-machine-editor.module';
import { ObjectEditorModule } from '../object-editor/object-editor.module';

import { AngularSplitModule } from 'angular-split';
import { TreeViewModule } from '../tree/tree.module';

@NgModule({
    declarations: [
        TypeEditorComponent,
        AttributeEditorComponent,
        DataModelEditorComponent,
        ViewModelEditorComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        PipesModule,
        AngularSplitModule,
        StateMachineEditorModule,
        FormatModule,
        ObjectEditorModule,
        TreeViewModule
    ]
})
export class TypeEditorModule {
}
