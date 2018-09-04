import { Subscription } from 'rxjs';
import { DashboardSelections } from './../dashboard-selector/dashboard-selector.component';
import { Observable } from 'rxjs/Observable';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'report-dashboard',
  templateUrl: './report-dashboard.component.html',
  styleUrls: ['./report-dashboard.component.scss']
})
export class ReportDashboardComponent implements OnInit {

  DashboardSelections: any = DashboardSelections;

  @Input()
  dashboardSelectionStream: Observable<DashboardSelections>
  dashboardSelectionSub: Subscription;
  dashboardSelection: DashboardSelections;

  treeConfigSubscription: Subscription;
  proxyChangeSubscription : Subscription;

  constructor() { }

  ngOnInit() {
  }

}
