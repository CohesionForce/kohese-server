import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  Input } from '@angular/core';

import { Dialog } from '../Dialog.interface';

@Component({
  templateUrl: './simple-dialog.component.html',
  styleUrls: ['./simple-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleDialogComponent implements Dialog {
  private _title: string;
  get title() {
    return this._title;
  }
  @Input('title')
  set title(title: string) {
    this._title = title;
  }
  
  private _text: string;
  get text() {
    return this._text;
  }
  @Input('text')
  set text(text: string) {
    this._text = text;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }
  
  public close(accept: boolean): any {
    return accept;
  }
}
