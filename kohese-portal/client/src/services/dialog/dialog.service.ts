import { Injectable, Component, Inject, TemplateRef } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs/Observable';

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
      }
    }).afterClosed();
  }
  
  openInputDialog(title: string, text: string, type: string, fieldName: string,
    initialValue: string): MatDialogRef<DialogComponent> {
    if (!initialValue) {
      initialValue = '';
    }
    return this.dialog.open(DialogComponent, {
      data: {
        title: title,
        text: text,
        inputType: type,
        fieldName: fieldName,
        value: initialValue
      }
    });
  }
  
  public openSelectDialog(title: string, text: string, label: string,
    initialValue: string, options: Array<string>):
    MatDialogRef<DialogComponent> {
    if (!initialValue) {
      initialValue = '';
    }
    return this.dialog.open(DialogComponent, {
      data: {
        title: title,
        text: text,
        fieldName: label,
        value: initialValue,
        options: options
      }
    });
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
    DATE: 'date',
    TIME: 'time'
  };
  
  get INPUT_TYPES() {
    return DialogComponent.INPUT_TYPES;
  }
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }
}
