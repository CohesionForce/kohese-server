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
import { Component, OnInit, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Other External Dependencies

// Kohese
import { DialogService } from './../../../../../services/dialog/dialog.service';
import { ItemProxy } from './../../../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../../../common/src/tree-configuration';
import { TreeComponent } from '../../../../tree/tree.component';
import { TreeService } from '../../../../../services/tree/tree.service';

@Component({
  selector: 'table-preview-dialog',
  templateUrl: './table-preview-dialog.component.html',
  styleUrls: ['./table-preview-dialog.component.scss']
})
export class TablePreviewDialogComponent implements OnInit {
  previewProxy: ItemProxy;
  tableDefinition;
  property;


  constructor(
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<TablePreviewDialogComponent>,
              private dialogService: DialogService,
              private treeService: TreeService
  ) {
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
        getTitle: {
          action: 'Select an Item',
          name: ''
        },
        getChildren: (element: any) => {
          return (element as ItemProxy).children;
        },
        getParent: (element: any) => {
          return (element as ItemProxy).parentProxy;
        },
        getText: (element: any) => {
          return (element as ItemProxy).item.name;
        },
        getIcon: (element: any) => {
          return (element as ItemProxy).model.view.item.icon;
        },
        isFavorite: (element: any) => {
          return (
            (element as ItemProxy).item.favorite ? (element as ItemProxy).item.favorite : false);
        },
        selection: [this.previewProxy],
        quickSelectElements: this.treeService.getRecentProxies()
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
