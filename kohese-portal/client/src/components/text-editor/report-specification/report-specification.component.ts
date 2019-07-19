import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

enum ReportFormat {
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.' +
    'document', ODT = 'application/vnd.oasis.opendocument.text',HTML =
    'text/html', Markdown = 'text/markdown'
}

export class ReportSpecifications {
  private _name: string;
  get name() {
    return this._name;
  }
  set name(name: string) {
    this._name = name;
  }
  
  private _format: string = ReportFormat.DOCX;
  get format() {
    return this._format;
  }
  set format(format: string) {
    this._format = format;
  }
  
  private _saveReport: boolean = true;
  get saveReport() {
    return this._saveReport;
  }
  set saveReport(saveReport: boolean) {
    this._saveReport = saveReport;
  }
  
  public constructor() {
  }
}

@Component({
  selector: 'report-specification',
  templateUrl: './report-specification.component.html',
  styleUrls: ['./report-specification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportSpecificationComponent {
  private _reportSpecifications: ReportSpecifications =
    new ReportSpecifications();
  get reportSpecifications() {
    return this._reportSpecifications;
  }
  
  get matDialogRef() {
    return this._matDialogRef;
  }
  
  get Object() {
    return Object;
  }
  
  get ReportFormat() {
    return ReportFormat;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef:
    MatDialogRef<ReportSpecificationComponent>) {
  }
  
  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }
  
  public canProduceReport(): boolean {
    return (this._reportSpecifications.name && (this._reportSpecifications.
      name.search(/[\/\\]/) === -1));
  }
}
