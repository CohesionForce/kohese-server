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
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
         Inject, Input, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// NPM
import { EditorComponent } from '@tinymce/tinymce-angular';

// Kohese
import { ItemRepository } from '../../services/item-repository/item-repository.service';

@Component({
  selector: 'text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextEditorComponent implements OnInit {
  private _content: string;
  get content() {
    return this._content;
  }
  @Input('content')
  set content(content: string) {
    this._content = content;
  }

  private _disabled: boolean = false;
  get disabled() {
    return this._disabled;
  }
  @Input('disabled')
  set disabled(disabled: boolean) {
    this._disabled = disabled;
  }

  private _additionalToolbarButtons: Array<string> = [];
  @Input('additionalToolbarButtons')
  set additionalToolbarButtons(additionalToolbarButtons: Array<string>) {
    this._additionalToolbarButtons = additionalToolbarButtons;
  }

  private _customizeEditor: (editor: any) => void = (editor: any) => {
  };
  @Input('customizeEditor')
  set customizeEditor(customizeEditor: (editor: any) => void) {
    this._customizeEditor = customizeEditor;
  }

  private _save: (text: string) => Promise<void> = async (text: string) => {
  };
  @Input('save')
  set save(save: (text: string) => Promise<void>) {
    this._save = save;
  }

  @ViewChild('editor', {static: false})
  private _editor: EditorComponent;
  get editor() {
    return this._editor;
  }

  @Output('selectionChanged')
  private _selectionChangedEventEmitter: EventEmitter<any> =
    new EventEmitter<any>();
  get selectionChangedEventEmitter() {
    return this._selectionChangedEventEmitter;
  }

  @Output('contentChanged')
  private _contentChangedEventEmitter: EventEmitter<string> =
    new EventEmitter<string>();

  private _contentChangeDelayIdentifier: any;

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<TextEditorComponent>,
    private _itemRepository: ItemRepository) {
  }

  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._content = this._data['content'];

      if (this._data['disabled']) {
        this._disabled = this._data['disabled'];
      }

      if (this._data['additionalToolbarButtons']) {
        this._additionalToolbarButtons = this._data[
          'additionalToolbarButtons'];
      }

      if (this._data['customizeEditor']) {
        this._customizeEditor = this._data['customizeEditor'];
      }

      if (this._data['save']) {
        this._save = this._data['save'];
      }
    }
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
            callback(fileReader.result as string, {
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

  public getAdditionalToolbarButtonsString(): string {
    return this._additionalToolbarButtons.join(' | ');
  }

  public configureEditor(editor: any): void {
    this._customizeEditor(editor);
  }

  public contentChanged(html: string): void {
    if (this._contentChangeDelayIdentifier) {
      clearTimeout(this._contentChangeDelayIdentifier);
    }

    this._contentChangeDelayIdentifier = setTimeout(async () => {
      this._contentChangedEventEmitter.emit(await this._itemRepository.
        convertToMarkdown(html, 'text/html', {}));

      this._contentChangeDelayIdentifier = undefined;
    }, 1000);
  }

  public async saveText(): Promise<void> {
    this._save(await this._itemRepository.convertToMarkdown(this._editor.
      editor.getContent(), 'text/html', {}));
  }
}
