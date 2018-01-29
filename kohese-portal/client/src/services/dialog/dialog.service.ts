import { Injectable, Component, Inject, TemplateRef } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
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
  
  openComponentDialog<T>(component: ComponentType<T> | TemplateRef<T>, data: any): Observable<any> {
    return this.dialog.open(component, {
      data: data
    }).afterClosed();
  }
}

@Component({
  templateUrl: 'dialog.component.html'
})
export class DialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
  }
}