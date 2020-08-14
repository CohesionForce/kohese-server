import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule, MatDatepickerModule, MatInputModule,
  MatSelectModule } from '@angular/material';

import { MarkdownEditorModule } from '../../markdown-editor/markdown-editor.module';
import { InputDialogComponent, InputDialogKind } from './input-dialog.component';

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
