import { StateSummaryDialogComponent } from './project-dashboard/status-dashboard/state-bar-chart/state-summary-dialog/state-summary-dialog.component';
import { StateBarChartComponent } from './project-dashboard/status-dashboard/state-bar-chart/state-bar-chart.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { NgModule } from "@angular/core/";
import { NgxDatatableModule } from '@swimlane/ngx-datatable'

import { CommonModule } from "@angular/common";
import { KMarkdownComponent } from "../user-input/k-markdown/k-markdown.component";
import { ServicesModule } from '../../services/services.module';
import { MaterialModule } from '../../material.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardSelectorComponent } from './dashboard-selector/dashboard-selector.component';
import { UserInputModule } from '../user-input/user-input.module';
import { AssignmentDashboardComponent } from './assignment-dashboard/assignment-dashboard.component'
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { PipesModule } from "../../pipes/pipes.module";
import { DueAssignmentComponent } from "./assignment-dashboard/due-assignment/due-assignment.component";
import { OpenAssignmentComponent } from "./assignment-dashboard/open-assignment/open-assignment.component";
import { CompletedAssignmentComponent } from "./assignment-dashboard/completed-assignment/completed-assignment.component";
import { DependencyInfoComponent } from './assignment-dashboard/dependency-info/dependency-info.component';
import { LensModule } from "../lens/lens.module";
import { ProjectDashboardComponent } from "./project-dashboard/project-dashboard.component";
import { ProjectOverviewComponent } from "./project-dashboard/project-overview/project-overview.component";
import { StatusDashboardComponent } from './project-dashboard/status-dashboard/status-dashboard.component';
import { UserStatisticsComponent } from "./project-dashboard/user-statistics/user-statistics.component";
import { ProjectSelectorComponent } from "./project-dashboard/project-selector/project-selector.component";
import { TreeModule } from "angular-tree-component";
import { StateFilterService } from './state-filter.service';
import { StatefulProxyCardComponent } from './stateful-proxy-card/stateful-proxy-card.component';
import { ReportDashboardComponent } from './report-dashboard/report-dashboard.component';
import { ReportGeneratorModule } from '../report-generator/report-generator.module';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardSelectorComponent,
    AssignmentDashboardComponent,
    UserDashboardComponent,
    DueAssignmentComponent,
    CompletedAssignmentComponent,
    DependencyInfoComponent,
    ProjectDashboardComponent,
    ProjectOverviewComponent,
    UserStatisticsComponent,
    ProjectSelectorComponent,
    StatusDashboardComponent,
    OpenAssignmentComponent,
    StateBarChartComponent,
    StateSummaryDialogComponent,
    StatefulProxyCardComponent,
    ReportDashboardComponent
  ],
  providers : [
    StateFilterService
  ],
  entryComponents: [
    KMarkdownComponent,
    ProjectSelectorComponent,
    StateSummaryDialogComponent

  ],
  imports : [
    CommonModule,
    ServicesModule,
    MaterialModule,
    UserInputModule,
    PipesModule,
    UserInputModule,
    LensModule,
    TreeModule,
    VirtualScrollModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ReportGeneratorModule
  ],
  exports : [
    DashboardComponent
  ]

})
export class DashboardModule {}
