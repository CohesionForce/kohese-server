/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, OnInit, OnDestroy, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Other External Dependencies
import * as $ from 'jquery'

// Kohese
import { ItemProxy } from '../../../../../../common/src/item-proxy';

@Component({
  selector: 'proxy-selector-dialog',
  templateUrl : './proxy-selector-dialog.component.html',
  styleUrls: ['./proxy-selector-dialog.component.scss']
})
export class ProxySelectorDialogComponent implements OnInit, OnDestroy {
  /* Data */
  selected: any;
  multiSelect: boolean;
  proxyContext: ItemProxy;


  constructor (private dialogRef: MatDialogRef<ProxySelectorDialogComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) private data: any ) {
    this.multiSelect = data.allowMultiSelect;
    this.proxyContext = data.proxyContext;
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

  onProxySelected (newSelection: any) {
    this.selected = newSelection;
    console.log('onProxySelected - dialog');
  }

  selectProxy () {
    this.dialogRef.close(this.selected);
    console.log('selectProxy - dialog');
  }

  closeDialog () {
    this.dialogRef.close();
    console.log('closeDialog - dialog');
  }
}
