import { Component, OnInit, OnDestroy } from '@angular/core';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector : 'explore-view',
  templateUrl : './explore.component.html',
  styleUrls: ['./explore.component.scss']
})

export class ExploreComponent extends NavigatableComponent
                              implements OnInit, OnDestroy {
  proxySelected : boolean;

  constructor (protected NavigationService : NavigationService,
               private router : ActivatedRoute) {
    super(NavigationService);
  }

  ngOnInit () {
   this.router.params.subscribe(params => {
     console.log(params);
     if (params['id']) {
      this.proxySelected = true;
     } else {
       this.proxySelected = false;
     }
   });
  }

  ngOnDestroy () {
  }
}
