import { ColumnContainer } from './../../../../type-editor/format-editor/format-gui/property-container/column-container-editor/column-container-editor.component';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';

import { ItemProxy } from '../../../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../../../common/src/tree-configuration';

@Component({
  selector: 'column-container',
  templateUrl: './column-container.component.html',
  styleUrls: ['./column-container.component.scss']
})
export class ColumnContainerComponent implements OnInit {
  @Input()
  editable = false;
  @Input()
  columns: Array<ColumnContainer>;
  @Input()
  proxy;
  @Input()
  numColumns: number;
  
  private _usernames: Array<string> = [];
  get usernames() {
    return this._usernames;
  }

  constructor() { }

  ngOnInit() {
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree({
      includeOrigin: false
    }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'KoheseUser') {
        this._usernames.push(itemProxy.item.name);
      }
    });
    this._usernames.sort();
  }

  stateChanged(stateName, value) {
    this.proxy.item[stateName] = value;
  }


}
