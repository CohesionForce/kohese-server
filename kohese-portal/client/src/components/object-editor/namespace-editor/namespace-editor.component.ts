/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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


import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';

import { ItemProxy } from '../../../../../common/src/item-proxy';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { Dialog } from '../../dialog/Dialog.interface';
import { TreeComponent } from '../../tree/tree.component';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

@Component({
  selector: 'namespace-editor',
  templateUrl: './namespace-editor.component.html',
  styleUrls: ['./namespace-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamespaceEditorComponent implements Dialog {
  private _selectedNamespace: any;
  get selectedNamespace() {
    return this._selectedNamespace;
  }
  @Input('selectedNamespace')
  set selectedNamespace(selectedNamespace: any) {
    this._selectedNamespace = selectedNamespace;
  }

  get itemRepository() {
    return this._itemRepository;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _itemRepository: ItemRepository, private _dialogService:
    DialogService) {
  }

  /**
   * @see Dialog.interface.ts
   */
  public isValid(): boolean {
    return ((this._selectedNamespace.name !== '') && (this.getNamespaces(
      true).map((namespace: any) => {
      return namespace.name;
    }).indexOf(this._selectedNamespace.name) === -1));
  }

  /**
   * @see Dialog.interface.ts
   *
   * @param accept
   */
  public close(accept: boolean): any {
  }

  /**
   * Builds a new Namespace
   */
  public async add(): Promise<void> {
    let name: string = 'Namespace ' + this.getNamespaces(false).length;
    await this._itemRepository.upsertItem('Namespace', {
      name: name,
      parentId: (this._selectedNamespace ? this._selectedNamespace.id :
        'com.kohese'),
      alias: name
    });
  }
  /**
   * Returns an Array containing all Namespaces except the selected Namespace
   * should a parameter of ```true``` be passed
   *
   * @param excludeSelectedNamespace
   */
  public getNamespaces(excludeSelectedNamespace: boolean): Array<any> {
    let namespaces: Array<any> = [];
    this._itemRepository.getTreeConfig().getValue().config.getProxyFor(
      'Model-Definitions').visitTree({ includeOrigin: false }, (itemProxy:
      ItemProxy) => {
      if ((itemProxy.kind === 'Namespace') && (!excludeSelectedNamespace ||
        (itemProxy.item !== this._selectedNamespace))) {
        namespaces.push(itemProxy.item);
      }
    }, undefined);

    namespaces.sort((oneNamespace: any, anotherNamespace: any) => {
      return oneNamespace.name.localeCompare(anotherNamespace.name);
    });

    return namespaces;
  }

  /**
   * Returns an Array of Namespaces allowed to be the enclosing Namespace of
   * the selected Namespace.
   */
  public getEnclosingNamespaceOptions(): Array<any> {
    let namespaces: Array<any> = [];
    this._itemRepository.getTreeConfig().getValue().config.getProxyFor(
      'Model-Definitions').visitTree({ includeOrigin: false }, (itemProxy:
      ItemProxy) => {
      if ((itemProxy.kind === 'Namespace') && (itemProxy.item.id !==
        'com.kohese') && (itemProxy.item.id !== 'com.kohese.metamodel')) {
        let isOption: boolean = true;
        let namespaceItemProxy: ItemProxy = itemProxy;
        while (namespaceItemProxy != null) {
          if (namespaceItemProxy.item === this._selectedNamespace) {
            isOption = false;
            break;
          }

          namespaceItemProxy = namespaceItemProxy.parentProxy;
        }

        if (isOption === true) {
          namespaces.push(itemProxy.item);
        }
      }
    }, undefined);

    namespaces.sort((oneNamespace: any, anotherNamespace: any) => {
      return oneNamespace.name.localeCompare(anotherNamespace.name);
    });

    return namespaces;
  }

  /**
   * Upon confirmation, removes the given Namespace and all of its descendants
   * from the system and adjusts all types that have a supertype of a type to
   * be removed
   *
   * @param namespace
   */
  public async remove(namespace: any): Promise<void> {
    let namespaceItemProxy: ItemProxy = this._itemRepository.getTreeConfig().
      getValue().config.getProxyFor(namespace.id);
    let namespaceItemProxysToRemove: Array<ItemProxy> = [namespaceItemProxy,
      ...namespaceItemProxy.getDescendants()];
    let typeItemProxysToRemove: Array<ItemProxy> = [];
    let modelDefinitionsItemProxy: ItemProxy = this._itemRepository.
      getTreeConfig().getValue().config.getProxyFor('Model-Definitions');
    // Collect all types that have a Namespace of a Namespace to be removed
    modelDefinitionsItemProxy.visitTree({ includeOrigin: false }, (itemProxy:
      ItemProxy) => {
      if ((itemProxy.kind !== 'Namespace') && (namespaceItemProxysToRemove.
        map((namespaceItemProxy: ItemProxy) => {
          return namespaceItemProxy.item.id;
      }).indexOf(itemProxy.item.namespace.id) !== -1)) {
        typeItemProxysToRemove.push(itemProxy);
      }
    }, undefined);

    let proceed: boolean = await this._dialogService.openYesNoDialog(
      'Remove ' + namespace.name, 'Removing ' + namespace.name + ' will ' +
      'remove the following types and Namespaces: ' + typeItemProxysToRemove.
      concat(namespaceItemProxysToRemove).map((itemProxy: ItemProxy) => {
        return itemProxy.item.name;
      }).join(', ') + '. Are you sure that you want to remove ' + namespace.
      name + '?');
    if (proceed) {
      // Adjust all types that have a supertype of a type that is to be removed
      modelDefinitionsItemProxy.visitTree({ includeOrigin: false },
        async (itemProxy: ItemProxy) => {
        if ((itemProxy.kind !== 'Namespace') && (typeItemProxysToRemove.
          indexOf(itemProxy) === -1) && typeItemProxysToRemove.map(
          (typeItemProxy: ItemProxy) => {
          return typeItemProxy.item.name;
        }).indexOf(itemProxy.item.base) !== -1) {
          itemProxy.item.base = 'Item';
          await this._itemRepository.upsertItem(itemProxy.kind, itemProxy.
            item);
        }
      }, undefined);

      // TODO: There is no wait or error processing on these for loops
      for (let j: number = 0; j < typeItemProxysToRemove.length; j++) {
        this._itemRepository.deleteItem(typeItemProxysToRemove[j], false);
      }

      for (let j: number = 0 ; j < namespaceItemProxysToRemove.length; j++) {
        this._itemRepository.deleteItem(namespaceItemProxysToRemove[j], false);
      }

      this._changeDetectorRef.markForCheck();
    }
  }

  public async discardChanges(item: any): Promise<void> {
    await this._itemRepository.fetchItem(this._itemRepository.getTreeConfig().
      getValue().config.getProxyFor(item.id));
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Allows addition of Namespaces and, if the given boolean is false, types to
   * the selected Namespace
   *
   * @param allowNamespaceAdditionOnly
   */
  public async addSubcomponent(allowNamespaceAdditionOnly: boolean):
    Promise<void> {
    let proceed: boolean = await this._dialogService.openYesNoDialog(
      'Modifications To Be Saved', 'Adding subcomponents to this ' +
      'Namespace will automatically save all changes to all added ' +
      'subcomponents. Do you want to continue?');
    if (!proceed) {
      return;
    }

    let unselectableSubcomponents: Array<ItemProxy> = [];
    let treeConfiguration: TreeConfiguration = this._itemRepository.
      getTreeConfig().getValue().config;
    treeConfiguration.getProxyFor('Model-Definitions').visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.item.preventModification) {
        unselectableSubcomponents.push(itemProxy);
      } else {
        if (itemProxy.kind === 'Namespace') {
          let namespaceItemProxy: ItemProxy = itemProxy;
          while (namespaceItemProxy != null) {
            if (namespaceItemProxy.item === this._selectedNamespace) {
              unselectableSubcomponents.push(itemProxy);
              break;
            }

            namespaceItemProxy = namespaceItemProxy.parentProxy;
          }
        } else if (itemProxy.item['namespace'].id === this._selectedNamespace.
          id) {
          unselectableSubcomponents.push(itemProxy);
        }
      }
    }, undefined);

    let results: Array<any> = await this._dialogService.openComponentsDialog(
      [{
      component: TreeComponent,
      matDialogData: {
        root: treeConfiguration.getProxyFor('Model-Definitions'),
        getChildren: (element: any) => {
          return (element as ItemProxy).children.filter((itemProxy:
            ItemProxy) => {
            return (allowNamespaceAdditionOnly ? (itemProxy.kind ===
              'Namespace') : true);
          });
        },
        hasChildren: (element: any) => {
          return ((element as ItemProxy).children.filter((itemProxy:
            ItemProxy) => {
            return (allowNamespaceAdditionOnly ? (itemProxy.kind ===
              'Namespace') : true);
          }).length > 0);
        },
        getText: (element: any) => {
          return (element as ItemProxy).item.name;
        },
        getIcon: (element: any) => {
          return (element as ItemProxy).model.view.item.icon;
        },
        maySelect: (element: any) => {
          return (unselectableSubcomponents.indexOf(element) === -1);
        },
        allowMultiselect: true,
        showSelections: true
      }
    }], { data: {} }).updateSize('80%', '80%').afterClosed().toPromise();
    if (results) {
      await Promise.all(results[0].map((element: any) => {
        let itemProxy: ItemProxy = (element as ItemProxy);
        if (itemProxy.kind === 'Namespace') {
          itemProxy.item.parentId = this._selectedNamespace.id;
        } else {
          itemProxy.item.namespace.id = this._selectedNamespace.id;
        }

        return this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item);
      }));

      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Returns the Namespaces and types contained in the selected Namespace
   */
  public getSubcomponents(): Array<any> {
    let subcomponents: Array<any> = [];
    this._itemRepository.getTreeConfig().getValue().config.getProxyFor(
      'Model-Definitions').visitTree({ includeOrigin: false }, (itemProxy:
      ItemProxy) => {
      if (((itemProxy.kind === 'KoheseModel') && (itemProxy.item.namespace.id
        === this._selectedNamespace.id)) || (itemProxy.item.parentId === this.
        _selectedNamespace.id)) {
        subcomponents.push(itemProxy.item);
      }
    }, undefined);

    subcomponents.sort((oneSubcomponent: any, anotherSubcomponent: any) => {
      return oneSubcomponent.name.localeCompare(anotherSubcomponent.name);
    });

    return subcomponents;
  }
}
