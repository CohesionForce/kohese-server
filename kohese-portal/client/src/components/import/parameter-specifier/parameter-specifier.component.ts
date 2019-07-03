import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'parameter-specifier',
  templateUrl: './parameter-specifier.component.html',
  styleUrls: ['./parameter-specifier.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParameterSpecifierComponent implements OnInit {
  private _parameters: any;
  get parameters() {
    return this._parameters;
  }
  @Input('parameters')
  set parameters(parameters: any) {
    this._parameters = parameters;
  }
  
  get matDialogRef() {
    return this._matDialogRef;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef:
    MatDialogRef<ParameterSpecifierComponent>) {
  }
  
  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._parameters = this._data['parameters'];
    }
  }
  
  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }
}
