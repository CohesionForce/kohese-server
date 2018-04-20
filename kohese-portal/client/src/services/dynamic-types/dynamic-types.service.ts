import { Injectable } from '@angular/core';

import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseType } from '../../classes/UDT/KoheseType.class';

@Injectable()
export class DynamicTypesService {
  /* Data */
  koheseTypes: object;
  treeConfig: any;

  /* Subscriptions */
  treeConfigSubscription: Subscription;

  private readonly USER_INPUT_TYPES: any = {
    'types': 'Text',
    'proxy-selector': 'Reference',
    'date': 'Date'
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
                this.treeConfig = newConfig;

                let modelProxy: ItemProxy = this.treeConfig.getProxyFor('Model-Definitions');
                let typeProxies: Array<ItemProxy> = modelProxy.getDescendants().
                  sort((first: ItemProxy, second: ItemProxy) => {
                    return ((first.item.name > second.item.name) ?
                      1 : ((first.item.name < second.item.name) ? -1 : 0));
                  });
                this.buildKoheseTypes(typeProxies);
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

  buildKoheseTypes(typeProxies: Array<ItemProxy>): void {
    for (var i: number = 0; i < typeProxies.length; i++) {
      let currentType: ItemProxy = typeProxies[i];
      let viewProxy: ItemProxy = this.getViewProxyFor(currentType);
      let type: KoheseType = new KoheseType(currentType, viewProxy);
      this.koheseTypes[currentType.item.name] = type;
      currentType.type = type;
    }
  }

  getViewProxyFor(modelProxy: ItemProxy): ItemProxy {
    return this.treeConfig.getProxyFor('view-' + modelProxy.item.name.toLowerCase());
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
