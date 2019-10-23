import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { StateMachineEditorComponent } from '../../state-machine-editor/state-machine-editor.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';

@Component({
  selector: 'property-editor',
  templateUrl: './property-editor.component.html',
  styleUrls: ['./property-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyEditorComponent implements OnInit, OnDestroy {
  private _koheseTypeStream: Observable<KoheseType>;
  @Input('koheseTypeStream')
  set koheseTypeStream(koheseTypeStream: Observable<KoheseType>) {
    this._koheseTypeStream = koheseTypeStream;
  }

  private _koheseType: KoheseType;
  get koheseType() {
    return this._koheseType;
  }
  
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
  
  private _idAttributes: any = {};
  get idAttributes() {
    return this._idAttributes;
  }

  private _koheseTypeStreamSubscription: Subscription;
  private _treeConfigurationSubscription: Subscription;
  
  get Object() {
    return Object;
  }

  constructor(private dialogService: DialogService,
    private _dynamicTypesService: DynamicTypesService,
    private _changeDetectorRef: ChangeDetectorRef, private _itemRepository:
    ItemRepository) {
  }

  ngOnInit(): void {
    this._koheseTypeStreamSubscription = this._koheseTypeStream.subscribe(
      (koheseType: KoheseType) => {
      this._koheseType = koheseType;
      if (this._koheseType) {
        let type: any = this._koheseType.dataModelProxy.item;
        for (let j: number = 0; j < type.localTypes.length; j++) {
          let localType: any = type.localTypes[j];
          this._attributeTypes[localType.name] = localType.name;
        }
      }
      
      this._changeDetectorRef.markForCheck();
    });
    
    this._treeConfigurationSubscription = this._itemRepository.getTreeConfig().
      subscribe((treeConfigurationObject: any) => {
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
    });
  }

  public ngOnDestroy(): void {
    this._treeConfigurationSubscription.unsubscribe();
    this._koheseTypeStreamSubscription.unsubscribe();
  }

  add(): void {
    this.dialogService.openInputDialog('Add Property', '', DialogComponent.
      INPUT_TYPES.TEXT, 'Name', '', undefined).afterClosed().subscribe((name:
      string) => {
      if (name) {
        this._koheseType.addProperty(name);
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  public delete(propertyId: string): void {
    let attributeUsages: Array<any> = this.getAttributeUsages(propertyId);
    if (attributeUsages.length > 0) {
      let message: string = 'The following Items prevent removal of ' +
        propertyId + ':\n';
      for (let j: number = 0; j < attributeUsages.length; j++) {
        message += '\n\t- ';
        message += attributeUsages[j].name;
      }
      this.dialogService.openInformationDialog(propertyId + ' Removal ' +
        'Prevented', message);
    } else {
      this.dialogService.openYesNoDialog('Delete ' + propertyId,
        'Are you sure that you want to delete ' + propertyId + '?').
        subscribe((choiceValue: any) => {
        if (choiceValue) {
          this._koheseType.deleteProperty(propertyId);
          this._changeDetectorRef.markForCheck();
        }
      });
    }
  }
  
  private getAttributeUsages(attributeName: string): Array<any> {
    let attributeUsages: Array<any> = [];
    let koheseType: KoheseType;
    let localType: any;
    let koheseTypes: Array<KoheseType> = Object.values(this.
      _dynamicTypesService.getKoheseTypes());
    for (let j: number = 0; j < koheseTypes.length; j++) {
      if (koheseTypes[j] === this._koheseType) {
        koheseType = koheseTypes[j];
        break;
      }
    }
    
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(undefined,
      (itemProxy: ItemProxy) => {
      if (itemProxy.kind === koheseType.dataModelProxy.item.name) {
        if (Array.isArray(koheseType.dataModelProxy.item.properties[
          attributeName].type)) {
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
  
  public setAttributeName(attribute: any, name: string): void {
    let attributeMap: any = this._koheseType.dataModelProxy.item.properties;
    let attributeIndex: number = Object.values(attributeMap).indexOf(
      attribute);
    let previousAttributeName: string = Object.keys(attributeMap)[
      attributeIndex];
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
  
  public typeSelected(attribute: any, attributeType: string): void {
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
    } else {
      delete attribute.relation;
    }
    
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

    this.dialogService.openComponentDialog(StateMachineEditorComponent, {
      data: {
        stateMachine: stateMachine,
        defaultState: attribute.default
      },
      disableClose: true
    }).updateSize('70%', '70%').afterClosed().subscribe((data: any) => {
      if (data) {
        attribute.properties = data.stateMachine;
        attribute.default = data.defaultState;
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
    this._changeDetectorRef.markForCheck();
  }
}
