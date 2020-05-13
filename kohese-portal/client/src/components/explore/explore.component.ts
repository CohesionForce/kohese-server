import { Component, OnInit, OnDestroy } from '@angular/core';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ActivatedRoute, Params } from '@angular/router';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { Subscription } from 'rxjs';

@Component({
  selector : 'explore-view',
  templateUrl : './explore.component.html',
  styleUrls: ['./explore.component.scss']
})

export class ExploreComponent extends NavigatableComponent
                              implements OnInit, OnDestroy {
  private _itemProxy: ItemProxy;
  get itemProxy() {
    return this._itemProxy;
  }

  treeConfigSubscription : Subscription;

  constructor (protected NavigationService : NavigationService,
               private itemRepository : ItemRepository,
               private router : ActivatedRoute) {
    super(NavigationService);
  }

  ngOnInit () {
   this.treeConfigSubscription = this.itemRepository.getTreeConfig().subscribe(
     (treeConfigurationObject: any)=>{
     if (treeConfigurationObject) {
       this.router.params.subscribe((params: Params) => {
         if (params['id']) {
           this._itemProxy = treeConfigurationObject.config.getProxyFor(params[
             'id']);
         }
       });
     }
   });
  }

  ngOnDestroy () {
    this.treeConfigSubscription.unsubscribe();
  }
}
