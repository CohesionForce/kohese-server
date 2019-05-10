import { MarkdownCheatSheetComponent } from './../markdown-cheat-sheet.component';
import { PropertyDefinition } from './../../../type-editor/format-editor/format-editor.component';
import { Input } from '@angular/core';
import { ItemProxy } from './../../../../../../common/src/item-proxy';
import { Component, OnInit } from '@angular/core';
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

  constructor(private dialogService : DialogService) { }

  ngOnInit() {
    console.log(this);
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
        let markdown: string = this.proxy.item[this.property.propertyName];
        this.proxy.item[this.property.propertyName] = (markdown.substring(0,
          insertionIndex) + imageReference + markdown.substring(
          insertionIndex));
      };
      fileReader.readAsDataURL(images[j]);
    }
  }
}
