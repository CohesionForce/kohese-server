import { Component, OnInit } from '@angular/core';
import { BundleService } from '../../services/bundle-service/bundle.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent implements OnInit {

  constructor(private bundleService: BundleService) { }

  ngOnInit() {
    console.log('Dashboard Init');
    console.log(this);
  }
}
