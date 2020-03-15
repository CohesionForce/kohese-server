import { DialogService } from './../../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../../services/item-repository/item-repository.service';
import { ItemProxy } from './../../../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../../../common/src/tree-configuration';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Optional, Inject } from '@angular/core';

import { TreeComponent } from '../../../../tree/tree.component';

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
    private dialogService: DialogService, private _itemRepository:
    ItemRepository) {
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
    this.dialogService.openComponentDialog(TreeComponent, {
      data: {
        root: TreeConfiguration.getWorkingTree().getRootProxy(),
        getChildren: (element: any) => {
          return (element as ItemProxy).children;
        },
        getText: (element: any) => {
          return (element as ItemProxy).item.name;
        },
        selection: [this.previewProxy],
        quickSelectElements: this._itemRepository.getRecentProxies()
      }
    }).updateSize('90%', '90%').afterClosed().subscribe((selection:
      Array<any>) => {
      if (selection) {
          this.previewProxy = selection[0];
      }
    });
  }
  
  public getRows(): Array<any> {
    if (this.previewProxy.model.item.name === this.property.propertyName.
      kind) {
      return this.previewProxy.item[this.property.propertyName.attribute];
    } else {
      let upstreamKindReferences: any = this.previewProxy.relations.
        referencedBy[this.property.propertyName.kind];
      if (upstreamKindReferences) {
        let upstreamKindAttributeReferences: Array<ItemProxy> =
          upstreamKindReferences[this.property.propertyName.attribute];
        if (upstreamKindAttributeReferences) {
          return upstreamKindAttributeReferences.map((itemProxy:
            ItemProxy) => {
            return { id: itemProxy.item.id };
          });
        }
      }
      
      return [];
    }
  }
}
