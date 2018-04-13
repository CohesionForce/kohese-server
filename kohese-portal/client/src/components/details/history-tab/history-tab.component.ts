import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../common/src/item-proxy.js';
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

  constructor(protected NavigationService : NavigationService,
              private changeRef : ChangeDetectorRef,
              private itemRepository : ItemRepository) {
    super(NavigationService);
  }

  ngOnInit() {
    this.streamSub = this.proxyStream.subscribe((newProxy)=>{
      this.itemProxy = newProxy;
      this.itemRepository.getHistoryFor(this.itemProxy).subscribe(
        (history: Array<any>) => {
          this.changeRef.markForCheck();
      });
    })
  }

  ngOnDestroy () {
    this.streamSub.unsubscribe();
  }
}
