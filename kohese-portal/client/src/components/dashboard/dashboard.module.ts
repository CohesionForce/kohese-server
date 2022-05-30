/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { ActivityFeedComponent } from './activity-feed/activity-feed.component';
import { StateSummaryDialogComponent } from './project-dashboard/status-dashboard/state-bar-chart/state-summary-dialog/state-summary-dialog.component';
import { StateBarChartComponent } from './project-dashboard/status-dashboard/state-bar-chart/state-bar-chart.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { NgModule } from "@angular/core";

import { CommonModule } from "@angular/common";
import { KMarkdownComponent } from "../user-input/k-markdown/k-markdown.component";
import { ServicesModule } from '../../services/services.module';
import { MaterialModule } from '../../material.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardSelectorComponent } from './dashboard-selector/dashboard-selector.component';
import { UserInputModule } from '../user-input/user-input.module';
import { AssignmentDashboardComponent } from './assignment-dashboard/assignment-dashboard.component'
import { PipesModule } from "../../pipes/pipes.module";
import { DueAssignmentComponent } from "./assignment-dashboard/due-assignment/due-assignment.component";
import { OpenAssignmentComponent } from "./assignment-dashboard/open-assignment/open-assignment.component";
import { CompletedAssignmentComponent } from "./assignment-dashboard/completed-assignment/completed-assignment.component";
import { LensModule } from "../lens/lens.module";
import { ProjectDashboardComponent } from "./project-dashboard/project-dashboard.component";
import { ProjectOverviewComponent } from "./project-dashboard/project-overview/project-overview.component";
import { StatusDashboardComponent } from './project-dashboard/status-dashboard/status-dashboard.component';
import { UserStatisticsComponent } from "./project-dashboard/user-statistics/user-statistics.component";
import { ProjectSelectorComponent } from "./project-dashboard/project-selector/project-selector.component";
import { TreeModule } from "@circlon/angular-tree-component";
import { StateFilterService } from './state-filter.service';
import { ObjectEditorModule } from '../object-editor/object-editor.module';
import { ItemBoardModule } from '../item-board/item-board.module';
import { DirectivesModule } from '../../directives/directives.module';
import { AngularSplitModule } from 'angular-split';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardSelectorComponent,
    AssignmentDashboardComponent,
    DueAssignmentComponent,
    CompletedAssignmentComponent,
    ProjectDashboardComponent,
    ProjectOverviewComponent,
    UserStatisticsComponent,
    ProjectSelectorComponent,
    StatusDashboardComponent,
    OpenAssignmentComponent,
    StateBarChartComponent,
    StateSummaryDialogComponent,
    ActivityFeedComponent
  ],
  providers : [
    StateFilterService
  ],
  entryComponents: [
    KMarkdownComponent,
    ProjectSelectorComponent,
    StateSummaryDialogComponent,
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
    ObjectEditorModule,
    ItemBoardModule,
    DirectivesModule,
    AngularSplitModule
  ],
  exports : [
    DashboardComponent
  ]

})
export class DashboardModule {}
