import { Router } from '@angular/router';
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
  origin;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data: any,
              private router : Router) {
    this.exportedProxies = data.exportedProxies;
    this.origin = location.origin + '/explore;id='
    console.log(this.exportedProxies);
  }

  ngOnInit() {
  }

}
