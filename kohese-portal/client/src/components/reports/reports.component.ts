/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';

// Other External Dependencies

// Kohese
import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { InputDialogKind } from '../dialog/input-dialog/input-dialog.component';

class ReportPreview {
  private _preview: string = '';
  get preview() {
    return this._preview;
  }
  set preview(preview: string) {
    this._preview = preview;
  }

  private _isExpanded: boolean = false;
  get isExpanded() {
    return this._isExpanded;
  }
  set isExpanded(isExpanded: boolean) {
    this._isExpanded = isExpanded;
  }

  public constructor() {
  }
}

@Component({
  selector: 'reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ReportsComponent implements OnInit {
  private _reports: Map<any, ReportPreview> = new Map<any, ReportPreview>();
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

  public constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<ReportsComponent>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService,
    private _itemRepository: ItemRepository,
    private title : Title
    ) {
      this.title.setTitle('Reports');
    }

  public ngOnInit(): void {
    this.updateReportList();
  }

  public async renameReport(targetReportName: string): Promise<void> {
    let newReportName: any = await this._dialogService.openInputDialog(
      'Rename ' + targetReportName, '', InputDialogKind.STRING, 'New Name',
      targetReportName, (input: any) => {
      return (input !== targetReportName) && (input.search(/[\/\\]/) === -1);
    });
    if (newReportName) {
      await this._itemRepository.renameReport(targetReportName, newReportName);
      this.updateReportList();
    }
  }

  public async retrieveSavedReportPreview(reportObject: any): Promise<void> {
    let reportPreview: ReportPreview = this._reports.get(reportObject);
    if (reportPreview.preview.length === 0) {
      reportPreview.preview = await this._itemRepository.getReportPreview(
        reportObject.name);
    }

    reportPreview.isExpanded = true;
    this._changeDetectorRef.markForCheck();
  }

  public async removeReport(reportName: string): Promise<void> {
    await this._itemRepository.removeReport(reportName);
    this.updateReportList();
  }

  public getReportInformation(reportObject: any): void {
    if (reportObject.metaContent) {
      this._dialogService.openInformationDialog('Report Information',
      '\n' + reportObject.metaContent.split('\n\n').join('\n'));
    } else {
      this._dialogService.openInformationDialog('Report Information',
      '\nReport metadata is not available.');
    }
  }

  private updateReportList(): void {
    this._itemRepository.getReportMetaData().then((reportObjects:
      Array<any>) => {
      this._reports.clear();
      for (let j: number = 0; j < reportObjects.length; j++) {
        this._reports.set(reportObjects[j], new ReportPreview());
      }

      this._changeDetectorRef.markForCheck();
    });
  }
}
