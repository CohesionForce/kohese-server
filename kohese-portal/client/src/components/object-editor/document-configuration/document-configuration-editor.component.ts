import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { TreeComponent } from '../../tree/tree.component';

enum MoveDirection {
  UP, DOWN
}

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
  
  get Object() {
    return Object;
  }
  
  get TreeConfiguration() {
    return TreeConfiguration;
  }
  
  get MoveDirection() {
    return MoveDirection;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef:
    MatDialogRef<DocumentConfigurationEditorComponent>,
    private _dynamicTypesService: DynamicTypesService, private _itemRepository:
    ItemRepository, private _dialogService: DialogService) {
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
        tags: [],
        parentId: '',
        components: {}
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
        allowMultiselect: true,
        selection: components
      }
    }).updateSize('80%', '80%').afterClosed().subscribe((selection:
      Array<any>) => {
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
    });
  }
  
  public canMove(moveDirection: MoveDirection, componentId: string): boolean {
    let componentIds: Array<string> = Object.keys(this._copy.components);
    if (moveDirection === MoveDirection.UP) {
      return (componentIds.indexOf(componentId) !== 0);
    } else {
      return (componentIds.indexOf(componentId) !== (componentIds.length - 1));
    }
  }
  
  public move(moveDirection: MoveDirection, componentId: string): void {
    let intermediateObject: any = {};
    let componentIds: Array<string> = Object.keys(this._copy.components);
    let candidateIndex: number = componentIds.indexOf(componentId);
    componentIds.splice(candidateIndex, 1);
    if (moveDirection === MoveDirection.UP) {
      componentIds.splice(candidateIndex - 1, 0, componentId);
    } else {
      componentIds.splice(candidateIndex + 1, 0, componentId);
    }
    
    for (let j: number = 0; j < componentIds.length; j++) {
      intermediateObject[componentIds[j]] = this._copy.components[componentIds[
        j]];
      delete this._copy.components[componentIds[j]];
    }
    
    for (let id in intermediateObject) {
      this._copy.components[id] = intermediateObject[id];
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public removeSelection(componentId: string): void {
    delete this._copy.components[componentId];
    this._changeDetectorRef.markForCheck();
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
