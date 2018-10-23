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

  copyToClipboard(items) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      console.log(items, e);
      let string = "";
      for (let item of items) {
        let newString = this.origin + item.item.id + "\r" +
                        "Name: " + item.item.name  + "\r" +
                        "Kind: " + item.kind + "\r" +
                        "State: " + item.state + "\r" +
                        "Assigned To: " + item.item.assignedTo + "\r\r"
        string += newString;
      }
      console.log(string);
      e.clipboardData.setData('text/plain', (string));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }

}
