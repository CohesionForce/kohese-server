import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit, Input, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { TreeComponent } from '../../tree/tree.component';

class Entry {
  get key() {
    return this._key;
  }
  
  get value() {
    return this._value;
  }
  
  public constructor(private _key: any, private _value: any) {
  }
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
  
  get changeDetectorRef() {
    return this._changeDetectorRef;
  }
  
  private _getSourceChildren: (element: any) => Array<any> = (element:
    any) => {
    let children: Array<any> = [];
    if (element == null) {
      let typeNames: Array<string> = Object.keys(this._dynamicTypesService.
        getKoheseTypes());
      for (let j: number = 0; j < typeNames.length; j++) {
        children.push(new Entry(typeNames[j], TreeConfiguration.
          getWorkingTree().getProxyFor(typeNames[j])));
      }
    } else {
      if (element.value instanceof ItemProxy) {
        let item: any = (element.value as ItemProxy).item;
        for (let j: number = 0; j < item.localTypes.length; j++) {
          children.push(new Entry(item.localTypes[j].name, item.localTypes[
            j]));
        }
        
        for (let attributeName in item.classProperties) {
          children.push(new Entry(attributeName, attributeName));
        }
      } else if (element.value instanceof Object) {
        for (let attributeName in element.value.properties) {
          children.push(new Entry(attributeName, attributeName));
        }
      }
    }
    
    return children;
  };
  get getSourceChildren() {
    return this._getSourceChildren;
  }
  
  private _getSourceText: (element: any) => string = (element: any) => {
    return (element as Entry).key;
  };
  get getSourceText() {
    return this._getSourceText;
  }
  
  private _getTargetChildren: (element: any) => Array<any> = (element:
    any) => {
    let children: Array<any> = [];
    if (element === this._copy) {
      let typeKeys: Array<string> = Object.keys(this._copy.types);
      for (let j: number = 0; j < typeKeys.length; j++) {
        children.push(new Entry(typeKeys[j], this._copy.types[typeKeys[j]]));
      }
    } else {
      if (element.value.localTypes) {
        let localTypeKeys: Array<string> = Object.keys(element.value.
          localTypes);
        for (let j: number = 0; j < localTypeKeys.length; j++) {
          children.push(new Entry(localTypeKeys[j], element.value.localTypes[
            localTypeKeys[j]]));
        }
      }
      
      if (element.value.attributes) {
        let attributeKeys: Array<string> = Object.keys(element.value.
          attributes);
        for (let j: number = 0; j < attributeKeys.length; j++) {
          children.push(new Entry(attributeKeys[j], element.value.attributes[
            attributeKeys[j]]));
        }
      }
    }
    
    return children;
  };
  get getTargetChildren() {
    return this._getTargetChildren;
  }
  
  private _getTargetText: (element: any) => string = (element: any) => {
    return (element as Entry).key;
  };
  get getTargetText() {
    return this._getTargetText;
  }
  
  get TreeConfiguration() {
    return TreeConfiguration;
  }
  
  @ViewChild('targetTree')
  private _targetTree: TreeComponent;
  
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
        types: {}
      };
      
      for (let typeName in this._dynamicTypesService.getKoheseTypes()) {
        this._copy.types[typeName] = {
          localTypes: {},
          attributes: {
            name: {
              linkToItem: false,
              showAttributeName: false
            },
            description: {
              showAttributeName: false
            }
          }
        };
      }
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
  
  public addToDocumentConfiguration(treePath: Array<any>): void {
    let types: any = this._copy.types;
    if (!types[treePath[0].key]) {
      types[treePath[0].key] = {
        localTypes: {
        },
        attributes: {
        }
      };
    }
    
    if (treePath.length > 1) {
      let typeValue: any = types[treePath[0].key];
      if (treePath[1].value instanceof Object) {
        if (!typeValue.localTypes[treePath[1].key]) {
          typeValue.localTypes[treePath[1].key] = {
            attributes: {
            }
          };
        }
        
        if (treePath.length > 2) {
          typeValue.localTypes[treePath[1].key].attributes[treePath[2].key] = {
            linkToItem: (treePath[2].key === 'name' ? false : undefined),
            showAttributeName: false
          };
        }
      } else {
        typeValue.attributes[treePath[1].key] = {
          linkToItem: (treePath[1].key === 'name' ? false : undefined),
          showAttributeName: false
        };
      }
    }
    
    this._copy.types = types;
    let expansionStates: Map<any, boolean> = this._targetTree.
      getExpansionStates();
    this._targetTree.update();
    this._targetTree.setExpansionStates(expansionStates);
    this._changeDetectorRef.markForCheck();
  }
  
  public removeAttribute(treePath: Array<any>): void {
    let types: any = this._copy.types;
    if (treePath.length > 1) {
      if (treePath.length > 2) {
        delete types[treePath[0].key].localTypes[treePath[1].key].attributes[
          treePath[2].key];
      } else {
        if (treePath[1].value.attributes) {
          delete types[treePath[0].key].localTypes[treePath[1].key];
        } else {
          delete types[treePath[0].key].attributes[treePath[1].key];
        }
      }
    } else {
      delete types[treePath[0].key];
    }
    
    let expansionStates: Map<any, boolean> = this._targetTree.
      getExpansionStates();
    this._targetTree.update();
    this._targetTree.setExpansionStates(expansionStates);
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
