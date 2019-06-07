import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { DialogService,
  DialogComponent } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ReportSelection } from '../../classes/ReportSelection.class';

enum ReportFormat {
  DOCX = '.docx', ODT = '.odt', RTF = '.rtf', HTML = '.html'
}

enum MoveDirection {
  UP, DOWN
}

@Component({
  selector: 'reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {
  private _reportNames: Array<string> = [];
  get reportNames() {
    return this._reportNames;
  }
  
  private _reportSelections: Array<ReportSelection> = [];
  get reportSelections() {
    return this._reportSelections;
  }
  
  private _linkToItems: boolean;
  get linkToItems() {
    return this._linkToItems;
  }
  set linkToItems(linkToItems: boolean) {
    this._linkToItems = linkToItems;
  }
  
  private _report: string;
  get report() {
    return this._report;
  }
  
  get ReportFormat() {
    return ReportFormat;
  }
  
  get MoveDirection() {
    return MoveDirection;
  }
  
  get Object() {
    return Object;
  }
  
  get TreeConfiguration() {
    return TreeConfiguration;
  }
  
  private _getChildren: (element: any) => Array<any> = (element: any) => {
    return (element as ItemProxy).children;
  };
  get getChildren() {
    return this._getChildren;
  }
  
  private _getText: (element: any) => string = (element: any) => {
    return (element as ItemProxy).item.name;
  };
  get getText() {
    return this._getText;
  }
  
  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<ReportsComponent>,
    private _changeDetectorRef: ChangeDetectorRef, private _dialogService:
    DialogService, private _itemRepository: ItemRepository) {
  }
  
  public ngOnInit(): void {
    this.updateReportList();
  }
  
  public addReportSelection(itemProxy: ItemProxy): void {
    this._reportSelections.push(new ReportSelection(itemProxy));
    this.updateReportPreview();
  }
  
  public getReportSelectionsIndex(itemProxy: ItemProxy): number {
    return this._reportSelections.map((reportSelection: ReportSelection) => {
      return reportSelection.itemProxy;
    }).indexOf(itemProxy);
  }
  
  /**
   * Moves the given ReportSelection one index in the direction indicated by
   *  the given MoveDirection
   */
  public move(moveDirection: MoveDirection, reportSelection: ReportSelection):
    void {
    let candidateIndex: number = this.getReportSelectionsIndex(reportSelection.
      itemProxy);
    this._reportSelections.splice(candidateIndex, 1);
    if (moveDirection === MoveDirection.UP) {
      this._reportSelections.splice(candidateIndex - 1, 0, reportSelection);
    } else {
      this._reportSelections.splice(candidateIndex + 1, 0, reportSelection);
    }
  }
  
  public canProduceReport(reportName: string): boolean {
    return (reportName && (reportName.search(/[\/\\]/) === -1) && (this.
      _reportSelections.length > 0));
  }
  
  public async produceReport(reportName: string, reportFormat: ReportFormat,
    unsavedDownloadAnchor: any): Promise<void> {
    let fullReportName: string = reportName + reportFormat;
    if (this._reportNames.indexOf(fullReportName) !== -1) {
      this._dialogService.openYesNoDialog('Overwrite ' + reportName,
        'A report named ' + fullReportName + ' already exists. ' +
        'Proceeding should overwrite that report. Do you want to proceed?').
        subscribe(async (result: any) => {
        if (result) {
          await this._itemRepository.produceReport(this._report, reportName,
            reportFormat);
          if (unsavedDownloadAnchor) {
            unsavedDownloadAnchor.download = fullReportName;
            unsavedDownloadAnchor.href = '/producedReports/' + fullReportName;
            unsavedDownloadAnchor.click();
            this.removeReport(fullReportName);
          } else {
            this.updateReportList();
          }
        }
      });
    } else {
      await this._itemRepository.produceReport(this._report, reportName,
        reportFormat);
      if (unsavedDownloadAnchor) {
        unsavedDownloadAnchor.download = fullReportName;
        unsavedDownloadAnchor.href = '/producedReports/' + fullReportName;
        unsavedDownloadAnchor.click();
        this.removeReport(fullReportName);
      } else {
        this.updateReportList();
      }
    }
  }
  
  public async removeReport(reportName: string): Promise<void> {
    await this._itemRepository.removeReport(reportName);
    this.updateReportList();
  }
  
  public updateReportPreview(): void {
    this._report = this._itemRepository.buildReport(this._reportSelections,
      this._linkToItems);
    this._changeDetectorRef.markForCheck();
  }
  
  public updateReportList(): void {
    this._itemRepository.getReportNames().then((reportNames:
      Array<string>) => {
      this._reportNames = reportNames;
      this._changeDetectorRef.markForCheck();
    });
  }
}
