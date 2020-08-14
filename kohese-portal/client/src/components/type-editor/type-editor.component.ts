import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  ViewChild } from '@angular/core';
import * as Uuid from 'uuid/v1';

import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { FormatDefinition,
  FormatDefinitionType } from '../../../../common/src/FormatDefinition.interface';
import { FormatContainer,
  FormatContainerKind } from '../../../../common/src/FormatContainer.interface';
import { InputDialogKind, InputDialogComponent } from '../dialog/input-dialog/input-dialog.component';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { TreeComponent, TreeComponentConfiguration } from '../tree/tree.component';
import { Metatype } from '../../../../common/src/Type.interface';

@Component({
  selector: 'type-editor',
  templateUrl: './type-editor.component.html',
  styleUrls: ['./type-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypeEditorComponent {
  @ViewChild('typeTree')
  private _typeTree: TreeComponent;
  get typeTree() {
    return this._typeTree;
  }

  get itemRepository() {
    return this._itemRepository;
  }

  get Metatype() {
    return Metatype;
  }

  get FormatDefinitionType() {
    return FormatDefinitionType;
  }

  get TreeComponentConfiguration() {
    return TreeComponentConfiguration;
  }

  public constructor(private _dynamicTypesService: DynamicTypesService,
    private dialogService: DialogService, private _itemRepository:
    ItemRepository, private _changeDetectorRef: ChangeDetectorRef) {
  }

  public async add(metatype: Metatype): Promise<void> {
    let namespaceOptions: { [name: string]: any } = {};
    this._itemRepository.getTreeConfig().getValue().config.getProxyFor(
      'Model-Definitions').visitTree({ includeOrigin: false }, (itemProxy:
      ItemProxy) => {
      if (itemProxy.kind === 'Namespace') {
        namespaceOptions[itemProxy.item.name] = { id: itemProxy.item.id };
      }
    }, undefined);
    let inputs: Array<any> = await this.dialogService.openComponentsDialog([{
      component: InputDialogComponent,
      matDialogData: {
        inputDialogConfiguration: {
          title: 'Add ' + metatype,
          text: '',
          fieldName: 'Name',
          value: metatype,
          validate: (input: any) => {
            let names: Array<string> = [];
            this._itemRepository.getTreeConfig().getValue().config.getProxyFor(
              'Model-Definitions').visitTree({ includeOrigin: false },
              (itemProxy: ItemProxy) => {
              if (metatype === Metatype.STRUCTURE) {
                if (itemProxy.kind !== 'Namespace') {
                  names.push(itemProxy.item.name);
                }
              } else {
                if (itemProxy.kind === 'Namespace') {
                  names.push(itemProxy.item.name);
                }
              }
            }, undefined);
            return ((input !== '') && (names.indexOf(input) === -1));
          },
          inputDialogKind: InputDialogKind.STRING
        }
      }
    }, {
      component: InputDialogComponent,
      matDialogData: {
        inputDialogConfiguration: {
          title: 'Select Namespace',
          text: '',
          fieldName: 'Namespace',
          value: ((this._typeTree.selection[0].kind === 'Namespace') ?
            Object.values(namespaceOptions).find((reference:
            { id: string }) => {
            return (this._typeTree.selection[0].item.id === reference.id);
          }) : Object.values(namespaceOptions)[0]),
          validate: (input: any) => {
            return true;
          },
          options: namespaceOptions
        }
      }
    }], { data: {} }).updateSize('70%', '40%').afterClosed().toPromise();
    
    if (inputs) {
      let itemProxy: ItemProxy;
      if (metatype === Metatype.STRUCTURE) {
        let viewModel: any = {
          name: inputs[0],
          namespace: inputs[1],
          modelName: inputs[0],
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
        
        let itemKoheseView: any = this._itemRepository.getTreeConfig().
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
        
        let itemProxys: Array<ItemProxy> = await Promise.all([this.
          _itemRepository.upsertItem('KoheseModel', {
          name: inputs[0],
          parentId: 'Item',
          namespace: inputs[1],
          base: 'Item',
          idInjection: true,
          properties: {},
          validations: [],
          relations: {},
          acls: [],
          methods: [],
          localTypes: {}
        }), this._itemRepository.upsertItem('KoheseView', viewModel)]);
        
        this._dynamicTypesService.buildKoheseType(
          itemProxys[0] as KoheseModel);
        
        itemProxy = itemProxys[0];
      } else {
        // Metatype.NAMESPACE
        itemProxy = await this._itemRepository.upsertItem('Namespace', {
          name: inputs[0],
          parentId: inputs[1].id
        });
      }

      this._typeTree.update(true);
      this._typeTree.selection[0] = this._itemRepository.getTreeConfig().
        getValue().config.getProxyFor(itemProxy.item.id);
      
      this._changeDetectorRef.markForCheck();
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
    let selectedTypeItemProxy: ItemProxy = this._typeTree.selection[
      0] as ItemProxy;
      let choiceValue: any = await this.dialogService.openYesNoDialog('Delete ' +
      selectedTypeItemProxy.item.name, 'Are you sure that you want to ' +
      'delete ' + selectedTypeItemProxy.item.name + '?');
    if (choiceValue) {
      this._itemRepository.deleteItem(selectedTypeItemProxy, false);

      if (selectedTypeItemProxy.kind === 'KoheseModel') {
        this._itemRepository.deleteItem(this._itemRepository.getTreeConfig().
          getValue().config.getProxyFor('view-' + selectedTypeItemProxy.item.
          name.toLowerCase()), false);
        this._dynamicTypesService.removeKoheseType(selectedTypeItemProxy.item.
          name);
      }

      this._typeTree.update(true);
      this._changeDetectorRef.markForCheck();
    }
  }

  public async save(kindName: string, item: any): Promise<void> {
    await this._itemRepository.upsertItem(kindName, item);
  }

  public getTreeComponentConfiguration(treeComponentConfiguration:
    TreeComponentConfiguration): Function {
    switch (treeComponentConfiguration) {
      case TreeComponentConfiguration.GET_CHILDREN:
        return (element: any) => {
          return (element as ItemProxy).children;
        };
      case TreeComponentConfiguration.HAS_CHILDREN:
        return (element: any) => {
          return ((element as ItemProxy).children.length > 0);
        };
      case TreeComponentConfiguration.GET_TEXT:
        return (element: any) => {
          return (element as ItemProxy).item.name;
        };
      case TreeComponentConfiguration.GET_ICON:
        return (element: any) => {
          return this._itemRepository.getTreeConfig().getValue().config.
            getProxyFor('view-' + (element as ItemProxy).kind.toLowerCase()).item.
            icon;
        };
      case TreeComponentConfiguration.ELEMENT_SELECTION_HANDLER:
        return (element: any) => {
          this._changeDetectorRef.markForCheck();
        };
    }
  }
}
