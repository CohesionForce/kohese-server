import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  Optional, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { StateMachineEditorComponent } from '../../state-machine-editor/state-machine-editor.component';

@Component({
  selector: 'attribute-editor',
  templateUrl: './attribute-editor.component.html',
  styleUrls: ['./attribute-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributeEditorComponent implements OnInit {
  private _attributeName: string = '';
  get attributeName() {
    return this._attributeName;
  }
  @Input('attributeName')
  set attributeName(attributeName: string) {
    this._attributeName = attributeName;
    this._attribute.name = this._attributeName;
    this._view.name = this._attributeName;
  }
  
  private _attribute: any = {
    name: this._attributeName,
    type: 'boolean',
    required: false,
    id: false
  };
  get attribute() {
    return this._attribute;
  }
  @Input('attribute')
  set attribute(attribute: any) {
    this._attribute = attribute;
  }
  
  private _type: any;
  get type() {
    return this._type;
  }
  @Input('type')
  set type(type: any) {
    this._type = type;
  }
  
  private _view: any  = {
    name: this._attributeName,
    displayName: this._attributeName,
    inputType: {
      type: 'boolean',
      options: {}
    }
  };
  get view() {
    return this._view;
  }
  @Input('view')
  set view(view: any) {
    this._view = view;
  }
  
  private _editable: boolean = true;
  get editable() {
    return this._editable;
  }
  @Input('editable')
  set editable(editable: boolean) {
    this._editable = editable;
  }
  
  get dynamicTypesService() {
    return this._dynamicTypesService;
  }
  
  private _idAttributes: any = {};
  get idAttributes() {
    return this._idAttributes;
  }
  
  get data() {
    return this._data;
  }
  
  private _fundamentalTypes: any = {
    'Boolean': 'boolean',
    'Number': 'number',
    'Text': 'string',
    'State': 'StateMachine',
    'Timestamp': 'timestamp',
    'Username': 'user-selector'
  };
  get fundamentalTypes() {
    return this._fundamentalTypes;
  }
  
  private _displayTypes: any = {
    'boolean': {
      'Boolean': 'boolean'
    },
    'number': {
      'Number': 'number'
    },
    'string': {
      'Text': 'text',
      'Markdown': 'markdown'
    },
    'StateMachine': {
      'State': 'state-editor'
    },
    'timestamp': {
      'Date': 'date'
    },
    'user-selector': {
      'Username': 'user-selector'
    }
  };
  
  private _attributeTypes: any = JSON.parse(JSON.stringify(this.
    _fundamentalTypes));
  get attributeTypes() {
    return this._attributeTypes;
  }
  
  get Array() {
    return Array;
  }
  
  get Object() {
    return Object;
  }
  
  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<AttributeEditorComponent>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dynamicTypesService: DynamicTypesService, private _dialogService:
    DialogService) {
  }
  
  public ngOnInit(): void {
    if (this._data) {
      this._type = this._data['type'];
      if (this._data['attribute']) {
        this._attributeName = this._data['attributeName'];
        this._attribute = this._data['attribute'];
        this._view = this._data['view'];
      }
      
      if (this._data['editable'] === false) {
        this._editable = false;
      }
    }
    
    let koheseTypes: any = this._dynamicTypesService.getKoheseTypes();
    for (let typeName in koheseTypes) {
      this._attributeTypes[typeName] = typeName;
      let koheseType: KoheseType = koheseTypes[typeName];
      for (let attributeName in koheseType.dataModelProxy.item.properties) {
        let attribute: any = koheseType.dataModelProxy.item.properties[
          attributeName];
        if (attribute.id) {
          if (!this._idAttributes[typeName]) {
            this._idAttributes[typeName] = [];
          }

          this._idAttributes[typeName].push(attributeName);
        }
      }
      
      if (koheseType.dataModelProxy.item === this._type) {
        for (let localTypeName in this._type.localTypes) {
          this._attributeTypes[localTypeName] = localTypeName;
        }
      }
    }
  }
  
  public typeSelected(attributeType: string): void {
    if (Array.isArray(this._attribute.type)) {
      this._attribute.type = [attributeType];
    } else {
      this._attribute.type = attributeType;
    }
    
    if (this._attribute.type === 'string') {
      this._attribute.default = '';
    } else {
      delete this._attribute.default;
    }
    
    if (Object.values(this._fundamentalTypes).indexOf(attributeType) === -1) {
      if (!this._attribute.relation) {
        this._attribute.relation = {
          kind: 'Item',
          foreignKey: 'id'
        };
      }
      
      this._view.inputType.type = '';
    } else {
      delete this._attribute.relation;
      
      if (attributeType === 'string') {
        this._view.inputType.type = 'text';
      } else if (attributeType === 'timestamp') {
        this._view.inputType.type = 'date';
      } else {
        this._view.inputType.type = attributeType;
      }
    }
  }
  
  public openStateMachineEditor(): void {
    let stateMachine: any = this._attribute.properties;
    if (stateMachine) {
      stateMachine = JSON.parse(JSON.stringify(stateMachine));
    } else {
      stateMachine = {
        state: {},
        transition: {}
      };
    }

    this._dialogService.openComponentDialog(StateMachineEditorComponent, {
      data: {
        stateMachine: stateMachine,
        defaultState: this._attribute.default
      }
    }).updateSize('70%', '70%').afterClosed().subscribe((data: any) => {
      if (data) {
        this._attribute.properties = data.stateMachine;
        this._attribute.default = data.defaultState;
      }
    });
  }
  
  public areTypesSame(option: any, selection: any): boolean {
    let selectionType: any;
    if (Array.isArray(selection)) {
      selectionType = selection[0];
    } else {
      selectionType = selection;
    }

    return (option === selectionType);
  }
  
  public parseType(attributeType: any): string {
    let type: string;
    if (Array.isArray(attributeType)) {
      type = attributeType[0];
    } else {
      type = attributeType;
    }
    
    return type;
  }
  
  public areRelationsEqual(option: any, selection: any): boolean {
    return ((option.kind === selection.kind) && (option.foreignKey ===
      selection.foreignKey));
  }
  
  public getTypes(): Array<string> {
    let dataModelType: string = (Array.isArray(this._attribute.type) ? this.
      _attribute.type[0] : this._attribute.type);
    if ((dataModelType === 'string') && this._attribute.relation) {
      return Object.keys(this._displayTypes['user-selector']);
    } else if (this._displayTypes[dataModelType]) {
      return Object.keys(this._displayTypes[dataModelType]);
    } else {
      return ['Reference'];
    }
  }
  
  public getTypeValue(type: string): string {
    if (type === 'Reference') {
      return '';
    } else {
      if ((type === Object.keys(this._displayTypes['user-selector'])[0]) &&
        this._attribute.relation) {
        return 'user-selector';
      } else {
        return this._displayTypes[(Array.isArray(this._attribute.type) ? this.
          _attribute.type[0] : this._attribute.type)][type];
      }
    }
  }
  
  public areTypeValuesEqual(option: string, selection: string): boolean {
    if ((option === '') && (selection === 'proxy-selector')) {
      return true;
    } else if ((option === 'state-editor') && (selection === 'StateMachine')) {
      return true;
    } else {
      return (option === selection);
    }
  }
  
  public toggleMultivaluedness(): void {
    let type: any = this._attribute.type;
    if (Array.isArray(type)) {
      type = type[0];
      if (type === 'string') {
        this._attribute.default = '';
      }
    } else {
      type = [type];
      delete this._attribute.default;
    }

    this._attribute.type = type;
  }
  
  public close(accept: boolean): void {
    this._matDialogRef.close(accept ? {
        attributeName: this._attributeName,
        attribute: this._attribute,
        view: this._view
      } : undefined);
  }
}
