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


import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ToastrService } from 'ngx-toastr';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { NotificationService } from '../../../services/notifications/notification.service';
import { SessionService } from '../../../services/user/session.service';

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

  private _includeDescendants: boolean = true;
  get includeDescendants() {
    return this._includeDescendants;
  }
  set includeDescendants(includeDescendants: boolean) {
    this._includeDescendants = includeDescendants;
  }

  private _addLinks: boolean = false;
  get addLinks() {
    return this._addLinks;
  }
  set addLinks(addLinks: boolean) {
    this._addLinks = addLinks;
  }

  private _saveReport: boolean = false;
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

  private _defaultName: string = '';
  @Input('defaultName')
  set defaultName(defaultName: string) {
    this._defaultName = defaultName;
  }

  private _allowDescendantInclusionSpecification: boolean = false;
  get allowDescendantInclusionSpecification() {
    return this._allowDescendantInclusionSpecification;
  }
  @Input('allowDescendantInclusionSpecification')
  set allowDescendantInclusionSpecification(
    allowDescendantInclusionSpecification: boolean) {
    this._allowDescendantInclusionSpecification =
      allowDescendantInclusionSpecification;
  }

  private _allowLinkSpecification: boolean = false;
  get allowLinkSpecification() {
    return this._allowLinkSpecification;
  }
  @Input('allowLinkSpecification')
  set allowLinkSpecification(allowLinkSpecification: boolean) {
    this._allowLinkSpecification = allowLinkSpecification;
  }

  private _getReportContent: (initialContent: string, reportSpecifications:
    ReportSpecifications) => string;
  @Input('getReportContent')
  set getReportContent(getReportContent: (initialContent: string,
    reportSpecifications: ReportSpecifications) => string) {
    this._getReportContent = getReportContent;
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
    MatDialogRef<ReportSpecificationComponent>, private _itemRepository:
    ItemRepository, private _dialogService: DialogService,
    private _notificationService: NotificationService, private _sessionService:
    SessionService, private _toastrService: ToastrService) {
  }

  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._defaultName = this._data['defaultName'];
      this._allowDescendantInclusionSpecification = this._data[
        'allowDescendantInclusionSpecification'];
      this._allowLinkSpecification = this._data['allowLinkSpecification'];
      this._getReportContent = this._data['getReportContent'];
    }

    this._reportSpecifications.name = this._defaultName;
    this.formatSelectionChanged(this._reportSpecifications.format);
  }

  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }

  public formatSelectionChanged(format: string): void {
    let extension: string;
    switch (this._reportSpecifications.format) {
      case ReportFormat.DOCX:
        extension = '.docx';
        break;
      case ReportFormat.ODT:
        extension = '.odt';
        break;
      case ReportFormat.HTML:
        extension = '.html';
        break;
      default:
        extension = '.md';
    }

    if (this._reportSpecifications.name.endsWith(extension)) {
      this._reportSpecifications.name = this._reportSpecifications.name.
        substring(0, this._reportSpecifications.name.lastIndexOf(extension));
    }

    this._reportSpecifications.format = format;
    switch (this._reportSpecifications.format) {
      case ReportFormat.DOCX:
        extension = '.docx';
        break;
      case ReportFormat.ODT:
        extension = '.odt';
        break;
      case ReportFormat.HTML:
        extension = '.html';
        break;
      default:
        extension = '.md';
    }

    this._reportSpecifications.name += extension;

    this._changeDetectorRef.markForCheck();
  }

  public canProduceReport(): boolean {
    return (this._reportSpecifications.name && (this._reportSpecifications.
      name.search(/[\/\\]/) === -1));
  }

  public async produceReport(): Promise<void> {
    let reportObjects: Array<any> = await this._itemRepository.
      getReportMetaData();
    if (reportObjects.map((reportObject: any) => {
      return reportObject.name;
    }).indexOf(this._reportSpecifications.name) !== -1) {
      let result: any = await this._dialogService.openYesNoDialog(
        'Overwrite ' + this._reportSpecifications.name, 'A report named ' +
        this._reportSpecifications.name + ' already exists. Proceeding ' +
        'should overwrite that report. Do you want to proceed?');
      if (result) {
        await this._produceReport();
      }
    } else {
      await this._produceReport();
    }
  }

  private async _produceReport(): Promise<void> {
    this._notificationService.addNotifications('PROCESSING: ' +
      'Export Report ' + this._reportSpecifications.name);
    let initialReportContent: string = 'Name: ' + this._reportSpecifications.
      name + '\n\nProduced by: ' + this._sessionService.user.name +
      '\n\nProduced on: ' + new Date() + '\n\n';
    await this._itemRepository.produceReport(this._getReportContent(
      initialReportContent, this._reportSpecifications), this.
      _reportSpecifications.name, this._reportSpecifications.format);
    if (this._reportSpecifications.saveReport) {
      let downloadAnchor: any = document.createElement('a');
      downloadAnchor.download = this._reportSpecifications.name;
      downloadAnchor.href = '/producedReports/' +
        this._reportSpecifications.name;
      downloadAnchor.click();
    }

    this._toastrService.success(this._reportSpecifications.name,
      'Report Produced', {positionClass: 'toast-bottom-right'});
    this._notificationService.addNotifications('COMPLETED: Report ' +
      'Completed ' + this._reportSpecifications.name);

    if (this.isDialogInstance()) {
      this._matDialogRef.close(this._reportSpecifications);
    }
  }
}
