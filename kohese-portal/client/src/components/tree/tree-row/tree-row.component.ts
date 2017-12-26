import { Component, OnInit, OnDestroy, Output, Input } from '@angular/core';
import { EventEmitter } from 'events';

import { ItemProxy } from '../../../../../common/models/item-proxy.js';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';

import { RowComponent } from '../../../classes/RowComponent.class';

@Component({
  selector: 'tree-row',
  templateUrl : './tree-row.component.html'
})

export class TreeRowComponent extends RowComponent
                              implements OnInit, OnDestroy {
  @Input()
  proxyCollection : Array<ItemProxy>

  constructor (NavigationService : NavigationService,
               TabService : TabService) {
    super(NavigationService, TabService);

  }

  ngOnInit () {
    console.log('Init Row');
    console.log(this);
  }

  ngOnDestroy () {

  }

  removeItem (proxy : ItemProxy) {
    console.log('Remove item');
    console.log(proxy);
  }
}

