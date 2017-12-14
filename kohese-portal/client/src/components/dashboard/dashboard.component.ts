import { Component, OnInit } from '@angular/core';
import { BundleService } from '../../services/bundle/bundle.service';
import { NavigationService } from '../../services/navigation/navigation.service';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { TabService } from '../../services/tab/tab.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent extends NavigatableComponent implements OnInit {

  constructor(private bundleService: BundleService,
              protected NavigationService : NavigationService,
              protected TabService : TabService) {
    super(NavigationService, TabService);
               }

  ngOnInit() {
    console.log('Dashboard Init Test');
    console.log(this);
  }
}
