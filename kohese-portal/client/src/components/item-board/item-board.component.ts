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
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';

// Other External Dependencies

// Kohese
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DetailsComponent } from '../details/details.component';
import { FormatDefinitionType } from '../../../../common/src/FormatDefinition.interface';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';

interface CategoryItems {
  category: string,
  items: Array<any>
}

@Component({
  selector: 'item-board',
  templateUrl: './item-board.component.html',
  styleUrls: ['./item-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemBoardComponent {
  private _project: any;
  get project() {
    return this._project;
  }
  @Input('project')
  set project(project: any) {
    this._project = project;
    this.selectedKind = this.getBoardKinds()[0];
  }

  private _selectedKind: any;
  get selectedKind() {
    return this._selectedKind;
  }
  set selectedKind(selectedKind: any) {
    this._selectedKind = selectedKind;
    for (let attributeName in this._selectedKind.classProperties) {
      this._selectedKind.classProperties[attributeName].definition.name =
        attributeName;
    }
    if (this._selectedKind.stateProperties.length > 0) {
      // Kind has state properties, so default to last state
      let defaultStatePropertyName = this._selectedKind.stateProperties[this._selectedKind.stateProperties.length - 1];
      this._selectedAttribute = this._selectedKind.classProperties[defaultStatePropertyName].definition;
    } else {
      this._selectedAttribute = this._selectedKind.classProperties['createdBy'].definition;
    }
    this._viewModel = TreeConfiguration.getWorkingTree().getModelProxyFor(this._selectedKind.name).view.item;

    this._changeDetectorRef.markForCheck();
  }

  private _selectedAttribute: any;
  get selectedAttribute() {
    return this._selectedAttribute;
  }
  set selectedAttribute(selectedAttribute: any) {
    this._selectedAttribute = selectedAttribute;
    if (this._selectedAttribute !== selectedAttribute) {
      this._shouldGroupElements = true;
    }
  }

  private _shouldGroupElements: boolean = true;
  get shouldGroupElements() {
    return this._shouldGroupElements;
  }
  set shouldGroupElements(shouldGroupElements: boolean) {
    this._shouldGroupElements = shouldGroupElements;
  }

  private _viewModel: any;
  get viewModel() {
    return this._viewModel;
  }

  get changeDetectorRef() {
    return this._changeDetectorRef;
  }

  get itemRepository() {
    return this._itemRepository;
  }

  get FormatDefinitionType() {
    return FormatDefinitionType;
  }

  get Object() {
    return Object;
  }

  private _editableSet: Array<string> = [];
  get editableSet() {
    return this._editableSet;
  }

  get navigationService() {
    return this._navigationService;
  }

  private _treeConfigurationSubscription;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: NavigationService,
    private _itemRepository: ItemRepository,
    private changeRef : ChangeDetectorRef,
    private _dialogService: DialogService) {
  }

  public ngOnInit(): void {
    this._treeConfigurationSubscription = TreeConfiguration.getWorkingTree().
      getChangeSubject().subscribe((notification: any) => {
        switch (notification.type) {
          case 'create':
          case 'update':
          case 'dirty':
          case 'delete': {
            this._changeDetectorRef.markForCheck();
            break;
          }
        }
      });
  }

  public ngOnDestroy(): void {
    if (this._treeConfigurationSubscription) {
      this._treeConfigurationSubscription.unsubscribe();
    }
  }

  public getBoardKinds(): Array<any> {
    let kinds: Array<any> = [];
    for (let j: number = 0; j < this._project.projectItems.length; j++) {
      TreeConfiguration.getWorkingTree().getProxyFor(
        this._project.projectItems[j].id).visitTree({ includeOrigin: true }, (itemProxy: ItemProxy) => {
          let kind: any = itemProxy.model.item;
          if (kinds.indexOf(kind) === -1) {
            kinds.push(kind);
          }
        }, undefined);
    }

    kinds.sort((oneKind: any, anotherKind: any) => {
      return oneKind.name.localeCompare(anotherKind.name);
    });

    return kinds;
  }

  public isSelectedAttributeMultivaluedAndInstantaneouslyFinite(): boolean {
    return (Array.isArray(this._selectedAttribute.type) && ((this.
      _selectedAttribute.type[0] !== 'string' || this._selectedAttribute.
        relation)) && (this._selectedAttribute.type[0] !== 'number'));
  }

  public getCategoryItems(): Array<CategoryItems> {
    let categoryItems: { [key: string]: CategoryItems } = {};
    let attributeType: string = (Array.isArray(this._selectedAttribute.type) ?
      this._selectedAttribute.type[0] : this._selectedAttribute.type);
    if ((attributeType === 'StateMachine') || ((attributeType === 'string') &&
      this._selectedAttribute.relation && (this._selectedAttribute.relation.
        kind === 'KoheseUser'))) {
      if (attributeType === 'StateMachine') {
        for (let stateName in this._selectedAttribute.properties.state) {
          let categoryEntry: CategoryItems = {
            category: stateName,
            items: []
          };
          categoryItems[stateName] = categoryEntry;
        }
      } else {
        let userItems: Array<any> = [];
        TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
          { includeOrigin: false }, (itemProxy: ItemProxy) => {
            if (itemProxy.kind === 'KoheseUser') {
              userItems.push(itemProxy.item);
            }
          }, undefined);

        userItems.sort((oneItem: any, anotherItem: any) => {
          return oneItem.name.localeCompare(anotherItem.name);
        });

        for (let j: number = 0; j < userItems.length; j++) {
          categoryItems[userItems[j].name] = {
            category: userItems[j].name,
            items: []
          };
        }
      }

      for (let j: number = 0; j < this._project.projectItems.length; j++) {
        TreeConfiguration.getWorkingTree().getProxyFor(this._project.
          projectItems[j].id).visitTree({ includeOrigin: true },
            (itemProxy: ItemProxy) => {
              if ((itemProxy.model.item === this._selectedKind) && (itemProxy.item[
                this._selectedAttribute.name])) {
                let categoryEntry: CategoryItems = categoryItems[itemProxy.item[
                  this._selectedAttribute.name]];
                categoryEntry.items.push(itemProxy.item);
              }
            }, undefined);
      }
    } else {
      for (let j: number = 0; j < this._project.projectItems.length; j++) {
        TreeConfiguration.getWorkingTree().getProxyFor(this._project.
          projectItems[j].id).visitTree({ includeOrigin: true },
            (itemProxy: ItemProxy) => {
              if ((itemProxy.model.item === this._selectedKind) && (itemProxy.
                item[this._selectedAttribute.name])) {
                let attributeValue: any = itemProxy.item[this._selectedAttribute.
                  name];
                let attributeAsString: string;
                if (this._shouldGroupElements) {
                  if (typeof attributeValue === 'object') {
                    attributeAsString = JSON.stringify(attributeValue);
                  } else {
                    attributeAsString = String(attributeValue);
                  }
                  let categoryEntry: CategoryItems = categoryItems[attributeAsString];
                  if (!categoryEntry) {
                    categoryEntry = {
                      category: attributeAsString,
                      items: []
                    };
                    categoryItems[attributeAsString] = categoryEntry;
                  }

                  categoryEntry.items.push(itemProxy.item);
                } else {
                  for (let k: number = 0; k < attributeValue.length; k++) {
                    if (typeof attributeValue[k] === 'object') {
                      attributeAsString = JSON.stringify(attributeValue[k]);
                    } else {
                      attributeAsString = String(attributeValue[k]);
                    }
                    let categoryEntry: CategoryItems = categoryItems[
                      attributeAsString];
                    if (!categoryEntry) {
                      categoryEntry = {
                        category: attributeAsString,
                        items: []
                      };
                      categoryItems[attributeAsString] = categoryEntry;
                    }

                    categoryEntry.items.push(itemProxy.item);
                  }
                }
              }
            }, undefined);
      }
    }

    return Object.values(categoryItems);
  }

  public getCategoryItemsIdentifier(index: number, element: any): string {
    let categoryItems: CategoryItems = (element as CategoryItems);
    return categoryItems.category + categoryItems.items.map((item: any) => {
      return item.id;
    }).join('');
  }

  public getCategoryHeading(categoryItems: CategoryItems): string {
    if (this._selectedAttribute.relation && (this._selectedAttribute.relation.
      kind !== 'KoheseUser')) {
      if (this._shouldGroupElements) {
        return (JSON.parse(categoryItems.category) as Array<any>).map(
          (reference: { id: string }) => {
            if (TreeConfiguration.getWorkingTree().getProxyFor(this.
              _selectedAttribute.type[0])) {
              return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).
                item.name;
            } else {
              return JSON.stringify(reference);
            }
          }).join(', ');
      } else {
        if (TreeConfiguration.getWorkingTree().getProxyFor(this.
          _selectedAttribute.type)) {
          return TreeConfiguration.getWorkingTree().getProxyFor(JSON.parse(
            categoryItems.category).id).item.name;
        } else {
          return categoryItems.category;
        }
      }
    } else {
      return categoryItems.category;
    }
  }

  public mayDrag(): boolean {
    let attributeType: string = (Array.isArray(this._selectedAttribute.type) ?
      this._selectedAttribute.type[0] : this._selectedAttribute.type);
    return ((attributeType === 'StateMachine') || ((attributeType === 'string')
      && this._selectedAttribute.relation && (this._selectedAttribute.relation.
        kind === 'KoheseUser')));
  }

  public draggedOver(dragOverEvent: any, categoryItems: CategoryItems): void {
    let mayDrop: boolean = false;
    let currentState: string = dragOverEvent.dataTransfer.types[0];
    if ((Array.isArray(this._selectedAttribute.type) ? this._selectedAttribute.
      type[0] : this._selectedAttribute.type) === 'StateMachine') {
      for (let transitionName in this._selectedAttribute.properties.transition) {
        let transition: any = this._selectedAttribute.properties.transition[
          transitionName];
        if ((transition.source.toLowerCase() === currentState) && (transition.
          target === categoryItems.category)) {
          mayDrop = true;
          break;
        }
      }
    } else {
      mayDrop = true;
    }

    if (mayDrop) {
      dragOverEvent.preventDefault();
      dragOverEvent.currentTarget.style.border = 'dashed';
    }
  }

  public cardDropped(id: string, targetCategory: string): void {
    let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      id);
    itemProxy.item[this._selectedAttribute.name] = targetCategory;
    this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item);
  }

  public displayInformation(item: any): void {
    this._dialogService.openComponentDialog(DetailsComponent, {
      data: {
        itemProxy: TreeConfiguration.getWorkingTree().getProxyFor(item.id)
      }
    }).updateSize('90%', '90%');
  }

  public save(item: any): void {
    let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(item.id);
    if(itemProxy.dirty) {
      this._itemRepository.upsertItem(itemProxy.kind, item).then(
        // Makes sure the save is complete before marking for check
        (returnedItemProxy: ItemProxy) => {
          this.changeRef.markForCheck();
        });
      this._editableSet.splice(this._editableSet.indexOf(item.id), 1);
    }

  }

  public async discardChanges(item: any): Promise<void> {
    if(item.$proxy.dirty) {
      let response = await this._dialogService.openYesNoDialog('Discard Changes?', '');
      if(response === false) {
        return;
      }
      if(response === true) {
          await this._itemRepository.fetchItem(item.$proxy);
          this._editableSet.splice(this._editableSet.indexOf(item.id), 1);
          this.changeDetectorRef.markForCheck();
      }
    } else {
      this._editableSet.splice(this._editableSet.indexOf(item.id), 1);
    }
  }
}
