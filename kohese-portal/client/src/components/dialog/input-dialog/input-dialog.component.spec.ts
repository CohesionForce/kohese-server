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
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

// Kohese
import { MarkdownEditorModule } from '../../markdown-editor/markdown-editor.module';
import { InputDialogComponent, InputDialogKind } from './input-dialog.component';

// Mocks

describe('InputDialogComponent', () => {
  let component: InputDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InputDialogComponent],
      imports: [
        FormsModule,
        MatCheckboxModule,
        MatInputModule,
        MatDatepickerModule,
        MatSelectModule,
        MarkdownEditorModule
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<InputDialogComponent> = TestBed.
      createComponent(InputDialogComponent);
    component = componentFixture.componentInstance;
    component.inputDialogConfiguration = {
      title: 'Title',
      text: 'Text',
      fieldName: 'Field Name',
      value: true,
      validate: (value: any) => {
        return (value === true);
      }
    };
    component.inputDialogConfiguration['inputDialogKind'] = InputDialogKind.
      BOOLEAN;

    componentFixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('validates input', () => {
    expect(component.isValid()).toBe(true);

    component.inputDialogConfiguration.validate = null;
    expect(component.isValid()).toBe(true);
  });

  it('provides the inputted value', () => {
    expect(component.close(true)).toBe(true);
    expect(component.close(false)).toBeUndefined();
  });

  it('determines if two dropdown options are equal', () => {
    delete component.inputDialogConfiguration['inputDialogKind'];
    component.inputDialogConfiguration['options'] = {
      'Option 1': true,
      'Option 2': false
    };

    expect(component.areOptionsEqual(null, null)).toBe(true);
    expect(component.areOptionsEqual(true, null)).toBe(false);
    expect(component.areOptionsEqual(true, true)).toBe(true);
  });
});
