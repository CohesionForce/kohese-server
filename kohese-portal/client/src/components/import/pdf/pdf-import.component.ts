import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef,
  MatExpansionPanel } from '@angular/material';
import { ToastrService } from 'ngx-toastr';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { PdfImportParameters } from '../../../classes/PdfImportParameters.class';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

@Component({
  selector: 'pdf-import',
  templateUrl: './pdf-import.component.html',
  styleUrls: ['./pdf-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfImportComponent {
  private _selectedFileMap: Map<File, string> = new Map<File, string>();
  get selectedFileMap() {
    return this._selectedFileMap;
  }
  
  private _pdfImportParameters: PdfImportParameters =
    new PdfImportParameters();
  get pdfImportParameters() {
    return this._pdfImportParameters;
  }
  
  get data() {
    return this._data;
  }
  
  get matDialogRef() {
    return this._matDialogRef;
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
  
  get Array() {
    return Array;
  }
  
  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<PdfImportComponent>,
    private _changeDetectorRef: ChangeDetectorRef, private _itemRepository:
    ItemRepository, private _toastrService: ToastrService) {
  }
  
  public addFiles(files: Array<File>): void {
    for (let j: number = 0; j < files.length; j++) {
      if (files[j].name.endsWith('.pdf')) {
        this._selectedFileMap.set(files[j], '');
      }
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public async retrievePdfImportPreview(pdfFile: File): Promise<string> {
    let preview: string = this._selectedFileMap.get(pdfFile);
    if (preview.length === 0) {
      preview = await this._itemRepository.getPdfImportPreview(pdfFile, this.
        _pdfImportParameters);
      this._selectedFileMap.set(pdfFile, preview);
      this._changeDetectorRef.markForCheck();
      return preview;
    } else {
      return Promise.resolve(preview);
    }
  }
  
  public removeFile(pdfFile: File): void {
    this._selectedFileMap.delete(pdfFile);
    this._changeDetectorRef.markForCheck();
  }
  
  public updatePreviews(): void {
    let selectedFileKeys: Array<File> = Array.from(this._selectedFileMap.
      keys());
    for (let j: number = 0; j < selectedFileKeys.length; j++) {
      if (this._selectedFileMap.get(selectedFileKeys[j]).length !== 0) {
        this._selectedFileMap.set(selectedFileKeys[j], '');
        this.retrievePdfImportPreview(selectedFileKeys[j]);
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
          replace('.pdf', ''), await this.retrievePdfImportPreview(
          selectedFileKeys[j]), parentId);
        this._toastrService.success(selectedFileKeys[j].name, 'PDF Imported');
      } else {
        await this._itemRepository.importMarkdown(selectedFileKeys[j].name.
          replace('.pdf', ''), preview, parentId);
        this._toastrService.success(selectedFileKeys[j].name, 'PDF Imported');
      }
    }
  }
}
