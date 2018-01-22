import { Injectable, Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DialogService {
  constructor(private dialog: MatDialog) {
  }
  
  openConfirmDialog(title: string, text: string): Observable<any> {
    return this.openCustomDialog(title, text, ['Cancel', 'OK']);
  }
  
  openYesNoDialog(title: string, text: string): Observable<any> {
    return this.openCustomDialog(title, text, ['No', 'Yes']);
  }
  
  openInformationDialog(title: string, text: string): Observable<any> {
    return this.openCustomDialog(title, text, ['OK']);
  }
  
  openCustomDialog(title: string, text: string, buttonLabels: Array<string>): Observable<any> {
    return this.dialog.open(DialogComponent, {
      data: {
        title: title,
        text: text,
        buttonLabels: buttonLabels
      }
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