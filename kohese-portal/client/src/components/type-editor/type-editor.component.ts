import { Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import * as Uuid from 'uuid/v1';

import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { FormatDefinition,
  FormatDefinitionType } from './FormatDefinition.interface';
import { FormatContainer,
  FormatContainerKind } from './FormatContainer.interface';
import { InputDialogKind } from '../dialog/input-dialog/input-dialog.component';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';

import { Subscription } from 'rxjs';

interface Type {
  dataModelItemProxy: ItemProxy;
  viewModelItemProxy: ItemProxy;
}

@Component({
  selector: 'type-editor',
  templateUrl: './type-editor.component.html',
  styleUrls: ['./type-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypeEditorComponent implements OnInit, OnDestroy {
  private _types: Array<Type> = [];
  get types() {
    return this._types;
  }
  
  private _selectedType: Type;
  get selectedType() {
    return this._selectedType;
  }
  set selectedType(selectedType: Type) {
    this._selectedType = selectedType;
  }

  private _treeConfigurationSubscription: Subscription;

  public constructor(private _dynamicTypesService: DynamicTypesService,
    private dialogService: DialogService, private itemRepository:
    ItemRepository, private _changeDetectorRef: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this._treeConfigurationSubscription = this.itemRepository.getTreeConfig().
      subscribe((treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        treeConfigurationObject.config.getRootProxy().visitTree(
          { includeOrigin: false }, (itemProxy: ItemProxy) => {
          if (itemProxy.kind === 'KoheseModel') {
            this._types.push({
              dataModelItemProxy: itemProxy,
              viewModelItemProxy: treeConfigurationObject.config.getProxyFor(
                'view-' + itemProxy.item.name.toLowerCase())
            });
          }
        }, undefined);
        this._types.sort((oneType: Type, anotherType: Type) => {
          return oneType.dataModelItemProxy.item.name.localeCompare(
            anotherType.dataModelItemProxy.item.name);
        });
        
        this._selectedType = this._types[0];
        
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  public ngOnDestroy(): void {
    this._treeConfigurationSubscription.unsubscribe();
  }

  public async add(): Promise<void> {
    let name: any = await this.dialogService.openInputDialog('Add Type', '',
      InputDialogKind.STRING, 'Name', '', undefined);
    if (name) {
      let dataModelProxyPromise: Promise<ItemProxy> = this.itemRepository.
        upsertItem('KoheseModel', {
        name: name,
        parentId: 'Item',
        base: 'Item',
        idInjection: true,
        properties: {},
        validations: [],
        relations: {},
        acls: [],
        methods: [],
        localTypes: {}
      });
      
      let viewModel: any = {
        name: name,
        modelName: name,
        parentId: 'view-item',
        icon: '',
        color: '#000000',
        localTypes: {},
        viewProperties: {},
        formatDefinitions: {},
        defaultFormatKey: {},
        tableDefinitions: {}
      };
      let formatDefinitionId: string = (<any> Uuid).default();
      let defaultFormatDefinition: FormatDefinition = {
        id: formatDefinitionId,
        name: 'Default Format Definition',
        header: {
          kind: FormatContainerKind.HEADER,
          contents: [{
            propertyName: 'name',
            customLabel: 'Name',
            labelOrientation: 'Top',
            kind: 'text',
            visible: true,
            editable: true
          }]
        },
        containers: [{
          kind: FormatContainerKind.VERTICAL,
          contents: [
          ]
        }]
      };
      
      let itemKoheseView: any = this.itemRepository.getTreeConfig().
        getValue().config.getProxyFor('view-item').item;
      let itemDefaultFormatDefinition: FormatDefinition = itemKoheseView.
        formatDefinitions[itemKoheseView.defaultFormatKey[
        FormatDefinitionType.DEFAULT]];
      let attributeEntries: Array<any> = defaultFormatDefinition.containers[
        0].contents;
      for (let j: number = 0; j < itemDefaultFormatDefinition.containers[0].
        contents.length; j++) {
        attributeEntries.push(JSON.parse(JSON.stringify(
          itemDefaultFormatDefinition.containers[0].contents[j])));
      }
      if (this.areStateAttributesGrouped(itemDefaultFormatDefinition)) {
        defaultFormatDefinition.containers.splice(1, 0, {
          kind: FormatContainerKind.VERTICAL,
          contents: []
        });
        for (let j: number = 0; j < itemDefaultFormatDefinition.containers[1].
          contents.length; j++) {
          defaultFormatDefinition.containers[1].contents.push(JSON.parse(JSON.
            stringify(itemDefaultFormatDefinition.containers[1].contents[j])));
        }
      }
      
      viewModel.formatDefinitions[formatDefinitionId] =
        defaultFormatDefinition;
      viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT] =
        formatDefinitionId;
      let viewModelProxyPromise: Promise<ItemProxy> = this.itemRepository.
        upsertItem('KoheseView', viewModel);
      
      Promise.all([dataModelProxyPromise, viewModelProxyPromise]).
        then((proxies: Array<ItemProxy>) => {
        this._types.push({
          dataModelItemProxy: proxies[0],
          viewModelItemProxy: proxies[1]
        });
        this._types.sort((oneType: Type, anotherType: Type) => {
          return oneType.dataModelItemProxy.item.name.localeCompare(
            anotherType.dataModelItemProxy.item.name);
        });
        
        this._dynamicTypesService.buildKoheseType(proxies[0] as KoheseModel);
        
        this._changeDetectorRef.markForCheck();
      });
    }
  }
  
  private areStateAttributesGrouped(defaultFormatDefinition: FormatDefinition):
    boolean {
    let formatContainer: FormatContainer = defaultFormatDefinition.containers[
      0];
    for (let j: number = 0; j < formatContainer.contents.length; j++) {
      if (formatContainer.contents[j].kind === 'state-editor') {
        return false;
      }
    }
    
    if (defaultFormatDefinition.containers.length > 1) {
      formatContainer = defaultFormatDefinition.containers[1];
      if (formatContainer.contents.length > 0) {
        if (formatContainer.contents[0].kind === 'state-editor') {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    
    return false;
  }

  public async delete(): Promise<void> {
    let choiceValue: any = await this.dialogService.openYesNoDialog('Delete ' +
      this._selectedType.dataModelItemProxy.item.name, 'Are you sure that ' +
      'you want to delete ' + this._selectedType.dataModelItemProxy.item.name +
      '?');
    if (choiceValue) {
      this.itemRepository.deleteItem(this._selectedType.dataModelItemProxy,
        false);
      this.itemRepository.deleteItem(this._selectedType.viewModelItemProxy,
        false);
      this._types.splice(this._types.indexOf(this._selectedType), 1);
      this._dynamicTypesService.removeKoheseType(this._selectedType.
        dataModelItemProxy.item.name);
      
      this._changeDetectorRef.markForCheck();
    }
  }
}
