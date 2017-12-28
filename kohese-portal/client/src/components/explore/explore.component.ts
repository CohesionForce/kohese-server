import { Component, OnInit, OnDestroy } from '@angular/core';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { TabService } from '../../services/tab/tab.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector : 'explore-view',
  templateUrl : './explore.component.html'
})

export class ExploreComponent extends NavigatableComponent
                              implements OnInit, OnDestroy {
  proxySelected : boolean;

  constructor (protected NavigationService : NavigationService,
               protected TabService : TabService,
               private router : ActivatedRoute) {
    super(NavigationService, TabService);
    }

  ngOnInit () {
   this.router.params.subscribe(params => {
     if (params['id']) {
      this.proxySelected = true;
     } else {
       this.proxySelected = false;
     }
   })
  }

  ngOnDestroy () {

  }
}
