import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { PropertyFormat } from '../../../../report-generator/report-generator.component';

@Component({
  selector: 'list-container',
  templateUrl: './list-container.component.html',
  styleUrls: ['./list-container.component.scss']
})
export class ListContainerComponent implements OnInit {
  @Input()
  editable : boolean = false;
  @Input()
  contents : Array<PropertyFormat>;
  @Input()
  proxy

  constructor() { }

  ngOnInit() {

  }

}

/*

 export interface FormatContainer {
  kind : string,
  contents : Array<PropertyDefinition>
}

export interface PropertyDefinition {
  propertyName : string,
  hideLabel : boolean
  // Will grow as we get to the property part
}
*/
