import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MarkdownService } from 'ngx-markdown';

import { ItemRepository } from '../../services/item-repository/item-repository.service';

@Component({
  selector: 'text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextEditorComponent implements OnInit {
  private _text: string;
  @Input('text')
  set text(text: string) {
    this._text = text;
  }
  
  private _html: string;
  get html() {
    return this._html;
  }
  
  private _disabled: boolean = false;
  get disabled() {
    return this._disabled;
  }
  @Input('disabled')
  set disabled(disabled: boolean) {
    this._disabled = disabled;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<TextEditorComponent>,
    private _markdownService: MarkdownService, private _itemRepository:
    ItemRepository) {
  }
  
  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._text = this._data['text'];
    }
    
    this._html = this._markdownService.compile(this._text);
  }
  
  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }
  
  public openFileSelector(callback: (newValue: string, additionalData:
    any) => void, currentValue: string, additionalData: any): void {
    let fileInput: any = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('multiple', 'true');
    if (additionalData.filetype === 'image') {
      fileInput.setAttribute('accept', 'image/png, image/jpeg');
      fileInput.onchange = () => {
        for (let j: number = 0; j < fileInput.files.length; j++) {
          let fileReader: FileReader = new FileReader();
          fileReader.onload = () => {
            callback(fileReader.result, {
              alt: fileInput.files[j].name,
              title: fileInput.files[j].name
            });
          };
          fileReader.readAsDataURL(fileInput.files[j]);
        }
      };
    }
    
    fileInput.click();
  }
  
  public async convertHtmlToMarkdown(html: string): Promise<void> {
    this._text = await this._itemRepository.convertToMarkdown(html,
      'text/html', {});
  }
}
