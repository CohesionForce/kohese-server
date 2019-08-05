import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, Input, OnInit, ViewChild, EventEmitter,
  Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { MarkdownService } from 'ngx-markdown';

import { ItemRepository } from '../../services/item-repository/item-repository.service';

export class FormatSpecification {
  private _removeExternalFormatting: boolean = true;
  get removeExternalFormatting() {
    return this._removeExternalFormatting;
  }
  set removeExternalFormatting(removeExternalFormatting: boolean) {
    this._removeExternalFormatting = removeExternalFormatting;
  }
  
  private _delineate: boolean;
  get delineate() {
    return this._delineate;
  }
  set delineate(delineate: boolean) {
    this._delineate = delineate;
  }
  
  private _updateSource: boolean = false;
  get updateSource() {
    return this._updateSource;
  }
  set updateSource(updateSource: boolean) {
    this._updateSource = updateSource;
  }
  
  public constructor() {
  }
}

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
    this._html = this._markdownService.compile(this._text);
  }

  private _html: string;
  get html() {
    return this._html;
  }
  set html(html: string) {
    this._html = html;
    if (this._contentChangeDelayIdentifier) {
      clearTimeout(this._contentChangeDelayIdentifier);
    }
    
    this._contentChangeDelayIdentifier = setTimeout(async () => {
      this._contentChangedEventEmitter.emit(await this._itemRepository.
        convertToMarkdown(this._html, 'text/html', {}));
      
      this._contentChangeDelayIdentifier = undefined;
    }, 700);
  }

  private _disabled: boolean = false;
  get disabled() {
    return this._disabled;
  }
  @Input('disabled')
  set disabled(disabled: boolean) {
    this._disabled = disabled;
  }
  
  private _formatText: (text: string, formatSpecification:
    FormatSpecification) => string = (text: string, formatSpecification:
    FormatSpecification) => {
    return text;
  };
  @Input('formatText')
  set formatText(formatText: (text: string, formatSpecification:
    FormatSpecification) => string) {
    this._formatText = formatText;
  }
  
  private _insertText: (text: string, isGlobalInsertion: boolean) => void =
    (text: string, isGlobalInsertion: boolean) => {
  };
  @Input('insertText')
  set insertText(insertText: (text: string, isGlobalInsertion:
    boolean) => void) {
    this._insertText = insertText;
  }
  
  private _exportText: (text: string) => void = (text: string) => {
  };
  @Input('exportText')
  set exportText(exportText: (text: string) => void) {
    this._exportText = exportText;
  }
  
  private _update: (text: string, fromComponents: boolean) => void = (text:
    string, fromComponents: boolean) => {
  };
  @Input('update')
  set update(update: (text: string, fromComponents: boolean) => void) {
    this._update = update;
  }

  private _save: (text: string) => void = (text: string) => {};
  @Input('save')
  set save(save: (text: string) => void) {
    this._save = save;
  }
  
  @ViewChild('editor')
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

  get componentReference() {
    return this;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<TextEditorComponent>,
    private _markdownService: MarkdownService, private _itemRepository:
    ItemRepository) {
  }

  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this.text = this._data['text'];
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

  public customizeEditor(editor: any): void {
    editor.ui.registry.addMenuButton('insert', {
      text: 'Insert',
      fetch: (callback: Function) => {
        callback([
          {
            type: 'menuitem',
            text: 'Globally...',
            disabled: !this._text,
            onAction: (button: any) => {
              this._insertText(this._text, true);
              this._editor.editor.setDirty(true);
            }
          }
        ]);
      }
    });
    editor.ui.registry.addToggleButton('delineate', {
      text: 'Delineate',
      onAction: (button: any) => {
        let delineate: boolean = !button.isActive();
        let formatSpecification: FormatSpecification =
          new FormatSpecification();
        formatSpecification.removeExternalFormatting = false;
        formatSpecification.delineate = delineate;
        formatSpecification.updateSource = true;
        this._formatText(this._text, formatSpecification);
        button.setActive(delineate);
      }
    });
    editor.ui.registry.addButton('export', {
      text: 'Export',
      disabled: !this._text,
      onAction: (button: any) => {
        this._exportText(this._text);
      }
    });
    editor.ui.registry.addButton('update', {
      text: 'Update',
      disabled: !this._text,
      onAction: (button: any) => {
        this._update(this._text, true);
      }
    });
  }
  
  public async saveText(): Promise<void> {
    this._text = await this._itemRepository.convertToMarkdown(this._html,
      'text/html', {});
    this._save(this._text);
  }
}
