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
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Other External Dependencies

// Kohese
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { TreeComponent } from '../../tree/tree.component';

@Component({
  selector: 'document-configuration-editor',
  templateUrl: './document-configuration-editor.component.html',
  styleUrls: ['./document-configuration-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentConfigurationEditorComponent implements OnInit {
  private _documentConfiguration: any;
  get documentConfiguration() {
    return this._documentConfiguration;
  }
  @Input('documentConfiguration')
  set documentConfiguration(documentConfiguration: any) {
    this._documentConfiguration = documentConfiguration;
  }

  private _copy: any;
  get copy() {
    return this._copy;
  }

  get TreeConfiguration() {
    return TreeConfiguration;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef:
    MatDialogRef<DocumentConfigurationEditorComponent>,
    private _dialogService: DialogService, private _itemRepository:
    ItemRepository) {
  }

  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._documentConfiguration = this._data[
        'documentConfiguration'];
    }

    if (this._documentConfiguration) {
      this._copy = JSON.parse(JSON.stringify(this.
        _documentConfiguration));
    } else {
      this._copy = {
        name: 'Document Configuration',
        description: '',
        tags: '',
        parentId: '',
        components: {},
        delineated: false
      };
    }
  }

  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }

  public openParentSelector(): void {
    this._dialogService.openComponentDialog(TreeComponent, {
      data: {
        root: TreeConfiguration.getWorkingTree().getRootProxy(),
        getChildren: (element: any) => {
          return (element as ItemProxy).children;
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
        selection: (this._copy.parentId ? [TreeConfiguration.getWorkingTree().
          getProxyFor(this._copy.parentId)] : [])
      }
    }).updateSize('80%', '80%').afterClosed().subscribe((selection:
      Array<any>) => {
      this._copy.parentId = selection[0].item.id;
      this._changeDetectorRef.markForCheck();
    });
  }

  public openComponentSelector(): void {
    let components: Array<ItemProxy> = [];
    for (let componentId in this._copy.components) {
      components.push(TreeConfiguration.getWorkingTree().getProxyFor(
        componentId));
    }

    this._dialogService.openComponentDialog(TreeComponent, {
      data: {
        root: TreeConfiguration.getWorkingTree().getRootProxy(),
        getChildren: (element: any) => {
          return (element as ItemProxy).children;
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
        allowMultiselect: true,
        selection: components
      }
    }).updateSize('80%', '80%').afterClosed().subscribe((selection:
      Array<any>) => {
      if (selection) {
        let ids: Array<string> = selection.map((itemProxy: ItemProxy) => {
          return itemProxy.item.id;
        });
        let intermediateObject: any = {};
        for (let j: number = 0; j < ids.length; j++) {
          let componentSettings: any = this._copy.components[ids[j]];
          if (!componentSettings) {
            componentSettings = {
              includeDescendants: true
            };
          }

          intermediateObject[ids[j]] = componentSettings;
        }

        for (let componentId in this._copy.components) {
          delete this._copy.components[componentId];
        }

        for (let componentId in intermediateObject) {
          this._copy.components[componentId] = intermediateObject[componentId];
        }

        this._changeDetectorRef.markForCheck();
      }
    });
  }

  public close(accept: boolean): void {
    if (accept) {
      if (!this._documentConfiguration) {
        this._documentConfiguration = {};
      }

      for (let attributeName in this._copy) {
        this._documentConfiguration[attributeName] = this._copy[
          attributeName];
      }
    }

    this._matDialogRef.close(accept ? this._documentConfiguration :
      undefined);
  }
}
