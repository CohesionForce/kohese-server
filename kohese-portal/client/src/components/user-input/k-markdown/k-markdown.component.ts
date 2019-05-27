import { Input, Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { UserInput } from '../user-input.class';
import { MarkdownCheatSheetComponent } from './markdown-cheat-sheet.component';
import { DialogService } from '../../../services/dialog/dialog.service';

@Component({
  selector: 'k-markdown',
  templateUrl : './k-markdown.component.html',
  styleUrls: [
    './k-markdown.component.scss'
  ] 
})
export class KMarkdownComponent extends UserInput 
                                implements OnInit, OnDestroy, OnChanges {
  @Input() 
  editableStream : Observable<boolean>;

  /* Data */
  editable : boolean;
  
  private _value: string;
  get value() {
    return this._value;
  }
  
  private _formattedValue: string;
  get formattedValue() {
    return this._formattedValue;
  }
  
  private _images: Array<string> = [];
  private static readonly _IMAGE_REGEXP: RegExp = /!\[.*?\]\((.+?)\)/g;

  /* Subscriptions */
  editableStreamSub : Subscription;

  constructor (private dialogService : DialogService) {
    super();
  }

  ngOnInit () {
    this.editableStreamSub = this.editableStream.subscribe( (editable) => {
      console.log(editable);
      this.editable = editable;
    })
    
    this._value = this.formGroup.get(this.fieldId).value;
    this.formatValue();
  }

  ngOnDestroy () {
    if (this.editableStreamSub) {
      this.editableStreamSub.unsubscribe();
    }
  }

  ngOnChanges (changes : SimpleChanges) {
    if (changes['formGroup']) {
      this.formGroup = changes['formGroup'].currentValue;
      this._value = this.formGroup.get(this.fieldId).value;
      this.formatValue();
    }
  }

  showCheatSheet() {
    this.dialogService.openComponentDialog(MarkdownCheatSheetComponent, {
    });
  }
  
  public updateValue(input: string): void {
    this._value = (input ? input.replace(
      KMarkdownComponent._IMAGE_REGEXP, (matchedSubstring: string,
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
    this.formGroup.get(this.fieldId).setValue(this._value);
  }
  
  public addImagesToMarkdown(insertionIndex: number, images: Array<File>):
    void {
    for (let j: number = images.length - 1; j >= 0; j--) {
      if ((images[j].type === 'image/png') || (images[j].type ===
        'image/jpeg')) {
        let fileReader: FileReader = new FileReader();
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
  
  private formatValue(): void {
    this._formattedValue = (this._value ? this._value.replace(
      KMarkdownComponent._IMAGE_REGEXP, (matchedSubstring: string,
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
  }
}  
