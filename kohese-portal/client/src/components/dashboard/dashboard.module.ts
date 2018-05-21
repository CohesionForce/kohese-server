import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { NgModule } from "@angular/core/";

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
import { ActiveAssignmentComponent } from "./assignment-dashboard/active-assignment/active-assignment.component";
import { DueAssignmentComponent } from "./assignment-dashboard/due-assignment/due-assignment.component";
import { OpenAssignmentComponent } from "./assignment-dashboard/open-assignment/open-assignment.component";
import { CompletedAssignmentComponent } from "./assignment-dashboard/completed-assignment/completed-assignment.component";
import { DependencyInfoComponent } from './assignment-dashboard/dependency-info/dependency-info.component';
import { LensModule } from "../lens/lens.module";
import { ProjectDashboardComponent } from "./project-dashboard/project-dashboard.component";
import { ProjectOverviewComponent } from "./project-dashboard/project-overview/project-overview.component";
import { UserStatisticsComponent } from "./project-dashboard/user-statistics/user-statistics.component";
import { ActionTableModule } from "../action-table/action-table.module";
import { ProjectSelectorComponent } from "./project-dashboard/project-selector/project-selector.component";
import { TreeModule } from "angular-tree-component";

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardSelectorComponent,
    AssignmentDashboardComponent,
    UserDashboardComponent,
    ActiveAssignmentComponent,
    DueAssignmentComponent,
    CompletedAssignmentComponent,
    DependencyInfoComponent,
    ProjectDashboardComponent,
    ProjectOverviewComponent,
    UserStatisticsComponent,
    ProjectSelectorComponent,
    OpenAssignmentComponent
  ],
  entryComponents: [
    KMarkdownComponent,
    ProjectSelectorComponent
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
    VirtualScrollModule
  ],
  exports : [
    DashboardComponent
  ]

})
export class DashboardModule {}
