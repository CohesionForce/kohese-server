import { Component, OnInit, OnDestroy, Output, Input } from '@angular/core';
import { EventEmitter } from 'events';

import { ItemProxy } from '../../../../../common/models/item-proxy.js';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';

import { RowComponent } from '../../../classes/RowComponent.class';
import { ProxyFilter } from '../../../classes/ProxyFilter.class';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'tree-row',
  templateUrl : './tree-row.component.html'
})

export class TreeRowComponent extends RowComponent
                              implements OnInit, OnDestroy {


  /* UI Triggers
     RowComponent : exactFilter
                    collapsed */

  /* Data
     RowComponent : proxyCollection */

  /* Observables
     RowComponent : filterSubject */

  /* Subscriptions */
  filterSubscription : Subscription;

  constructor (NavigationService : NavigationService,
               TabService : TabService) {
    super(NavigationService, TabService);
    console.log(this);

  }

  ngOnInit () {
    console.log('Init Row');
    this.filterSubscription = this.filterSubject.subscribe(newFilter => {
      this.filter = newFilter;
    })
    // Initialize rows to collapsed status
    this.collapsed = {}
    for (let itemProxy of this.proxyCollection) {
      this.collapsed[itemProxy.id] = false;
    }
  }

  ngOnDestroy () {
    this.filterSubscription.unsubscribe();
  }

  removeItem (proxy : ItemProxy) {
    console.log('Remove item');
    console.log(proxy);
  }
}

