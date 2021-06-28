// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Title } from '@angular/platform-browser';

// NPM
import { Subscription } from 'rxjs';

// Kohese
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../common/src/item-proxy';

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
               private router : ActivatedRoute,
               private title : Title
               ) {
    super(NavigationService);
    this.title.setTitle('Explorer');
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
