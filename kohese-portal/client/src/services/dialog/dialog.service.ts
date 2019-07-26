import { Injectable, Component, Inject, TemplateRef } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs';

@Injectable()
export class DialogService {
  constructor(private dialog: MatDialog) {
  }

  openConfirmDialog(title: string, text: string): Observable<any> {
    return this.openCustomTextDialog(title, text, ['Cancel', 'OK']);
  }

  openYesNoDialog(title: string, text: string): Observable<any> {
    return this.openCustomTextDialog(title, text, ['No', 'Yes']);
  }

  openInformationDialog(title: string, text: string): Observable<any> {
    return this.openCustomTextDialog(title, text, ['OK']);
  }

  openCustomTextDialog(title: string, text: string, buttonLabels: Array<string>): Observable<any> {
    return this.dialog.open(DialogComponent, {
      data: {
        title: title,
        text: text,
        buttonLabels: buttonLabels
      },
      disableClose: true
    }).updateSize('40%', 'auto').afterClosed();
  }

  openInputDialog(title: string, text: string, type: string, fieldName: string,
    initialValue: any, validate: (input: any) => boolean):
    MatDialogRef<DialogComponent> {
    if (initialValue == null) {
      initialValue = '';
    }
    return this.dialog.open(DialogComponent, {
      data: {
        title: title,
        text: text,
        inputType: type,
        fieldName: fieldName,
        value: initialValue,
        validate: validate
      },
      disableClose: true
    }).updateSize('40%', 'auto');
  }

  public openSelectDialog(title: string, text: string, label: string,
    initialValue: any, options: Array<any>):
    MatDialogRef<DialogComponent> {
    if (initialValue == null) {
      initialValue = options[0];
    }
    return this.dialog.open(DialogComponent, {
      data: {
        title: title,
        text: text,
        fieldName: label,
        value: initialValue,
        options: options
      },
      disableClose: true
    }).updateSize('40%', 'auto');
  }

  openComponentDialog<T>(component: ComponentType<T> | TemplateRef<T>, config : any): MatDialogRef<T> {
    return this.dialog.open(component, config);
  }
}

@Component({
  templateUrl: 'dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  public static readonly INPUT_TYPES: any = {
    TEXT: 'text',
    MULTILINE_TEXT: 'multilineText',
    MARKDOWN: 'markdown',
    NUMBER: 'number',
    DATE: 'date',
    TIME: 'time'
  };

  get INPUT_TYPES() {
    return DialogComponent.INPUT_TYPES;
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }
}
