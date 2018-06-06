import { MAT_DIALOG_DATA } from '@angular/material';
import { Input, Inject, ViewChild } from '@angular/core';
import { ItemProxy } from './../../../../../../../../common/src/item-proxy';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'state-summary-dialog',
  templateUrl: './state-summary-dialog.component.html',
  styleUrls: ['./state-summary-dialog.component.scss']
})
export class StateSummaryDialogComponent implements OnInit {
  @Input()
  stateInfo : any;
  @ViewChild('proxyTable') table;
  color;

  proxies : Array<ItemProxy>;

  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
    this.stateInfo = data.stateInfo;
    this.color = data.kindColor;
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
