import { KoheseType } from './../../../../../../classes/UDT/KoheseType.class';
import { FormatContainer } from './../../../format-editor.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'column-container-editor',
  templateUrl: './column-container-editor.component.html',
  styleUrls: ['./column-container-editor.component.scss']
})
export class ColumnContainerEditorComponent implements OnInit {
  @Input()
  container : FormatContainer;
  @Input()
  kind : KoheseType

  constructor() { }

  ngOnInit() {
  }

}
