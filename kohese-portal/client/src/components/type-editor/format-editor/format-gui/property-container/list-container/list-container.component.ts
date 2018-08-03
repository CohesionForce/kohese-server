import { KoheseType } from './../../../../../../classes/UDT/KoheseType.class';
import { Component, OnInit, Input } from '@angular/core';
import { FormatContainer } from '../../../format-editor.component';

@Component({
  selector: 'list-container',
  templateUrl: './list-container.component.html',
  styleUrls: ['./list-container.component.css']
})
export class ListContainerComponent implements OnInit {
  @Input()
  container : FormatContainer;
  @Input()
  kind : KoheseType

  constructor() { }

  ngOnInit() {
  }

  addRow() {
    this.container.contents.push({
      propertyName : '',
      hideLabel : false
    })
  }

}
