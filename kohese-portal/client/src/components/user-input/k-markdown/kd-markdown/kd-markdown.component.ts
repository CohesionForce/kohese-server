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
import { Component, OnInit, Input } from '@angular/core';

// Other External Dependencies

// Kohese
import { MarkdownCheatSheetComponent } from './../markdown-cheat-sheet.component';
import { PropertyDefinition } from '../../../../../../common/src/PropertyDefinition.interface';
import { ItemProxy } from './../../../../../../common/src/item-proxy';
import { DialogService } from '../../../../services/dialog/dialog.service';

@Component({
  selector: 'kd-markdown',
  templateUrl: './kd-markdown.component.html',
  styleUrls: ['./kd-markdown.component.scss']
})
export class KdMarkdownComponent implements OnInit {
  @Input()
  property: PropertyDefinition;
  @Input()
  editable: boolean;
  @Input()
  proxy: ItemProxy;
  @Input()
  container: string;

  private _formattedValue: string;
  get formattedValue() {
    return this._formattedValue;
  }

  private _images: Array<string> = [];
  private static readonly _IMAGE_REGEXP: RegExp = /!\[.*?\]\((.+?)\)/g;

  constructor(private dialogService : DialogService) { }

  ngOnInit() {
    this.formatValue();
  }

  showCheatSheet() {
    this.dialogService.openComponentDialog(MarkdownCheatSheetComponent, {}).
      updateSize('60%', '60%');
  }

  public updateValue(input: string): void {
    this.proxy.item[this.property.propertyName] = (input ? input.replace(
      KdMarkdownComponent._IMAGE_REGEXP, (matchedSubstring: string,
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
  }

  public addImagesToMarkdown(insertionIndex: number, images: Array<File>):
    void {
    for (let j: number = images.length - 1; j >= 0; j--) {
      if ((images[j].type === 'image/png') || (images[j].type ===
        'image/jpeg')) {
        let fileReader: FileReader = new FileReader();
        fileReader.onload = () => {
          this._images.push(fileReader.result as string);
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
    this._formattedValue = (this.proxy.item[this.property.propertyName] ? this.
      proxy.item[this.property.propertyName].replace(KdMarkdownComponent.
      _IMAGE_REGEXP, (matchedSubstring: string, captureGroup: string, index:
      number, originalString: string) => {
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
    }) : this.proxy.item[this.property.propertyName]);
  }
}
