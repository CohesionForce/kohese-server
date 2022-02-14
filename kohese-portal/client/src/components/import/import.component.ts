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
import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  Optional, Inject, OnInit, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Other External Dependencies
import { ToastrService } from 'ngx-toastr';

// Kohese
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ParameterSpecifierComponent } from './parameter-specifier/parameter-specifier.component';
import { PdfImportParameters } from '../../classes/PdfImportParameters.class';
import { NotificationService } from '../../services/notifications/notification.service';

enum SupportedTypes {
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.' +
    'document', DOC = 'application/msword', ODT = 'application/vnd.oasis.' +
    'opendocument.text', PDF = 'application/pdf', HTML = 'text/html', RTF =
    'application/rtf', TXT = 'text/plain', JPEG = 'image/jpeg', PNG =
    'image/png'//, Markdown = 'text/markdown'
}

class FileMapValue {
  get preview() {
    return this._preview;
  }
  set preview(preview: string) {
    this._preview = preview;
  }

  get parameters() {
    return this._parameters;
  }
  set parameters(parameters: any) {
    this._parameters = parameters;
  }

  private _expanded: boolean = false;
  get expanded() {
    return this._expanded;
  }
  set expanded(expanded: boolean) {
    this._expanded = expanded;
  }

  public constructor(private _preview: string, private _parameters: any) {
  }
}

@Component({
  selector: 'import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportComponent implements OnInit {
  private _selectedFileMap: Map<File, FileMapValue> =
    new Map<File, FileMapValue>();
  get selectedFileMap() {
    return this._selectedFileMap;
  }

  private _parentId: string;
  get parentId() {
    return this._parentId;
  }
  @Input('parentId')
  set parentId(parentId: string) {
    this._parentId = parentId;
  }

  get matDialogRef() {
    return this._matDialogRef;
  }

  get Object() {
    return Object;
  }

  get Array() {
    return Array;
  }

  get SupportedTypes() {
    return SupportedTypes;
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

  private _getIcon: (element: any) => string = (element: any) => {
    return (element as ItemProxy).model.view.item.icon;
  };
  get getIcon() {
    return this._getIcon;
  }
  private _isFavorite: (element: any) => boolean = (element: any) => {
    return ( (element as ItemProxy).item.favorite ? (element as ItemProxy).item.favorite : false);
  }
  get isFavorite() {
    return this._isFavorite;
  }

  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<ImportComponent>,
    private _changeDetectorRef: ChangeDetectorRef, private _itemRepository:
    ItemRepository, private _toastrService: ToastrService,
    private _notificationService: NotificationService,
    private _dialogService: DialogService) {
  }

  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._parentId = this._data['parentId'];
    }
  }

  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }

  public addFiles(files: Array<File>): void {
    for (let j: number = 0; j < files.length; j++) {
      if (Object.values(SupportedTypes).indexOf(files[j].type as SupportedTypes) !== -1) {
        let parameters: any;
        if (files[j].type === SupportedTypes.PDF) {
          parameters = new PdfImportParameters();
        } else {
          parameters = {};
        }

        this._selectedFileMap.set(files[j], new FileMapValue('', parameters));
      }
    }

    this._changeDetectorRef.markForCheck();
  }
  public async retrieveUrlContent(url: string): Promise<void> {
    if (!/^https:\/\//.test(url)) {
      console.log('::: Import Component: ERR: Missing Protocol https');
      throw('ERR: missing_https_protocol_at: ' + url);
    }
    let contentObject: any = await this._itemRepository.getUrlContent(url);
    let file: File = new File([contentObject.content], url, {
      type: ((contentObject.contentType.indexOf(';') !== -1) ? contentObject.
        contentType.substring(0, contentObject.contentType.indexOf(';')) :
        contentObject.contentType)
    });

    if (Object.values(SupportedTypes).indexOf(file.type as SupportedTypes) !== -1) {
      let parameters: any;
      if (file.type === SupportedTypes.PDF) {
        parameters = new PdfImportParameters();
      } else {
        parameters = {};
      }

      let slashIndex: number = url.indexOf('/', url.indexOf('://') + 3);
      if (slashIndex !== -1) {
        parameters.pathBase = url.substring(0, slashIndex + 1);
      } else {
        parameters.pathBase = url + '/';
      }

      this._selectedFileMap.set(file, new FileMapValue('', parameters));
      this._changeDetectorRef.markForCheck();
    }
  }

  public async retrieveImportPreview(file: File): Promise<string> {
    let fileMapValue: FileMapValue = this._selectedFileMap.get(file);
    if (fileMapValue.preview.length === 0) {
      if ((file.type === SupportedTypes.JPEG) || (file.type === SupportedTypes.
        PNG)) {
        fileMapValue.preview = await new Promise<string>((resolve: (content:
          string) => void, reject: () => void) => {
          let fileReader: FileReader = new FileReader();
          fileReader.onload = () => {
            resolve('![' + file.name + '](' + fileReader.result + ')');
          };
          fileReader.readAsDataURL(file);
        });
      } else if (file.type === SupportedTypes.TXT)/* || (file.type ===
        SupportedTypes.Markdown))*/ {
        fileMapValue.preview = await new Promise<string>((resolve: (content:
          string) => void, reject: () => void) => {
          let fileReader: FileReader = new FileReader();
          fileReader.onload = () => {
            resolve(fileReader.result as string);
          };
          fileReader.readAsText(file);
        });
      } else {
        fileMapValue.preview = await this._itemRepository.getImportPreview(
          file, fileMapValue.parameters);
      }
    }

    this._selectedFileMap.get(file).expanded = true;
    this._changeDetectorRef.markForCheck();
    return fileMapValue.preview;
  }

  public openParameterSpecifier(file: File): void {
    this._dialogService.openComponentDialog(ParameterSpecifierComponent, {
      data: {
        parameters: this._selectedFileMap.get(file).parameters
      }
    }).updateSize('80%', '60%').afterClosed().subscribe((parameters: any) => {
      if (parameters) {
        this.updateFile(file);
      }
    });
  }

  public async updateFile(file: File): Promise<void> {
    let fileMapValue: FileMapValue = this._selectedFileMap.get(file);
    if (/^https?:\/\//.test(file.name)) {
      let insertionIndex: number = Array.from(this._selectedFileMap.
        keys()).indexOf(file);
      let temporaryMap: Map<File, any> = new Map<File, any>();
      this._selectedFileMap.delete(file);
      let selectedFiles: Array<File> = Array.from(this._selectedFileMap.
        keys());
      for (let j: number = 0; j < selectedFiles.length; j++) {
        temporaryMap.set(selectedFiles[j], this._selectedFileMap.get(
          selectedFiles[j]));
      }
      this._selectedFileMap.clear();
      for (let j: number = 0; j < insertionIndex; j++) {
        this._selectedFileMap.set(selectedFiles[j], temporaryMap.get(
          selectedFiles[j]));
      }

      let contentObject: any = await this._itemRepository.getUrlContent(file.
        name);
      file = new File([contentObject.content], file.name, {
        type: ((contentObject.contentType.indexOf(';') !== -1) ? contentObject.
          contentType.substring(0, contentObject.contentType.indexOf(';')) :
          contentObject.contentType)
      });
      this._selectedFileMap.set(file, fileMapValue);

      for (let j: number = insertionIndex; j < selectedFiles.length; j++) {
        this._selectedFileMap.set(selectedFiles[j], temporaryMap.get(
          selectedFiles[j]));
      }
    }

    fileMapValue.preview = '';
    fileMapValue.expanded = false;
    this._changeDetectorRef.markForCheck();
    this.retrieveImportPreview(file);
  }

  public removeFile(file: File): void {
    this._selectedFileMap.delete(file);
    this._changeDetectorRef.markForCheck();
  }

  public async importSelectedFiles(parentId: string): Promise<void> {
    let selectedFileKeys: Array<File> = Array.from(this._selectedFileMap.
      keys());
    for (let j: number = 0; j < selectedFileKeys.length; j++) {
      let fileMapValue: FileMapValue = this._selectedFileMap.get(
        selectedFileKeys[j]);
      this._notificationService.addNotifications('PROCESSING: Import File ' + selectedFileKeys[j].name);
      if (!fileMapValue.preview) {
        await this._itemRepository.importMarkdown(selectedFileKeys[j].name,
          await this.retrieveImportPreview(selectedFileKeys[j]), parentId);
        this._toastrService.success(selectedFileKeys[j].name, 'File Imported',
          {positionClass: 'toast-bottom-right'});
        this._notificationService.addNotifications('COMPLETED: Import File ' + selectedFileKeys[j].name);
      } else {
        await this._itemRepository.importMarkdown(selectedFileKeys[j].name,
          fileMapValue.preview, parentId);
        this._toastrService.success(selectedFileKeys[j].name, 'File Imported',
          {positionClass: 'toast-bottom-right'});
        this._notificationService.addNotifications('COMPLETED: Import File ' + selectedFileKeys[j].name);
      }
    }
  }
}
