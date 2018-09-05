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
  proxy: ItemProxy
  @Input()
  container : string;

  constructor(private dialogService : DialogService) { }

  ngOnInit() {
  }

  showCheatSheet() {
    this.dialogService.openComponentDialog(MarkdownCheatSheetComponent, {
    });
  }

}
