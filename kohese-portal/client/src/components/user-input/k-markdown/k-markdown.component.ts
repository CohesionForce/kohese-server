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
  markdownData : string;
  editable : boolean;

  /* Subscriptions */
  editableStreamSub : Subscription;
  formGroupSub : Subscription;

  constructor (private dialogService : DialogService) {
    super();
  }

  ngOnInit () {
    this.markdownData = this.formGroup.get(this.fieldId).value;

    this.editableStreamSub = this.editableStream.subscribe( (editable) => {
      console.log(editable);
      this.editable = editable;
    })
    this.formGroupSub = this.formGroup.get(this.fieldId).valueChanges.subscribe(value => {
      this.markdownData = value;
    });
  }

  ngOnDestroy () {
    if (this.editableStreamSub) {
      this.editableStreamSub.unsubscribe();
    }
    this.formGroupSub.unsubscribe();
  }

  ngOnChanges (changes : SimpleChanges) {
    if (changes['formGroup']) {
      if (this.formGroupSub) {
        this.formGroupSub.unsubscribe();
      }
      this.formGroup = changes['formGroup'].currentValue;
      this.markdownData = this.formGroup.get(this.fieldId).value;
      this.formGroupSub = this.formGroup.get(this.fieldId).valueChanges.subscribe(value => {
        this.markdownData = value;
      })
    }
  }

  showCheatSheet() {
    this.dialogService.openComponentDialog(MarkdownCheatSheetComponent, {
    });
  }
  
  public addImagesToMarkdown(insertionIndex: number, images: Array<File>):
    void {
    let fileReader: FileReader = new FileReader();
    for (let j: number = images.length - 1; j >= 0; j--) {
      fileReader.onload = () => {
        let imageReference: string = '![' + images[j].name + '](' + fileReader.
          result + ')';
        this.formGroup.get(this.fieldId).setValue(this.markdownData.substring(
          0, insertionIndex) + imageReference + this.markdownData.substring(
          insertionIndex));
      };
      fileReader.readAsDataURL(images[j]);
    }
  }
}  
