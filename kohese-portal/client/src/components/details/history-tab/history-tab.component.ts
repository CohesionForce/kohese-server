import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  
  private _differenceMap: Map<string, any> = new Map<string, any>();
  get differenceMap() {
    return this._differenceMap;
  }
  
  streamSub: Subscription;

  constructor(protected NavigationService: NavigationService,
    private changeRef: ChangeDetectorRef, private _dynamicTypesService:
    DynamicTypesService) {
    super(NavigationService);
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
  
  public async compare(version: any): Promise<void> {
    let itemProxy: ItemProxy = this.proxyStream.getValue();
    let baseKoheseCommit: KoheseCommit = await ItemCache.getItemCache().
      getCommit(version.commit);
    let baseBlob: any = (await baseKoheseCommit.getTreeHashMap())[itemProxy.
      item.id];
    let changeBlob: any;
    for (let j: number = 0; j < baseKoheseCommit.parents.length; j++) {
      let changeKoheseCommit: KoheseCommit = await ItemCache.getItemCache().
        getCommit(baseKoheseCommit.parents[j]);
      changeBlob = (await changeKoheseCommit.getTreeHashMap())[itemProxy.item.
        id];
      if (changeBlob) {
        break;
      }
    }
    
    this._differenceMap.set(version.commit, await Compare.compareItems(
      itemProxy.item.id, baseBlob.kind, baseBlob.oid, itemProxy.item.id,
      (changeBlob ? changeBlob.kind : undefined), (changeBlob ? changeBlob.
      oid : undefined), this._dynamicTypesService));
    this.changeRef.markForCheck();
  }
}
