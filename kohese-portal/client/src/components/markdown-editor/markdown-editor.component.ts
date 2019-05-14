import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Input,
  Output, EventEmitter } from '@angular/core';

import { DialogService } from '../../services/dialog/dialog.service';
import { MarkdownCheatSheetComponent } from '../user-input/k-markdown/markdown-cheat-sheet.component';

@Component({
  selector: 'markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownEditorComponent implements OnInit {
  private _value: string;
  get value() {
    return this._value;
  }
  @Input('value')
  set value(value: string) {
    this._value = value;
  }
  
  private _formattedValue: string;
  get formattedValue() {
    return this._formattedValue;
  }
  
  private _valueIdentifier: string;
  get valueIdentifier() {
    return this._valueIdentifier;
  }
  @Input('valueIdentifier')
  set valueIdentifier(valueIdentifier: string) {
    this._valueIdentifier = valueIdentifier;
  }
  
  private _valueChangedEmitter: EventEmitter<string> =
    new EventEmitter<string>();
  @Output('valueChanged')
  get valueChangedEmitter() {
    return this._valueChangedEmitter;
  }
  
  private _images: Array<string> = [];
  private static readonly _IMAGE_REGEXP: RegExp = /\!\[.+\]\((.+)\)/g;
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService) {
  }
  
  public ngOnInit(): void {
    this.formatValue();
  }
  
  public updateValue(input: string): void {
    this._value = (input ? input.replace(
      MarkdownEditorComponent._IMAGE_REGEXP, (matchedSubstring: string,
      captureGroup: string, index: number, originalString: string) => {
      let matchedSubstringCaptureGroupIndex: number = matchedSubstring.
        lastIndexOf(captureGroup);
      let imageData: string = this._images[+captureGroup];
      if (imageData) {
        return matchedSubstring.substring(0,
          matchedSubstringCaptureGroupIndex) + imageData + matchedSubstring.
          substring(matchedSubstringCaptureGroupIndex + captureGroup.length);
      } else {
        /* Remove the text between the parentheses to prevent an error from
        occurring */
        return matchedSubstring.substring(0,
          matchedSubstringCaptureGroupIndex) + matchedSubstring.substring(
          matchedSubstringCaptureGroupIndex + captureGroup.length);
      }
    }) : input);
    this.formatValue();
    this._valueChangedEmitter.emit(this._value);
  }
  
  public addImagesToMarkdown(insertionIndex: number, images: Array<File>):
    void {
    let fileReader: FileReader = new FileReader();
    for (let j: number = images.length - 1; j >= 0; j--) {
      if ((images[j].type === 'image/png') || (images[j].type ===
        'image/jpeg')) {
        fileReader.onload = () => {
          this._images.push(fileReader.result);
          let imageReference: string = '![' + images[j].name + '](' +
            (this._images.length - 1) + ')';
          this._formattedValue = (this._formattedValue ? this._formattedValue.
            substring(0, insertionIndex) : '') + imageReference + (this.
            _formattedValue ? this._formattedValue.substring(insertionIndex) :
            '');
          this.updateValue(this._formattedValue);
        };
        fileReader.readAsDataURL(images[j]);
      }
    }
  }
  
  public openMarkdownInformationDialog(): void {
    this._dialogService.openComponentDialog(MarkdownCheatSheetComponent, {});
  }
  
  private formatValue(): void {
    this._formattedValue = (this._value ? this._value.replace(
      MarkdownEditorComponent._IMAGE_REGEXP, (matchedSubstring: string,
      captureGroup: string, index: number, originalString: string) => {
      if (captureGroup.startsWith('data:')) {
        let imageIndex: number = this._images.indexOf(captureGroup);
        if (imageIndex === -1) {
          this._images.push(captureGroup);
          imageIndex = this._images.length - 1;
        }
        
        let matchedSubstringCaptureGroupIndex: number = matchedSubstring.
          indexOf(captureGroup);
        return matchedSubstring.substring(0,
          matchedSubstringCaptureGroupIndex) + imageIndex + matchedSubstring.
          substring(matchedSubstringCaptureGroupIndex + captureGroup.length);
      } else {
        return matchedSubstring;
      }
    }) : this._value);
    
    this._changeDetectorRef.markForCheck();
  }
}
