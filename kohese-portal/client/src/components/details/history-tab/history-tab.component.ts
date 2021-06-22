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


import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { MatExpansionPanel } from '@angular/material';
import { BehaviorSubject, Subscription } from 'rxjs';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { Compare } from '../../compare-items/compare.class';
import { Comparison } from '../../compare-items/comparison.class';
import { ItemProxy } from '../../../../../common/src/item-proxy.js';
import { ItemCache } from '../../../../../common/src/item-cache';
import { KoheseCommit } from '../../../../../common/src/kohese-commit';

@Component({
  selector: 'history-tab',
  templateUrl: './history-tab.component.html',
  styleUrls: ['./history-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryTabComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  @Input()
  proxyStream: BehaviorSubject<ItemProxy>;

  private _versions: Array<any> = [];
  get versions() {
    return this._versions;
  }

  @ViewChildren(MatExpansionPanel)
  private _expansionPanels: QueryList<MatExpansionPanel>;

  private _differenceMap: Map<string, any> = new Map<string, any>();
  get differenceMap() {
    return this._differenceMap;
  }

  streamSub: Subscription;
  itemCache: ItemCache;

  constructor(
    protected NavigationService: NavigationService,
    private changeRef: ChangeDetectorRef,
    private _dynamicTypesService:
    DynamicTypesService,
    ) {
    super(NavigationService);
    this.itemCache = ItemCache.getItemCache();
  }

  ngOnInit() {
    this.streamSub = this.proxyStream.subscribe(async (newProxy) => {
      if (newProxy) {
        this._versions = await ItemCache.getItemCache().getHistory(newProxy.
          item.id);
        this._differenceMap.clear();
        this.changeRef.markForCheck();
      }
    })
  }

  ngOnDestroy() {
    this.streamSub.unsubscribe();
  }

  public changeAllExpansionStates(expand: boolean): void {
    let expansionPanels: Array<MatExpansionPanel> = this.
      _expansionPanels.toArray();
    for (let j: number = 0; j < expansionPanels.length; j++) {
      expansionPanels[j].expanded = expand;
    }

    this.changeRef.markForCheck();
  }

  public async compare(version: any): Promise<void> {
    let itemProxy: ItemProxy = this.proxyStream.getValue();
    let changeKoheseCommit: KoheseCommit = await ItemCache.getItemCache().getCommit(version.commit);
    let changeBlobTreeHash: any = (await changeKoheseCommit.getTreeHashMap())[itemProxy.item.id];
    let changeBlob = await this.itemCache.getBlob(changeBlobTreeHash.oid);

    let baseBlobTreeHash: any;
    let baseBlob: any;
    for (let j: number = 0; j < changeKoheseCommit.parents.length; j++) {
      let baseKoheseCommit: KoheseCommit = await ItemCache.getItemCache().getCommit(changeKoheseCommit.parents[j]);
      baseBlobTreeHash = (await baseKoheseCommit.getTreeHashMap())[itemProxy.item.id];
      if (baseBlobTreeHash) {
        baseBlob = await this.itemCache.getBlob(baseBlobTreeHash.oid);
        if (baseBlob) {
          break;
        }
      }
    }

    this._differenceMap.set(version.commit, await Compare.compareItems(
      itemProxy.item.id,
      baseBlobTreeHash ? baseBlobTreeHash.kind : undefined,
      baseBlob,
      itemProxy.item.id,
      changeBlobTreeHash ? changeBlobTreeHash.kind : undefined,
      changeBlob,
      this._dynamicTypesService));
    this.changeRef.markForCheck();
  }
}
