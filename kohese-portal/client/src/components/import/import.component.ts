import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef,
  MatExpansionPanel } from '@angular/material';
import { ToastrService } from 'ngx-toastr';

import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';

enum SupportedExtensions {
  DOCX = '.docx', DOC = '.doc', ODT = '.odt', HTM = '.htm', HTML = '.html',
    RTF = '.rtf', MARKDOWN = '.md'
}

@Component({
  selector: 'import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportComponent {
  private _selectedFileMap: Map<File, string> = new Map<File, string>();
  get selectedFileMap() {
    return this._selectedFileMap;
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
    ItemRepository, private _toastrService: ToastrService) {
  }
  
  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }
  
  public addFiles(files: Array<File>): void {
    for (let j: number = 0; j < files.length; j++) {
      if (Object.values(SupportedExtensions).indexOf(files[j].name.substring(
        files[j].name.lastIndexOf('.'))) !== -1) {
        this._selectedFileMap.set(files[j], '');
      }
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public async retrieveImportPreview(file: File): Promise<string> {
    let preview: string = this._selectedFileMap.get(file);
    if (preview.length === 0) {
      if (file.name.endsWith(SupportedExtensions.MARKDOWN)) {
        preview = await new Promise<string>((resolve: (content:
          string) => void, reject: () => void) => {
          let fileReader: FileReader = new FileReader();
          fileReader.onload = () => {
            resolve(fileReader.result);
          };
          fileReader.readAsText(file);
        });
      } else {
        preview = await this._itemRepository.getImportPreview(file);
      }
      this._selectedFileMap.set(file, preview);
      this._changeDetectorRef.markForCheck();
      return preview;
    } else {
      return Promise.resolve(preview);
    }
  }
  
  public removeFile(file: File): void {
    this._selectedFileMap.delete(file);
    this._changeDetectorRef.markForCheck();
  }
  
  public updatePreviews(): void {
    let selectedFileKeys: Array<File> = Array.from(this._selectedFileMap.
      keys());
    for (let j: number = 0; j < selectedFileKeys.length; j++) {
      if (this._selectedFileMap.get(selectedFileKeys[j]).length !== 0) {
        this._selectedFileMap.set(selectedFileKeys[j], '');
        this.retrieveImportPreview(selectedFileKeys[j]);
      }
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public async importSelectedFiles(parentId: string): Promise<void> {
    let selectedFileKeys: Array<File> = Array.from(this._selectedFileMap.
      keys());
    for (let j: number = 0; j < selectedFileKeys.length; j++) {
      let preview: string = this._selectedFileMap.get(selectedFileKeys[j]);
      if (!preview) {
        await this._itemRepository.importMarkdown(selectedFileKeys[j].name.
          substring(0, selectedFileKeys[j].name.lastIndexOf('.')), await this.
          retrieveImportPreview(selectedFileKeys[j]), parentId);
        this._toastrService.success(selectedFileKeys[j].name, 'File Imported');
      } else {
        await this._itemRepository.importMarkdown(selectedFileKeys[j].name.
          substring(0, selectedFileKeys[j].name.lastIndexOf('.')), preview,
          parentId);
        this._toastrService.success(selectedFileKeys[j].name, 'File Imported');
      }
    }
  }
}
