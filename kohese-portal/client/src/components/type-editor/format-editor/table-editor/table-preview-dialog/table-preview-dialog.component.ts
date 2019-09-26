import { DialogService } from './../../../../../services/dialog/dialog.service';
import { ItemProxy } from './../../../../../../../common/src/item-proxy';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Optional, Inject } from '@angular/core';
import { ProxySelectorDialogComponent } from '../../../../user-input/k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';

@Component({
  selector: 'table-preview-dialog',
  templateUrl: './table-preview-dialog.component.html',
  styleUrls: ['./table-preview-dialog.component.scss']
})
export class TablePreviewDialogComponent implements OnInit {
  previewProxy: ItemProxy;
  tableDefinition;
  property;


  constructor(private dialogRef: MatDialogRef<TablePreviewDialogComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
              private dialogService: DialogService) {
                this.tableDefinition = data.tableDef;
                this.property = data.property;
               }

  ngOnInit() {
    console.log(this);
  }

  close() {
    this.dialogRef.close();
  }

  openProxySelection() {
    this.dialogService.openComponentDialog(ProxySelectorDialogComponent, {
      data : {
        selected : this.previewProxy
      }
    }).updateSize('70%', '70%')
      .afterClosed()
      .subscribe((newSelection) => {
        if (newSelection) {
          this.previewProxy = newSelection;
        }
      });
  }

}
