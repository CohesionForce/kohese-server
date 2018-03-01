import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../common/models/item-proxy.js';
import { Observable, Subscription } from 'rxjs';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
@Component({
  selector : 'history-tab',
  templateUrl : './history-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryTabComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy{
  @Input()
  proxyStream : Observable<ItemProxy>
  streamSub : Subscription;
  itemProxy : ItemProxy;
  historySub : Subscription;

  constructor(protected NavigationService : NavigationService,
              private changeRef : ChangeDetectorRef,
              private itemRepository : ItemRepository) {
    super(NavigationService);
  }

  ngOnInit() {
    this.streamSub = this.proxyStream.subscribe((newProxy)=>{
      this.itemProxy = newProxy;
      if (this.historySub) {
        this.historySub.unsubscribe()
      }
      
      this.historySub = this.itemRepository.getHistoryFor(this.itemProxy)
        .subscribe((historicalProxy)=>{
          if (this.itemProxy.item.id ===
              historicalProxy.item.id) {
                this.itemProxy = historicalProxy;
                this.changeRef.markForCheck();
              }
        })
      
      this.changeRef.markForCheck();   
    })
  }

  ngOnDestroy () {
    this.streamSub.unsubscribe();
    this.historySub.unsubscribe();
  }
}
