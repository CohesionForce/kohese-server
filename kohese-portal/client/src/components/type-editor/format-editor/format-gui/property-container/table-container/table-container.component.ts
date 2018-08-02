import { FormatContainer } from './../../../format-editor.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'table-container',
  templateUrl: './table-container.component.html',
  styleUrls: ['./table-container.component.css']
})
export class TableContainerComponent implements OnInit {
  @Input()
  container : FormatContainer;

  constructor() { }

  ngOnInit() {
  }

}
