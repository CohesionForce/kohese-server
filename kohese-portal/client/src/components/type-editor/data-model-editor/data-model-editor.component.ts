import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input,
  ViewChild } from '@angular/core';
import { MatTable } from '@angular/material';

import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { LocalTypeEditorComponent } from '../local-type-editor/local-type-editor.component';
import { AttributeEditorComponent } from '../attribute-editor/attribute-editor.component';
import { StateMachineEditorComponent } from '../../state-machine-editor/state-machine-editor.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

@Component({
  selector: 'data-model-editor',
  templateUrl: './data-model-editor.component.html',
  styleUrls: ['./data-model-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataModelEditorComponent {
  private _dataModel: any;
  get dataModel() {
    return this._dataModel;
  }
  @Input('dataModel')
  set dataModel(dataModel: any) {
    this._dataModel = dataModel;
    this._filteredKinds = [];
    this._attributeTypes = JSON.parse(JSON.stringify(this._fundamentalTypes));
    this._idAttributes = {};
    
    for (let j: number = 0; j < this._dataModel.localTypes.length; j++) {
      let localType: any = this._dataModel.localTypes[j];
      this._attributeTypes[localType.name] = localType.name;
    }
    
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'KoheseModel') {
        let item: any = itemProxy.item;
        if (item.name !== this._dataModel.name) {
          this._filteredKinds.push(item);
        }
        
        this._attributeTypes[item.name] = item.name;
        
        for (let attributeName in item.properties) {
          let attribute: any = item.properties[attributeName];
          if (attribute.id) {
            if (!this._idAttributes[item.name]) {
              this._idAttributes[item.name] = [];
            }
  
            this._idAttributes[item.name].push(attributeName);
          }
        }
      }
    }, undefined);
    this._filteredKinds.sort((oneKind: any, anotherKind: any) => {
      return oneKind.name.localeCompare(anotherKind.name);
    });
    
    this._itemProxy = TreeConfiguration.getWorkingTree().getProxyFor(this.
      _dataModel.id);
    this._editable = this._itemProxy.dirty;
    this._attributes = [];
    for (let attributeName in this._dataModel.properties) {
      let attribute: any = this._dataModel.properties[attributeName];
      // Migration code
      attribute.name = attributeName;
      this._attributes.push(attribute);
    }
  }
  
  private _filteredKinds: Array<any>;
  get filteredKinds() {
    return this._filteredKinds;
  }
  
  private _fundamentalTypes: any = {
    'Boolean': 'boolean',
    'Number': 'number',
    'Text': 'string',
    'State': 'StateMachine',
    'Username': 'user-selector'
  };
  get fundamentalTypes() {
    return this._fundamentalTypes;
  }
  
  private _attributeTypes: any;
  get attributeTypes() {
    return this._attributeTypes;
  }
  
  private _idAttributes: any;
  get idAttributes() {
    return this._idAttributes;
  }
  
  private _itemProxy: ItemProxy;
  get itemProxy() {
    return this._itemProxy;
  }
  
  private _editable: boolean = false;
  get editable() {
    return this._editable;
  }
  set editable(editable: boolean) {
    this._editable = editable;
  }
  
  @ViewChild('attributeTable')
  private _attributeTable: MatTable<any>;
  
  private _attributes: Array<any>;
  get attributes() {
    return this._attributes;
  }
  
  get Object() {
    return Object;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService, private _dynamicTypesService:
    DynamicTypesService, private _itemRepository: ItemRepository) {
  }
  
  public save(): void {
    this._itemRepository.upsertItem('KoheseModel', this._dataModel).then(
      (itemProxy: ItemProxy) => {
      this._changeDetectorRef.markForCheck();
    });
    this._editable = false;
  }
  
  public discardChanges(): void {
    this._itemRepository.fetchItem(TreeConfiguration.getWorkingTree().
      getProxyFor(this._dataModel.id));
    this._editable = false;
    this._changeDetectorRef.markForCheck();
  }
  
  public addLocalType(): void {
    this._dialogService.openComponentDialog(LocalTypeEditorComponent, {
      data: {
        containingType: this._dataModel,
        view: TreeConfiguration.getWorkingTree().getProxyFor('view-' + this.
          _dataModel.name.toLowerCase()).item
      },
      disableClose: true
    }).updateSize('90%', '90%').afterClosed().subscribe((localType: any) => {
      if (localType) {
        // Migration code
        let localTypes: Array<any> = this._dataModel.localTypes;
        if (!localTypes) {
          localTypes = this._dataModel.localTypes = [];
        }
        
        localTypes.push(localType);
        this._dynamicTypesService.localTypeMap.get(this._dataModel.name).push(
          localType.name);
        
        this._itemProxy.dirty = true;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public editLocalType(localType: any): void {
    this._dialogService.openComponentDialog(LocalTypeEditorComponent, {
      data: {
        type: localType,
        containingType: this._dataModel,
        view: TreeConfiguration.getWorkingTree().getProxyFor('view-' + this.
          _dataModel.name.toLowerCase()).item
      },
      disableClose: true
    }).updateSize('90%', '90%').afterClosed().subscribe((returnedLocalType:
      any) => {
      if (returnedLocalType) {
        this._itemProxy.dirty = true;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public removeLocalType(localType: any): void {
    this._dialogService.openYesNoDialog('Remove ' + localType.name,
      'Are you sure that you want to remove ' + localType.name + '?').
      subscribe((selection: any) => {
      if (selection) {
        let localTypes: Array<any> = this._dataModel.localTypes;
        localTypes.splice(localTypes.indexOf(localType), 1);
        let localTypeNames: Array<string> = this._dynamicTypesService.
          localTypeMap.get(this._dataModel.name);
        localTypeNames.splice(localTypeNames.indexOf(localType.name), 1);
        
        this._itemProxy.dirty = true;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public async addAttribute(): Promise<void> {
    let viewModelProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor('view-' + this._dataModel.name.toLowerCase());
    if (this._itemProxy.dirty || viewModelProxy.dirty) {
      let response: any = await this._dialogService.openYesNoDialog(
        'Display Modifications', 'All unsaved modifications to this kind ' +
        'are to be saved if an attribute is added to this kind. Do you want ' +
        'to proceed?').toPromise();
      if (!response) {
        return;
      }
    }
    
    this._dialogService.openComponentDialog(AttributeEditorComponent, {
      data: {
        type: this._dataModel
      },
      disableClose: true
    }).afterClosed().subscribe((attributeObject: any) => {
      if (attributeObject) {
        this._dataModel.properties[attributeObject.attributeName] =
          attributeObject.attribute;
        viewModelProxy.item.viewProperties[attributeObject.attributeName] =
          attributeObject.view;
        
        this.save();
        this._itemRepository.upsertItem('KoheseView', viewModelProxy.item);
        this._attributes.push(attributeObject.attribute);
        this._attributeTable.renderRows();
        
        // Re-enter edit mode
        this._editable = true;
        
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public sortAttributes(columnId: string, sortDirection: string): void {
    if (sortDirection) {
      if (columnId === 'Type') {
        this._attributes.sort((oneElement: any, anotherElement: any) => {
          let oneType: string = (Array.isArray(oneElement.type) ? oneElement.
            type[0] : oneElement.type);
          let anotherType: string = (Array.isArray(anotherElement.type) ?
            anotherElement.type[0] : anotherElement.type);
          if (sortDirection === 'asc') {
            return oneType.localeCompare(anotherType);
          } else {
            return anotherType.localeCompare(oneType);
          }
        });
      } else if (columnId === 'Is Multivalued') {
        this._attributes.sort((oneElement: any, anotherElement: any) => {
          let oneValue: number = (Array.isArray(oneElement.type) ? 1 : 0);
          let anotherValue: number = (Array.isArray(anotherElement.type) ? 1 :
            0);
          if (sortDirection === 'asc') {
            return oneValue - anotherValue;
          } else {
            return anotherValue - oneValue;
          }
        });
      } else if (columnId === 'Is Required') {
        this._attributes.sort((oneElement: any, anotherElement: any) => {
          let oneValue: number = (oneElement.required ? 1 : 0);
          let anotherValue: number = (anotherElement.required ? 1 : 0);
          if (sortDirection === 'asc') {
            return oneValue - anotherValue;
          } else {
            return anotherValue - oneValue;
          }
        });
      } else if (columnId === 'Is Kind ID') {
        this._attributes.sort((oneElement: any, anotherElement: any) => {
          let oneValue: number = (oneElement.id ? 1 : 0);
          let anotherValue: number = (anotherElement.id ? 1 : 0);
          if (sortDirection === 'asc') {
            return oneValue - anotherValue;
          } else {
            return anotherValue - oneValue;
          }
        });
      } else {
        let attributeName: string;
        switch (columnId) {
          case 'Name':
            attributeName = 'name';
            break;
          case 'Default Value':
            attributeName = 'default';
            break;
        }
        
        this._attributes.sort((oneElement: any, anotherElement: any) => {
          if (sortDirection === 'asc') {
            return String(oneElement[attributeName]).localeCompare(
              String(anotherElement[attributeName]));
          } else {
            return String(anotherElement[attributeName]).localeCompare(
              String(oneElement[attributeName]));
          }
        });
      }
    } else {
      let unsortedData: Array<any> = [];
      for (let attributeName in this._dataModel.properties) {
        let attribute: any = this._dataModel.properties[attributeName];
        // Migration code
        attribute.name = attributeName;
        unsortedData.push(attribute);
      }
      
      this._attributes.sort((oneElement: any, anotherElement: any) => {
        return (unsortedData.indexOf(oneElement) - unsortedData.indexOf(
          anotherElement));
      });
    }
    
    this._attributeTable.renderRows();
    this._changeDetectorRef.markForCheck();
  }
  
  public setAttributeName(attribute: any, name: string): void {
    let attributeMap: any = this._dataModel.properties;
    let previousAttributeName: string = attribute.name;
    let intermediateMap: any = {};
    for (let attributeName in attributeMap) {
      if (attributeName === previousAttributeName) {
        intermediateMap[name] = attributeMap[attributeName];
      } else {
        intermediateMap[attributeName] = attributeMap[attributeName];
      }
      
      delete attributeMap[attributeName];
    }
    
    for (let attributeName in intermediateMap) {
      attributeMap[attributeName] = intermediateMap[attributeName];
    }
    
    attribute.name = name;
    this._itemProxy.dirty = true;
    this._changeDetectorRef.markForCheck();
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
  
  public async typeSelected(attribute: any, attributeType: string):
    Promise<void> {
    let viewModelProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor('view-' + this._dataModel.name.toLowerCase());
    if (this._itemProxy.dirty || viewModelProxy.dirty) {
      let response: any = await this._dialogService.openYesNoDialog(
        'Display Modifications', 'All unsaved modifications to this kind ' +
        'are to be saved if an attribute is added to this kind. Do you want ' +
        'to proceed?').toPromise();
      if (!response) {
        return;
      }
    }
    
    if (Array.isArray(attribute.type)) {
      attribute.type = [attributeType];
    } else {
      attribute.type = attributeType;
    }
    
    if (Object.values(this._fundamentalTypes).indexOf(attributeType) === -1) {
      if (!attribute.relation) {
        attribute.relation = {
          kind: 'Item',
          foreignKey: 'id'
        };
      }
      
      viewModelProxy.item.viewProperties[attribute.name].inputType.type = '';
    } else {
      delete attribute.relation;
      
      if (attributeType === 'string') {
        viewModelProxy.item.viewProperties[attribute.name].inputType.type =
          'text';
      } else {
        viewModelProxy.item.viewProperties[attribute.name].inputType.type =
          attributeType;
      }
    }
    
    this.save();
    this._itemRepository.upsertItem('KoheseView', viewModelProxy.item);
    
    // Re-enter edit mode
    this._editable = true;
        
    this._changeDetectorRef.markForCheck();
  }
  
  public openStateMachineEditor(attribute: any): void {
    let stateMachine: any = attribute.properties;
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
        defaultState: attribute.default
      },
      disableClose: true
    }).updateSize('70%', '70%').afterClosed().subscribe((data: any) => {
      if (data) {
        attribute.properties = data.stateMachine;
        attribute.default = data.defaultState;
        
        this._itemProxy.dirty = true;
      }
    });
  }
  
  public areRelationsEqual(option: any, selection: any): boolean {
    return ((option.kind === selection.kind) && (option.foreignKey ===
      selection.foreignKey));
  }
  
  public isMultivalued(attribute: any): boolean {
    return Array.isArray(attribute.type);
  }
  
  public toggleMultivaluedness(attribute: any): void {
    let type: any = attribute.type;
    if (this.isMultivalued(attribute)) {
      type = [type];
    } else {
      type = type[0];
    }

    attribute.type = type;
    
    this._itemProxy.dirty = true;
    this._changeDetectorRef.markForCheck();
  }
  
  public getAttributeUsages(attributeName: string): Array<any> {
    let attributeUsages: Array<any> = [];
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(undefined,
      (itemProxy: ItemProxy) => {
      if (itemProxy.kind === this._dataModel.name) {
        if (Array.isArray(this._dataModel.properties[attributeName].type)) {
          // The first check below should not be necessary.
          if (itemProxy.item[attributeName] && itemProxy.item[attributeName].
            length > 0) {
            attributeUsages.push(itemProxy.item);
          }
        } else {
          if (itemProxy.item[attributeName] != null) {
            attributeUsages.push(itemProxy.item);
          }
        }
      }
    });
    
    return attributeUsages;
  }
  
  public removeAttribute(propertyId: string): void {
    this._dialogService.openYesNoDialog('Remove ' + propertyId, 'All ' +
      'unsaved modifications to this kind are to be saved if this attribute ' +
      'is removed. Do you want to proceed?').subscribe((choiceValue: any) => {
      if (choiceValue) {
        let viewModel: any = TreeConfiguration.getWorkingTree().getProxyFor(
          'view-' + this._dataModel.name.toLowerCase()).item;
        delete this._dataModel.properties[propertyId];
        delete viewModel.viewProperties[propertyId];
        
        this.save();
        this._itemRepository.upsertItem('KoheseView', viewModel);
        this._attributes.splice(Object.keys(this._dataModel.properties).
          indexOf(propertyId), 1);
        this._attributeTable.renderRows();
        
        // Re-enter edit mode
        this._editable = true;
        
        this._changeDetectorRef.markForCheck();
      }
    });
  }
}
