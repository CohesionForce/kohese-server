import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';

import * as ItemProxy from '../../../../../../common/src/item-proxy';

import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'proxy-selector-dialog',
  templateUrl : './proxy-selector-dialog.component.html'
})
export class ProxySelectorDialogComponent implements OnInit, OnDestroy {
  /* Data */
  selectedProxy : ItemProxy


  constructor (private dialogRef : MatDialogRef<ProxySelectorDialogComponent>) {
    
  }

  ngOnInit () {

  }

  ngOnDestroy () {

  }

  onProxySelected (newProxy) {
    this.selectedProxy = newProxy;
    console.log('onProxySelected - dialog')
  }

  selectProxy () {
    this.dialogRef.close(this.selectedProxy);
    console.log('selectProxy - dialog')
  }

  closeDialog () {
    this.dialogRef.close();
    console.log('closeDialog - dialog');
  }
}