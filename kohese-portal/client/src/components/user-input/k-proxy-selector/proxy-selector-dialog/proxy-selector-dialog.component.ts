import { Component, OnInit, OnDestroy, Input, Output, Inject, Optional } from '@angular/core';

import * as ItemProxy from '../../../../../../common/src/item-proxy';

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
    this.selected = data.selected;
  }

  ngOnInit () {

  }

  ngOnDestroy () {

  }

  onProxySelected (newSelection) {
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