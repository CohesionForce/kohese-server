import { Component, OnInit, OnDestroy, Input, Output, Inject, Optional } from '@angular/core';

import { ItemProxy } from '../../../../../../common/src/item-proxy';
import * as $ from 'jquery'

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'proxy-selector-dialog',
  templateUrl : './proxy-selector-dialog.component.html'
})
export class ProxySelectorDialogComponent implements OnInit, OnDestroy {
  /* Data */
  selected : any
  multiSelect : boolean;


  constructor (private dialogRef : MatDialogRef<ProxySelectorDialogComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) private data: any,) {
    this.multiSelect = data.allowMultiSelect;
    if (this.multiSelect) {
      this.selected = $.extend(true, [], data.selected);
    } else {
      this.selected = data.selected;
    }
  }

  ngOnInit () {

  }

  ngOnDestroy () {

  }

  onProxySelected (newSelection : any) {
    this.selected = newSelection;
    console.log('onProxySelected - dialog')
  }

  selectProxy () {
    this.dialogRef.close(this.selected);
    console.log('selectProxy - dialog')
  }

  closeDialog () {
    this.dialogRef.close();
    console.log('closeDialog - dialog');
  }
}
