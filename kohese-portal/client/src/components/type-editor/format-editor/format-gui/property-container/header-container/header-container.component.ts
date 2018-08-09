import { PropertyDefinition } from './../../../format-editor.component';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'header-container',
  templateUrl: './header-container.component.html',
  styleUrls: ['./header-container.component.scss']
})
export class HeaderContainerComponent implements OnInit {
  @Input()
  header : PropertyDefinition;
  @Input()
  kind;

  constructor() { }

  ngOnInit() {
    console.log(this.header);
  }

}
