import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { AttributeEditorComponent } from '../attribute-editor/attribute-editor.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';

@Component({
  selector: 'local-type-editor',
  templateUrl: './local-type-editor.component.html',
  styleUrls: ['./local-type-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalTypeEditorComponent implements OnInit {
  private _type: any;
  get type() {
    return this._type;
  }
  @Input('type')
  set type(type: any) {
    this._type = type;
  }
  
  private _containingType: any;
  get containingType() {
    return this._containingType;
  }
  @Input('containingType')
  set containingType(containingType: any) {
    this._containingType = containingType;
  }
  
  private _view: any;
  get view() {
    return this._view;
  }
  @Input('view')
  set view(view: any) {
    this._view = view;
  }
  
  get data() {
    return this._data;
  }
  
  get dynamicTypesService() {
    return this._dynamicTypesService;
  }
  
  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    private _changeDetectorRef: ChangeDetectorRef, private _dialogService:
    DialogService, private _dynamicTypesService: DynamicTypesService) {
  }
  
  public ngOnInit(): void {
    if (this._data) {
      if (this._data['type']) {
        this._type = this._data['type'];
      }
      
      if (this._data['containingType']) {
        this._containingType = this._data['containingType'];
      }
      
      if (this._data['view']) {
        this._view = this._data['view'];
      }
    }
    
    if (!this._type) {
      this._type = {
        name: '',
        properties: {}
      };
      
      if (!this._containingType) {
        this._type['base'] = 'Item';
        this._type['parentId'] = 'Item';
        this._type['idInjection'] = false;
        this._type['validations'] = [];
        this._type['relations'] = {};
        this._type['acls'] = [];
        this._type['methods'] = [];
      }
    }
    
    if (!this._view) {
      this._view = {
        modelName: '',
        viewProperties: {},
        formatDefinitions: {}
      };
      
      if (!this._containingType) {
        this._view.modelName = 'Item';
      }
    }
  }
  
  public addLocalType(): void {
    this._dialogService.openComponentDialog(LocalTypeEditorComponent, {
      data: {
        containingType: this._type
      },
      disableClose: true
    }).updateSize('90%', '90%').afterClosed().subscribe((localType: any) => {
      if (localType) {
        this._type.localTypes.push(localType);
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public editLocalType(localType: any): void {
    this._dialogService.openComponentDialog(LocalTypeEditorComponent, {
      data: {
        type: localType,
        containingType: this._type
      },
      disableClose: true
    }).updateSize('90%', '90%').afterClosed().subscribe((returnedLocalType:
      any) => {
      this._changeDetectorRef.markForCheck();
    });
  }
  
  public removeLocalType(localType: any): void {
    this._dialogService.openYesNoDialog('Remove ' + localType.name,
      'Are you sure that you want to remove ' + localType.name + '?').
      subscribe((selection: any) => {
      if (selection) {
        let localTypes: Array<any> = this._type.localTypes;
        localTypes.splice(localTypes.indexOf(localType), 1);
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public addAttribute(): void {
    this._dialogService.openComponentDialog(AttributeEditorComponent, {
      data: {
        type: this._type
      },
      disableClose: true
    }).updateSize('80%', '80%').afterClosed().subscribe((returnedObject:
      any) => {
      if (returnedObject) {
        this._type.properties[returnedObject.attributeName] = returnedObject.
          attribute;
        this._view.viewProperties[returnedObject.attributeName] =
          returnedObject.view;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public mayEditAttribute(attributeName: string): Promise<boolean> {
    let koheseType: KoheseType;
    let localType: any;
    let koheseTypes: Array<KoheseType> = Object.values(this.
      _dynamicTypesService.getKoheseTypes());
    for (let j: number = 0; j < koheseTypes.length; j++) {
      if (koheseTypes[j].dataModelProxy.item === this._type) {
        koheseType = koheseTypes[j];
        break;
      } else {
        let localTypes: Array<any> = koheseTypes[j].dataModelProxy.item.
          localTypes;
        for (let k: number = 0; k < localTypes.length; k++) {
          if (localTypes[k] === this._type) {
            koheseType = koheseTypes[j];
            localType = localTypes[k];
            break;
          }
        }
      }
    }
    
    let itemProxys: Array<ItemProxy> = [];
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(undefined,
      (itemProxy: ItemProxy) => {
      if (itemProxy.kind === koheseType.dataModelProxy.item.name) {
        if (localType) {
          let attributes: any = koheseType.dataModelProxy.item.properties;
          for (let globalTypeAttributeName in attributes) {
            let attributeType: string;
            if (Array.isArray(attributes[globalTypeAttributeName].type)) {
              attributeType = attributes[globalTypeAttributeName].type[0];
            } else {
              attributeType = attributes[globalTypeAttributeName].type;
            }
            
            if ((attributeType === localType.name) && itemProxy.item[
              globalTypeAttributeName] && (itemProxy.item[
              globalTypeAttributeName][attributeName] != null)) {
              itemProxys.push(itemProxy);
            }
          }
        } else {
          if (itemProxy.item[attributeName] != null) {
            itemProxys.push(itemProxy);
          }
        }
      }
    });
    
    if (itemProxys.length > 0) {
      let message: string = 'The following Items prevent modification ' +
        'of ' + attributeName + ':\n';
      for (let j: number = 0; j < itemProxys.length; j++) {
        message += '\n\t- ';
        message += itemProxys[j].item.name;
      }
      return this._dialogService.openInformationDialog(
        attributeName + ' Modification Prevented', message).toPromise().then(() => {
        return false;  
      });
    } else {
      return Promise.resolve(true);
    }
  }
  
  public async editAttribute(attributeName: string): Promise<void> {
    this._dialogService.openComponentDialog(AttributeEditorComponent, {
      data: {
        attributeName: attributeName,
        attribute: this._type.properties[attributeName],
        type: this._type,
        view: this._view.viewProperties[attributeName],
        editable: await this.mayEditAttribute(attributeName)
      },
      disableClose: true
    }).updateSize('80%', '80%').afterClosed().subscribe((returnedObject:
      any) => {
      if (attributeName !== returnedObject.attributeName) {
        delete this._type.properties[attributeName];
        this._type.properties[returnedObject.attributeName] = returnedObject.
          attribute;
        delete this._view.viewProperties[attributeName];
        this._view.viewProperties[returnedObject.attributeName] =
          returnedObject.view;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public async removeAttribute(attributeName: string): Promise<void> {
    if (await this.mayEditAttribute(attributeName)) {
      delete this._type.properties[attributeName];
      delete this._view.viewProperties[attributeName];
      this._changeDetectorRef.markForCheck();
    }
  }
}