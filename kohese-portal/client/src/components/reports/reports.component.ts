import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MarkdownService } from 'ngx-markdown';
import { Subscription } from 'rxjs';

import { DialogService,
  DialogComponent } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ReportSelection } from '../../classes/ReportSelection.class';
import { TreeComponent } from '../tree/tree.component';

enum ReportFormat {
  DOCX = '.docx', ODT = '.odt', HTML = '.html', MARKDOWN = '.md'
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

export class ReportsComponent implements OnInit, OnDestroy {

  private _reports: Map<any, string> = new Map<any, string>();
  get reports() {
    return this._reports;
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

  get Array() {
    return Array;
  }

  @ViewChild('itemProxyTree')
  private _itemProxyTree: TreeComponent;

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

  private _treeConfigurationSubscription: Subscription;

  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<ReportsComponent>,
    private _changeDetectorRef: ChangeDetectorRef, private _dialogService:
    DialogService, private _itemRepository: ItemRepository,
    private _markdownService: MarkdownService) {
  }

  public ngOnInit(): void {
    this._treeConfigurationSubscription = TreeConfiguration.getWorkingTree().
      getChangeSubject().subscribe((notification: any) => {
      switch (notification.type) {
        case 'create':
        case 'delete':
        case 'loaded':
          this._itemProxyTree.update();
          break;
      }
    });

    this.updateReportList();
  }

  public ngOnDestroy(): void {
    this._treeConfigurationSubscription.unsubscribe();
  }

  public addReportSelection(itemProxy: ItemProxy): void {
    console.log(itemProxy);
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
    if (Array.from(this._reports.keys()).indexOf(fullReportName) !== -1) {
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

  public renameReport(targetReportName: string): void {
    let extensionStartIndex: number = targetReportName.lastIndexOf('.');
    let targetNameWithoutExtension: string = targetReportName.substring(0,
      extensionStartIndex);
    this._dialogService.openInputDialog('Rename ' + targetReportName, '',
      DialogComponent.INPUT_TYPES.TEXT, 'New Name', targetNameWithoutExtension,
      (input: any) => {
      return (input !== targetNameWithoutExtension) && (input.search(
        /[\/\\]/) === -1);
    }).afterClosed().subscribe(async (newReportNameWithoutExtension:
      string) => {
      if (newReportNameWithoutExtension) {
        await this._itemRepository.renameReport(targetReportName,
          newReportNameWithoutExtension + targetReportName.substring(
          extensionStartIndex));
        this.updateReportList();
      }
    });
  }

  public async retrieveSavedReportPreview(reportName: string): Promise<void> {
    if (this._reports.get(reportName).length === 0) {
      let reportPreview: string = await this._itemRepository.getReportPreview(
        reportName);
      this._reports.set(reportName, reportPreview);
      this._changeDetectorRef.markForCheck();
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

  public userInformation (reportObject: any) {
    this._dialogService.openInformationDialog('Report Information', reportObject.dateProduced);
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
