import { Component, OnInit, OnDestroy } from '@angular/core';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs';

@Component({
  selector : 'explore-view',
  templateUrl : './explore.component.html',
  styleUrls: ['./explore.component.scss']
})

export class ExploreComponent extends NavigatableComponent
                              implements OnInit, OnDestroy {
  proxySelected : boolean;
  routeId : string;

  paramSubscription : Subscription;
  treeConfigSubscription : Subscription;

  constructor (protected NavigationService : NavigationService,
               private itemRepository : ItemRepository,
               private router : ActivatedRoute) {
    super(NavigationService);
  }

  ngOnInit () {
   this.paramSubscription = this.router.params.subscribe(params => {
     console.log(params);
     this.proxySelected = !!params['id'];
     if (this.proxySelected) {
      this.routeId = params['id'];
     }
   });

   this.treeConfigSubscription = this.itemRepository.getTreeConfig().subscribe((newConfig)=>{
     if (this.routeId && newConfig) {
       if (newConfig.config.getProxyFor(this.routeId)){
         this.proxySelected = true;
       } else {
         this.proxySelected = false;
       } 
     } else {
       this.proxySelected = false;
     }
   })
  }

  ngOnDestroy () {
    this.paramSubscription.unsubscribe();
    this.treeConfigSubscription.unsubscribe();
  }
}
