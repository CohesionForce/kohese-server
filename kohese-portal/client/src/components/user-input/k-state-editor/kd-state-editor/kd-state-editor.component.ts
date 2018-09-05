import { ItemProxy } from './../../../../../../common/src/item-proxy';
import { PropertyDefinition } from './../../../type-editor/format-editor/format-editor.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'kd-state-editor',
  templateUrl: './kd-state-editor.component.html',
  styleUrls: ['./kd-state-editor.component.scss']
})
export class KdStateEditorComponent implements OnInit {
  @Input()
  property: PropertyDefinition;
  @Input()
  editable: boolean;
  @Input()
  proxy: ItemProxy;
  @Input()
  container : string;
  constructor() { }

  ngOnInit() {
    console.log(this);
  }

}
