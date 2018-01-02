import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service'
import { TabService } from '../../services/tab/tab.service';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'analysis-view',
  templateUrl : './analysis.component.html'
})
export class AnalysisComponent extends NavigatableComponent
                               implements OnInit, OnDestroy {

  /* UI Toggles */
  showChildren : boolean;

  /* Data */
  itemProxyId : string;
  filter : string;

  /* Subscriptions */
  routeSub : Subscription;
  filterSub : Subscription;

  /* Observables */
  filterSubject : BehaviorSubject<string>

  constructor(protected NavigationService : NavigationService,
              protected TabService : TabService,
              private route : ActivatedRoute,
              private ItemRepository : ItemRepository) {
    super(NavigationService, TabService)

  }

  ngOnInit () {
    this.routeSub = this.route.params.subscribe(params => {
      this.itemProxyId = params['id'];
    })

    this.filter = ''
  }

  ngOnDestroy () {

  }
}


