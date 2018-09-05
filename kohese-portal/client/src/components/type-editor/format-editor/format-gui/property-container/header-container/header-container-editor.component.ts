import { PropertyDefinition } from '../../../format-editor.component';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'header-container-editor',
  templateUrl: './header-container-editor.component.html',
  styleUrls: ['./header-container-editor.component.scss']
})
export class HeaderContainerEditorComponent implements OnInit {
  @Input()
  header : PropertyDefinition;
  @Input()
  kind;

  constructor() { }

  ngOnInit() {
    console.log(this.header);
  }

}
