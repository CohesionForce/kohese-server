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
    let changeKoheseCommit: KoheseCommit = await ItemCache.getItemCache().
      getCommit(version.commit);
    let changeBlob: any = (await changeKoheseCommit.getTreeHashMap())[itemProxy.
      item.id];
    let baseBlob: any;
    for (let j: number = 0; j < changeKoheseCommit.parents.length; j++) {
      let baseKoheseCommit: KoheseCommit = await ItemCache.getItemCache().
        getCommit(changeKoheseCommit.parents[j]);
      baseBlob = (await baseKoheseCommit.getTreeHashMap())[itemProxy.item.
        id];
      if (baseBlob) {
        break;
      }
    }
    
    this._differenceMap.set(version.commit, await Compare.compareItems(
      itemProxy.item.id, (baseBlob ? baseBlob.kind : undefined), (baseBlob ?
      baseBlob.oid : undefined), itemProxy.item.id, changeBlob.kind,
      changeBlob.oid, this._dynamicTypesService));
    this.changeRef.markForCheck();
  }
}
