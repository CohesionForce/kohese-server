import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { AttributeEditorComponent } from '../attribute-editor/attribute-editor.component';

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
      data: {},
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
  
  public editAttribute(attributeName: string): void {
    this._dialogService.openComponentDialog(AttributeEditorComponent, {
      data: {
        attributeName: attributeName,
        attribute: this._type.properties[attributeName],
        view: this._view.viewProperties[attributeName]
      },
      disableClose: true
    }).updateSize('80%', '80%').afterClosed().subscribe((returnedObject:
      any) => {
      this._changeDetectorRef.markForCheck();
    });
  }
  
  public removeAttribute(attributeName: string): void {
    delete this._type.properties[attributeName];
    delete this._view.viewProperties[attributeName];
    this._changeDetectorRef.markForCheck();
  }
}