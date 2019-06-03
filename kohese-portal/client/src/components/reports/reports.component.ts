import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { DialogService,
  DialogComponent } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

enum ReportFormat {
  DOCX = '.docx', HTML = '.html'
}

@Component({
  selector: 'reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {
  private _item: any;
  get item() {
    return this._item;
  }
  @Input('item')
  set item(item: any) {
    this._item = item;
  }
  
  private _reportNames: Array<string> = [];
  get reportNames() {
    return this._reportNames;
  }
  
  get ReportFormat() {
    return ReportFormat;
  }
  
  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<ReportsComponent>,
    private _changeDetectorRef: ChangeDetectorRef, private _dialogService:
    DialogService, private _itemRepository: ItemRepository) {
  }
  
  public ngOnInit(): void {
    if (this._data) {
      this._item = this._data['item'];
    }
    
    this.refresh();
  }
  
  public produceReport(reportFormat: ReportFormat): void {
    this._dialogService.openInputDialog('Enter Report Name', '',
      DialogComponent.INPUT_TYPES.TEXT, 'Report Name', new Date().
      toDateString(), (reportName: string) => {
      return (reportName && (this._reportNames.indexOf(reportName) === -1) &&
        (reportName.search(/[\/\\]/) === -1));
    }).afterClosed().subscribe(async (reportName: string) => {
      if (reportName) {
        await this._itemRepository.produceReport(this._item.id, reportName,
          reportFormat);
        this.refresh();
      }
    });
  }
  
  public async removeReport(reportName: string): Promise<void> {
    await this._itemRepository.removeReport(this._item.id, reportName);
    this.refresh();
  }
  
  public refresh(): void {
    this._itemRepository.getReportNames(this._item.id).then((reportNames:
      Array<string>) => {
      this._reportNames = reportNames;
      this._changeDetectorRef.markForCheck();
    });
  }
}
