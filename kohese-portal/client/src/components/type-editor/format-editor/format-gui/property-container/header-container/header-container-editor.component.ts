import { FormatContainer } from './../../../../FormatContainer.interface';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'header-container-editor',
  templateUrl: './header-container-editor.component.html',
  styleUrls: ['./header-container-editor.component.scss']
})
export class HeaderContainerEditorComponent implements OnInit {
  @Input()
  header : FormatContainer;
  @Input()
  kind;
  
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
    console.log(this, 'header');
  }

}
