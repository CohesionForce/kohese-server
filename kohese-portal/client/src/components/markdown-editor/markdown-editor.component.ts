import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output,
  EventEmitter } from '@angular/core';

import { DialogService } from '../../services/dialog/dialog.service';
import { MarkdownCheatSheetComponent } from '../user-input/k-markdown/markdown-cheat-sheet.component';

@Component({
  selector: 'markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownEditorComponent {
  private _value: string;
  get value() {
    return this._value;
  }
  @Input('value')
  set value(value: string) {
    this._value = value;
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
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService) {
  }
  
  public addImagesToMarkdown(insertionIndex: number, images: Array<File>):
    void {
    let fileReader: FileReader = new FileReader();
    for (let j: number = images.length - 1; j >= 0; j--) {
      fileReader.onload = () => {
        let imageReference: string = '![' + images[j].name + '](' + fileReader.
          result + ')';
        this._value = this._value.substring(0, insertionIndex) +
          imageReference + this._value.substring(insertionIndex);
        this._valueChangedEmitter.emit(this._value);
        this._changeDetectorRef.markForCheck();
      };
      fileReader.readAsDataURL(images[j]);
    }
  }
  
  public openMarkdownInformationDialog(): void {
    this._dialogService.openComponentDialog(MarkdownCheatSheetComponent, {});
  }
}
