import { FormatContainer } from './../../../../FormatContainer.interface';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'table-container',
  templateUrl: './table-container.component.html',
  styleUrls: ['./table-container.component.scss']
})
export class TableContainerComponent implements OnInit {
  @Input()
  container : FormatContainer;
  @Input()
  kind : any
  
  private _isDisabled: boolean = false;
  get isDisabled() {
    return this._isDisabled;
  }
  @Input('disabled')
  set isDisabled(isDisabled: boolean) {
    this._isDisabled = isDisabled;
  }

  constructor() { }

  ngOnInit() {
  }

}
