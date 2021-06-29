/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
// Angular
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

// NPM
import { Subscription } from 'rxjs';
import * as Uuid from 'uuid';

// Kohese
import { FormatContainer, FormatContainerKind } from '../../../../common/src/FormatContainer.interface';
import { FormatDefinition, FormatDefinitionType } from '../../../../common/src/FormatDefinition.interface';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { Metatype } from '../../../../common/src/Type.interface';
import { DialogService } from '../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { ItemRepository, TreeConfigInfo } from '../../services/item-repository/item-repository.service';
import { InputDialogComponent, InputDialogKind } from '../dialog/input-dialog/input-dialog.component';
import { NamespaceEditorComponent } from '../object-editor/namespace-editor/namespace-editor.component';

@Component({
  selector: 'type-editor',
  templateUrl: './type-editor.component.html',
  styleUrls: ['./type-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypeEditorComponent implements OnInit, OnDestroy {
  private _selectedNamespace: any;
  get selectedNamespace() {
    return this._selectedNamespace;
  }
  set selectedNamespace(selectedNamespace: any) {
    this._selectedNamespace = selectedNamespace;
    let namespaceTypes: Array<any> = this.getNamespaceTypes(this.
      _selectedNamespace);
    if (namespaceTypes.length > 0) {
      this.selectedType = this.getNamespaceTypes(this._selectedNamespace)[0];
    } else {
      this.selectedType = null;
    }
  }

  private _selectedType: any;
  get selectedType() {
    return this._selectedType;
  }
  set selectedType(selectedType: any) {
    this._selectedType = selectedType;
    if (selectedType) {
      this._modelProxy = TreeConfiguration.getWorkingTree().getModelProxyFor(selectedType.id);
    } else {
      this._modelProxy = undefined;
    }
  }

  private _modelProxy: KoheseModel;
  get modelProxy() {
    return this._modelProxy;
  }

  private _treeConfigSubscription: Subscription;

  get itemRepository() {
    return this._itemRepository;
  }

  get Metatype() {
    return Metatype;
  }

  get FormatDefinitionType() {
    return FormatDefinitionType;
  }

  public constructor(
    private _dynamicTypesService : DynamicTypesService,
    private dialogService : DialogService,
    private _itemRepository : ItemRepository,
    private _changeDetectorRef : ChangeDetectorRef,
    private title : Title
    ) {
      this.title.setTitle('Kind Editor');
    }

  public ngOnInit(): void {
    this._treeConfigSubscription = this._itemRepository.getTreeConfig().
      subscribe((treeConfigInfo: TreeConfigInfo) => {
      if (treeConfigInfo) {
        this._selectedNamespace = treeConfigInfo.config.getProxyFor(
          'com.kohese').item;
        this.selectedType = this.getNamespaceTypes(this._selectedNamespace)[0];
      }
    });
  }

  public ngOnDestroy(): void {
    this._treeConfigSubscription.unsubscribe();
  }

  /**
   * Returns an Array containing all Namespaces
   */
  public getNamespaces(): Array<any> {
    let namespaces: Array<any> = [];
    this._itemRepository.getTreeConfig().getValue().config.getProxyFor(
      'Model-Definitions').visitTree({ includeOrigin: false }, (itemProxy:
      ItemProxy) => {
      if (itemProxy.kind === 'Namespace') {
        namespaces.push(itemProxy.item);
      }
    }, undefined);

    namespaces.sort((oneNamespace: any, anotherNamespace: any) => {
      return oneNamespace.name.localeCompare(anotherNamespace.name);
    });

    return namespaces;
  }

  public async openNamespaceEditor(): Promise<void> {
    await this.dialogService.openComponentsDialog([{
      component: NamespaceEditorComponent,
      matDialogData: {
        selectedNamespace: this._selectedNamespace
      }
    }], {
      data: {
        title: 'Namespaces',
        buttonLabels: {
          acceptLabel: null,
          cancelLabel: 'Close'
        }
      }
    }).updateSize('90%', '90%').afterClosed().toPromise();
  }

  /**
   * Returns an Array containing the types in the given Namespace
   *
   * @param namespace
   */
  public getNamespaceTypes(namespace: any): Array<any> {
    let types: Array<any> = [];
    this._itemRepository.getTreeConfig().getValue().config.getProxyFor(
      'Model-Definitions').visitTree({ includeOrigin: false }, (itemProxy:
      ItemProxy) => {
      if ((itemProxy.kind === 'KoheseModel') && (itemProxy.item.namespace.id
        === namespace.id)) {
        types.push(itemProxy.item);
      }
    }, undefined);

    types.sort((oneType: any, anotherType: any) => {
      return oneType.name.localeCompare(anotherType.name);
    });

    return types;
  }

  /**
   * Allows the addition of a Structure
   */
  public async add(): Promise<void> {
    let namespaceOptions: { [name: string]: any } = {};
    this._itemRepository.getTreeConfig().getValue().config.getProxyFor(
      'Model-Definitions').visitTree({ includeOrigin: false }, (itemProxy:
      ItemProxy) => {
      if ((itemProxy.kind === 'Namespace') && !((itemProxy.item.id ===
        'com.kohese') || (itemProxy.item.id === 'com.kohese.metamodel'))) {
        namespaceOptions[itemProxy.item.name] = itemProxy.item;
      }
    }, undefined);
    let inputs: Array<any> = await this.dialogService.openComponentsDialog([{
      component: InputDialogComponent,
      matDialogData: {
        inputDialogConfiguration: {
          title: 'Add Kind',
          text: '',
          fieldName: 'Name',
          value: 'Kind',
          validate: (input: any) => {
            let names: Array<string> = [];
            this._itemRepository.getTreeConfig().getValue().config.getProxyFor(
              'Model-Definitions').visitTree({ includeOrigin: false },
              (itemProxy: ItemProxy) => {
              if (itemProxy.kind !== 'Namespace') {
                names.push(itemProxy.item.name);
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
          value: Object.values(namespaceOptions).find((namespace: any) => {
            if ((this._selectedNamespace.id === 'com.kohese') || (this.
              _selectedNamespace.id === 'com.kohese.metamodel')) {
              return true;
            } else {
              return (this._selectedNamespace.id === namespace.id);
            }
          }),
          validate: (input: any) => {
            return true;
          },
          options: namespaceOptions
        }
      }
    }], { data: {} }).updateSize('70%', '40%').afterClosed().toPromise();

    if (inputs) {
      let viewModel: any = {
        name: inputs[0],
        namespace: { id: inputs[1].id },
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
      let formatDefinitionId: string = Uuid.v1();
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

      let itemModelProxy : KoheseModel = TreeConfiguration.getWorkingTree().getModelProxyFor('Item');
      let itemKoheseView: any = itemModelProxy.view.item;
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
        namespace: { id: inputs[1].id },
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

      this._selectedNamespace = inputs[1];
      this.selectedType = itemProxys[0].item;

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

  /**
   * Upon confirmation, removes the selected Structure from the system
   *
   * @returns A Promise that resolves to nothing
   */
  public async delete(): Promise<void> {
    let selectedTypeItemProxy: ItemProxy = this._itemRepository.
      getTreeConfig().getValue().config.getProxyFor(this.selectedType.id);
      let choiceValue: any = await this.dialogService.openYesNoDialog('Delete ' +
      selectedTypeItemProxy.item.name, 'Are you sure that you want to ' +
      'delete ' + selectedTypeItemProxy.item.name + '?');
    if (choiceValue) {
      this._itemRepository.deleteItem(selectedTypeItemProxy, false);

      if (selectedTypeItemProxy.kind === 'KoheseModel') {
        this._itemRepository.deleteItem((selectedTypeItemProxy as KoheseModel).view, false);
        this._dynamicTypesService.removeKoheseType(selectedTypeItemProxy.item.
          name);
      }

      let types: Array<any> = this.getNamespaceTypes(this._selectedNamespace);
      if (types.length > 0) {
        this.selectedType = types[0];
      } else {
        let treeConfiguration: TreeConfiguration = this._itemRepository.getTreeConfig().
          getValue().config;
        this._selectedNamespace = treeConfiguration.getProxyFor(
          'com.kohese').item;
        this.selectedType = treeConfiguration.getProxyFor('Item').item;
      }
      this._changeDetectorRef.markForCheck();
    }
  }
}
