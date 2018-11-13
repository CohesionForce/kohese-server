import { TablePreviewProxyDialogComponent } from './table-preview-proxy-dialog/table-preview-proxy-dialog.component';
import { DialogService } from './../../../../../services/dialog/dialog.service';
import { ItemProxy } from './../../../../../../../common/src/item-proxy';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Optional, Inject } from '@angular/core';

@Component({
  selector: 'table-preview-dialog',
  templateUrl: './table-preview-dialog.component.html',
  styleUrls: ['./table-preview-dialog.component.scss']
})
export class TablePreviewDialogComponent implements OnInit {
  previewProxy: ItemProxy;

  constructor(private dialogRef: MatDialogRef<TablePreviewDialogComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
              private dialogService: DialogService) { }

  ngOnInit() {
    console.log(this);
  }

  close() {
    this.dialogRef.close();
  }

  openProxySelection() {
    this.dialogService.openComponentDialog(TablePreviewProxyDialogComponent, {
      data : {
        selected : this.previewProxy
      }
    }).updateSize('50%', '50%')
      .afterClosed()
      .subscribe((newSelection) => {
        if (newSelection) {
          this.previewProxy = newSelection;
        }
      });
  }

}
