import { MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Optional, Inject } from '@angular/core';
import { ItemProxy } from '../../../../../../../common/src/item-proxy';

@Component({
  selector: 'export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss']
})
export class ExportDialogComponent implements OnInit {
  exportedProxies : Array<ItemProxy>;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data: any) {
    this.exportedProxies = data.exportedProxies;
    console.log(this.exportedProxies);
  }

  ngOnInit() {
  }

}
