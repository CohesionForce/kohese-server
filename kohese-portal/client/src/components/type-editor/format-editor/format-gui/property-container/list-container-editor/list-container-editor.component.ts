import { KoheseType } from './../../../../../../classes/UDT/KoheseType.class';
import { Component, OnInit, Input } from '@angular/core';
import { FormatContainer } from '../../../format-editor.component';

@Component({
  selector: 'list-container-editor',
  templateUrl: './list-container-editor.component.html',
  styleUrls: ['./list-container-editor.component.scss']
})
export class ListContainerEditorComponent implements OnInit {
  @Input()
  container : FormatContainer;
  @Input()
  kind : KoheseType

  constructor() { }

  ngOnInit() {
    console.log(this.container.contents);
  }

  addRow() {
    this.container.contents.push({
      propertyName : '',
      hideLabel : false
    })
  }

}
