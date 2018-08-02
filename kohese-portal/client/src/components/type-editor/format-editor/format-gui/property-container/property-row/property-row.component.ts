import { Component, OnInit, Input } from '@angular/core';
import { PropertyDefinition } from '../../../format-editor.component';

@Component({
  selector: 'property-row',
  templateUrl: './property-row.component.html',
  styleUrls: ['./property-row.component.css']
})
export class PropertyRowComponent implements OnInit {
  @Input()
  property : PropertyDefinition;

  constructor() { }

  ngOnInit() {
  }

}
