import { MAT_DIALOG_DATA } from '@angular/material';
import { Input, Inject, ViewChild } from '@angular/core';
import { ItemProxy } from './../../../../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../../../../common/src/tree-configuration';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'state-summary-dialog',
  templateUrl: './state-summary-dialog.component.html',
  styleUrls: ['./state-summary-dialog.component.scss']
})
export class StateSummaryDialogComponent implements OnInit {
  private _proxies: Array<ItemProxy>;
  get proxies() {
    return this._proxies;
  }
  @Input('proxies')
  set proxies(proxies: Array<ItemProxy>) {
    this._proxies = proxies;
  }
  
  @ViewChild('proxyTable') table;
  color;
  
  private _kindName: string;
  get kindName() {
    return this._kindName;
  }
  @Input('kindName')
  set kindName(kindName: string) {
    this._kindName = kindName;
  }
  
  private _stateName: string;
  get stateName() {
    return this._stateName;
  }
  @Input('stateName')
  set stateName(stateName: string) {
    this._stateName = stateName;
  }

  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
    if (this.data) {
      this._proxies = data.proxies;
      this._kindName = data.kindName;
      this._stateName = data.stateName;
      this.color = TreeConfiguration.getWorkingTree().getProxyFor(
        'view-' + this._kindName.toLowerCase()).item.color;
    }
  }

  ngOnInit() {

  }

  toggleExpandRow(row) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event) {
    console.log('Detail Toggled', event);
  }

}
