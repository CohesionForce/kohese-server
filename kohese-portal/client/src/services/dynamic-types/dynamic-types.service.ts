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


import { Injectable } from '@angular/core';

import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { KoheseType } from '../../classes/UDT/KoheseType.class';

@Injectable()
export class DynamicTypesService {
  /* Data */
  koheseTypes: object;
  treeConfig: any;

  private _localTypeMap: Map<string, Array<string>> =
    new Map<string, Array<string>>();
  get localTypeMap() {
    return this._localTypeMap;
  }

  /* Subscriptions */
  treeConfigSubscription: Subscription;

  private readonly USER_INPUT_TYPES: any = {
    'text': 'Text',
    'date': 'Date',
    'select': 'Select',
    'markdown': 'Markdown',
    'reference': 'Reference',
    'proxy-selector': 'Item Reference',
    'user-selector': 'User Name',
    'state-editor': 'State Editor'
  };

  /* Observables */

  /* Subscriptions */
  repoStatusSubscription: Subscription;

  constructor(private ItemRepository: ItemRepository) {
    this.koheseTypes = {};
    this.repoStatusSubscription = this.ItemRepository.getRepoStatusSubject()
      .subscribe((update: any) => {
        switch (update.state) {
          case RepoStates.KOHESEMODELS_SYNCHRONIZED:
          case RepoStates.SYNCHRONIZATION_SUCCEEDED:
            this.treeConfigSubscription = this.ItemRepository.getTreeConfig().subscribe((newConfig) => {
              if (newConfig) {
                this.treeConfig = newConfig.config;

                let modelProxy: ItemProxy = this.treeConfig.getProxyFor('Model-Definitions');
                let typeProxies: Array<ItemProxy> = modelProxy.
                  getDescendants().filter((itemProxy: ItemProxy) => {
                  return (itemProxy.kind !== 'Namespace');
                }).sort((first: ItemProxy, second: ItemProxy) => {
                    return ((first.item.name > second.item.name) ?
                      1 : ((first.item.name < second.item.name) ? -1 : 0));
                  });
                for (let j: number = 0; j < typeProxies.length; j++) {
                  this.buildKoheseType(typeProxies[j] as KoheseModel);
                }

                if (this.repoStatusSubscription) {
                  this.repoStatusSubscription.unsubscribe();
                }
              }
            })
        }
      })
  }

  getKoheseTypes(): object {
    return this.koheseTypes;
  }

  public buildKoheseType(dataModelProxy: KoheseModel): void {
    let viewModelProxyMap: any = {};
    let modelProxy: KoheseModel = dataModelProxy;
    do {
      viewModelProxyMap[modelProxy.item.id] = this.getViewProxyFor(modelProxy);
      modelProxy = modelProxy.parentProxy;
    } while (modelProxy.item.base)
    let type: KoheseType = new KoheseType(dataModelProxy, viewModelProxyMap);
    dataModelProxy.type = type;

    /* Add the newly-built KoheseType to koheseTypes and sort koheseTypes
    alphabetically */
    this.koheseTypes[dataModelProxy.item.name] = type;
    let koheseTypeNames: Array<string> = Object.keys(this.koheseTypes);
    koheseTypeNames.sort();
    let intermediateObject: any = {};
    for (let j: number = 0; j < koheseTypeNames.length; j++) {
      intermediateObject[koheseTypeNames[j]] = this.koheseTypes[koheseTypeNames[j]];
      delete this.koheseTypes[koheseTypeNames[j]];
    }
    for (let koheseTypeName in intermediateObject) {
      this.koheseTypes[koheseTypeName] = intermediateObject[koheseTypeName];
    }

    this._localTypeMap.set(dataModelProxy.item.name, Object.keys(
      dataModelProxy.item.localTypes));

    // Migration code
    if (viewModelProxyMap[dataModelProxy.item.id] && !viewModelProxyMap[
      dataModelProxy.item.id].item.tableDefinitions) {
      viewModelProxyMap[dataModelProxy.item.id].item.tableDefinitions = {};
    }
  }

  public removeKoheseType(koheseTypeName: string): void {
    delete this.koheseTypes[koheseTypeName];
  }

  getViewProxyFor(modelProxy: KoheseModel): ItemProxy {
    return modelProxy.view;
  }

  getUserInputTypes(): any {
    return this.USER_INPUT_TYPES;
  }

  getIcons(): Array<string> {
    return ['fa fa-gavel', 'fa fa-user', 'fa fa-tasks', 'fa fa-database',
      'fa fa-exclamation-circle', 'fa fa-comment', 'fa fa-sticky-note',
      'fa fa-sitemap', 'fa fa-paper-plane', 'fa fa-trash'];
  }
}
