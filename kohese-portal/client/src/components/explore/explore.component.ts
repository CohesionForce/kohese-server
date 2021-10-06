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


// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

// Other External Dependencies

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
