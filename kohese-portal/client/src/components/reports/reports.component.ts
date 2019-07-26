import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { DialogService,
  DialogComponent } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

@Component({
  selector: 'reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ReportsComponent implements OnInit {
  private _reports: Map<any, string> = new Map<any, string>();
  get reports() {
    return this._reports;
  }

  private _report: string;
  get report() {
    return this._report;
  }

  get Array() {
    return Array;
  }

  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<ReportsComponent>,
    private _changeDetectorRef: ChangeDetectorRef, private _dialogService:
    DialogService, private _itemRepository: ItemRepository) {
  }

  public ngOnInit(): void {
    this.updateReportList();
  }

  public renameReport(targetReportName: string): void {
    this._dialogService.openInputDialog('Rename ' + targetReportName, '',
      DialogComponent.INPUT_TYPES.TEXT, 'New Name', targetReportName,
      (input: any) => {
      return (input !== targetReportName) && (input.search(/[\/\\]/) === -1);
    }).afterClosed().subscribe(async (newReportName: string) => {
      if (newReportName) {
        await this._itemRepository.renameReport(targetReportName,
          newReportName);
        this.updateReportList();
      }
    });
  }

  public async retrieveSavedReportPreview(reportObject: any): Promise<void> {
    if (this._reports.get(reportObject).length === 0) {
      let reportPreview: string = await this._itemRepository.getReportPreview(
        reportObject.name);
      this._reports.set(reportObject, reportPreview);
      this._changeDetectorRef.markForCheck();
    }
  }

  public async removeReport(reportName: string): Promise<void> {
    await this._itemRepository.removeReport(reportName);
    this.updateReportList();
  }

  public getReportInformation(reportObject: any): void {
    this._dialogService.openInformationDialog('Report Information',
      '\n' + reportObject.metaContent.split('\n\n').join('\n'));
  }

  private updateReportList(): void {
    this._itemRepository.getReportMetaData().then((reportObjects:
      Array<any>) => {
      this._reports.clear();
      for (let j: number = 0; j < reportObjects.length; j++) {
        this._reports.set(reportObjects[j], '');
      }

      this._changeDetectorRef.markForCheck();
    });
  }
}
