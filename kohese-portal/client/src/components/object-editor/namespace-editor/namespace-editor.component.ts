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
  private _globalNamespace: any = this._itemRepository.getTreeConfig().
    getValue().config.getProxyFor('750c7c00-d658-11ea-80c8-3b7d496d4ca3').item;
  get globalNamespace() {
    return this._globalNamespace;
  }

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
      parentId: (this._selectedNamespace ? this._selectedNamespace.id : this.
        _globalNamespace.id),
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
   * Upon confirmation, removes the given Namespace and all of its descendants
   * from the system and adjusts all types that have a supertype of a type to
   * be removed
   * 
   * @param namespace
   */
  public async remove(namespace: any): Promise<void> {
    let proceed: boolean = await this._dialogService.openYesNoDialog(
      'Remove ' + namespace.name, 'Removing ' + namespace.name + ' is to ' +
      'remove all types and Namespaces contained within. Are you sure that ' +
      'you want to remove ' + namespace.name + '?');
    if (proceed) {
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

      for (let j: number = 0; j < typeItemProxysToRemove.length; j++) {
        this._itemRepository.deleteItem(typeItemProxysToRemove[j], false);
      }

      for (let j: number = 0 ; j < namespaceItemProxysToRemove.length; j++) {
        this._itemRepository.deleteItem(namespaceItemProxysToRemove[j], false);
      }

      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Allows addition of Namespaces and types to the selected Namespace
   */
  public async addSubcomponent(): Promise<void> {
    let treeConfiguration: TreeConfiguration = this._itemRepository.
      getTreeConfig().getValue().config;
    let results: Array<any> = await this._dialogService.openComponentsDialog(
      [{
      component: TreeComponent,
      matDialogData: {
        root: treeConfiguration.getProxyFor('Model-Definitions'),
        getChildren: (element: any) => {
          return (element as ItemProxy).children;
        },
        hasChildren: (element: any) => {
          return ((element as ItemProxy).children.length > 0);
        },
        getText: (element: any) => {
          return (element as ItemProxy).item.name;
        },
        getIcon: (element: any) => {
          return treeConfiguration.getProxyFor('view-' +
            (element as ItemProxy).kind.toLowerCase()).item.icon;
        },
        allowMultiselect: true,
        showSelections: true
      }
    }], { data: {} }).updateSize('80%', '80%').afterClosed().toPromise();
    if (results) {
      let selection: Array<any> = results[0];
      for (let j: number = 0; j < selection.length; j++) {
        if (selection[j].kind === 'Namespace') {
          selection[j].item.parentId = this._selectedNamespace.id;
        } else {
          selection[j].item.namespace.id = this._selectedNamespace.id;
        }
      }

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
