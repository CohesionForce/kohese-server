import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef,
  MatExpansionPanel } from '@angular/material';
import { ToastrService } from 'ngx-toastr';

import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ParameterSpecifierComponent } from './parameter-specifier/parameter-specifier.component';
import { PdfImportParameters } from '../../classes/PdfImportParameters.class';

enum SupportedExtensions {
  DOCX = '.docx', DOC = '.doc', ODT = '.odt', PDF = '.pdf', HTM = '.htm',
    HTML = '.html', RTF = '.rtf', TXT = '.txt', JPG = '.jpg', JPEG = '.jpeg',
    PNG = '.png', MARKDOWN = '.md'
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
  
  get SupportedExtensions() {
    return SupportedExtensions;
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
    @Optional() private _matDialogRef: MatDialogRef<ImportComponent>,
    private _changeDetectorRef: ChangeDetectorRef, private _itemRepository:
    ItemRepository, private _toastrService: ToastrService,
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
      let extension: string = files[j].name.substring(files[j].name.
        lastIndexOf('.'));
      if (Object.values(SupportedExtensions).indexOf(extension) !== -1) {
        let parameters: any ;
        if (extension === '.pdf') {
          parameters = new PdfImportParameters();
        } else {
          parameters = {};
        }
        
        this._selectedFileMap.set(files[j], new FileMapValue('', parameters));
      }
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public async retrieveImportPreview(file: File): Promise<string> {
    let fileMapValue: FileMapValue = this._selectedFileMap.get(file);
    if (fileMapValue.preview.length === 0) {
      if (file.name.endsWith(SupportedExtensions.JPG) || file.name.endsWith(
        SupportedExtensions.JPEG) || file.name.endsWith(SupportedExtensions.
        PNG)) {
        fileMapValue.preview = await new Promise<string>((resolve: (content:
          string) => void, reject: () => void) => {
          let fileReader: FileReader = new FileReader();
          fileReader.onload = () => {
            resolve('![' + file.name + '](' + fileReader.result + ')');
          };
          fileReader.readAsDataURL(file);
        });
      } else if (file.name.endsWith(SupportedExtensions.TXT) || file.name.
        endsWith(SupportedExtensions.MARKDOWN)) {
        fileMapValue.preview = await new Promise<string>((resolve: (content:
          string) => void, reject: () => void) => {
          let fileReader: FileReader = new FileReader();
          fileReader.onload = () => {
            resolve(fileReader.result);
          };
          fileReader.readAsText(file);
        });
      } else {
        fileMapValue.preview = await this._itemRepository.getImportPreview(
          file, fileMapValue.parameters);
      }
      
      this._changeDetectorRef.markForCheck();
      return fileMapValue.preview;
    } else {
      return Promise.resolve(fileMapValue.preview);
    }
  }
  
  public openParameterSpecifier(file: File): void {
    this._dialogService.openComponentDialog(ParameterSpecifierComponent, {
      data: {
        parameters: this._selectedFileMap.get(file).parameters
      },
      disableClose: true
    }).updateSize('80%', '60%').afterClosed().subscribe((parameters: any) => {
      if (parameters) {
        this.updatePreviews();
      }
    });
  }
  
  public removeFile(file: File): void {
    this._selectedFileMap.delete(file);
    this._changeDetectorRef.markForCheck();
  }
  
  public updatePreviews(): void {
    let selectedFileKeys: Array<File> = Array.from(this._selectedFileMap.
      keys());
    for (let j: number = 0; j < selectedFileKeys.length; j++) {
      let fileMapValue: FileMapValue = this._selectedFileMap.get(
        selectedFileKeys[j]);
      if (fileMapValue.preview.length !== 0) {
        fileMapValue.preview = '';
        this.retrieveImportPreview(selectedFileKeys[j]);
      }
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public async importSelectedFiles(parentId: string): Promise<void> {
    let selectedFileKeys: Array<File> = Array.from(this._selectedFileMap.
      keys());
    for (let j: number = 0; j < selectedFileKeys.length; j++) {
      let fileMapValue: FileMapValue = this._selectedFileMap.get(
        selectedFileKeys[j]);
      if (!fileMapValue.preview) {
        await this._itemRepository.importMarkdown(selectedFileKeys[j].name.
          substring(0, selectedFileKeys[j].name.lastIndexOf('.')), await this.
          retrieveImportPreview(selectedFileKeys[j]), parentId);
        this._toastrService.success(selectedFileKeys[j].name, 'File Imported');
      } else {
        await this._itemRepository.importMarkdown(selectedFileKeys[j].name.
          substring(0, selectedFileKeys[j].name.lastIndexOf('.')),
          fileMapValue.preview, parentId);
        this._toastrService.success(selectedFileKeys[j].name, 'File Imported');
      }
    }
  }
}
