import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  Optional, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { StateMachineEditorComponent } from '../../state-machine-editor/state-machine-editor.component';

@Component({
  selector: 'attribute-editor',
  templateUrl: './attribute-editor.component.html',
  styleUrls: ['./attribute-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributeEditorComponent implements OnInit {
  private _attributeName: string;
  get attributeName() {
    return this._attributeName;
  }
  @Input('attributeName')
  set attributeName(attributeName: string) {
    this._attributeName = attributeName;
  }
  
  private _attribute: any;
  get attribute() {
    return this._attribute;
  }
  @Input('attribute')
  set attribute(attribute: any) {
    this._attribute = attribute;
  }
  
  private _view: any;
  get view() {
    return this._view;
  }
  @Input('view')
  set view(view: any) {
    this._view = view;
  }
  
  get dynamicTypesService() {
    return this._dynamicTypesService;
  }
  
  get multivalued() {
    return Array.isArray(this._attribute.type);
  }
  set multivalued(multivalued: boolean) {
    let type: any = this._attribute.type;
    if (multivalued) {
      type = [type];
    } else {
      type = type[0];
    }

    this._attribute.type = type;
    this._changeDetectorRef.markForCheck();
  }
  
  private _idAttributes: any = {};
  get idAttributes() {
    return this._idAttributes;
  }
  
  get data() {
    return this._data;
  }
  
  /* Add an entry for 'Reference' if this is used for global types and adding
  local types to local types is handled. */
  private _fundamentalTypes: any = {
    'Boolean': 'boolean',
    'Number': 'number',
    'Date': 'date',
    'Text': 'string',
    'Markdown': 'markdown',
    'State': 'StateMachine',
    'Username': 'user-selector'
  };
  get fundamentalTypes() {
    return this._fundamentalTypes;
  }
  
  private _attributeTypes: any = JSON.parse(JSON.stringify(this.
    _fundamentalTypes));
  get attributeTypes() {
    return this._attributeTypes;
  }
  
  get Object() {
    return Object;
  }
  
  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dynamicTypesService: DynamicTypesService, private _dialogService:
    DialogService) {
  }
  
  public ngOnInit(): void {
    if (this._data) {
      if (this._data['attribute']) {
        this._attributeName = this._data['attributeName'];
        this._attribute = this._data['attribute'];
        this._view = this._data['view'];
      }
    }
    
    if (!this._attribute) {
      this._attributeName = '';
      this._attribute = {};
      this._view = {
        asTable: false
      };
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
    }
  }
  
  public typeSelected(attributeType: string): void {
    if (Array.isArray(this._attribute.type)) {
      this._attribute.type = [attributeType];
    } else {
      this._attribute.type = attributeType;
    }
    
    if (Object.values(this._fundamentalTypes).indexOf(attributeType) === -1) {
      if (!this._attribute.relation) {
        this._attribute.relation = {
          kind: 'Item',
          foreignKey: 'id'
        };
      }
    } else {
      delete this._attribute.relation;
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
      },
      disableClose: true
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
}
