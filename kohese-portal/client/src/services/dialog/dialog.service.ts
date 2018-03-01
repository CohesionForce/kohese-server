import { Injectable, Component, Inject, TemplateRef } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DialogService {
  public readonly INPUT_TYPES: any = {
    TEXT: 'text',
    DATE: 'date',
    TIME: 'time'
  };
  public inputtedValue: string;
  
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
  
  openInputDialog(title: string, text: string, type: string, fieldName: string): MatDialogRef<DialogComponent> {
    return this.dialog.open(DialogComponent, {
      data: {
        title: title,
        text: text,
        inputType: type,
        fieldName: fieldName
      }
    });
  }

  openComponentDialog<T>(component: ComponentType<T> | TemplateRef<T>, data: any): MatDialogRef<T> {
    return this.dialog.open(component, {
      data: data
    });
  }
}

@Component({
  templateUrl: 'dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }
}
