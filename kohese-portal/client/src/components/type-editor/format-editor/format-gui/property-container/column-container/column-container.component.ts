import { KoheseType } from './../../../../../../classes/UDT/KoheseType.class';
import { FormatContainer } from './../../../format-editor.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'column-container',
  templateUrl: './column-container.component.html',
  styleUrls: ['./column-container.component.css']
})
export class ColumnContainerComponent implements OnInit {
  @Input()
  container : FormatContainer;
  @Input()
  kind : KoheseType

  constructor() { }

  ngOnInit() {
  }

}
