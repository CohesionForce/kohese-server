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
import { CompletedAssignmentComponent } from "./assignment-dashboard/completed-assignment/completed-assignment.component";

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardSelectorComponent,
    AssignmentDashboardComponent,
    UserDashboardComponent,
    ActiveAssignmentComponent,
    DueAssignmentComponent,
    CompletedAssignmentComponent
  ],
  entryComponents: [
    KMarkdownComponent
  ],
  imports : [
    CommonModule,
    ServicesModule,
    MaterialModule,
    UserInputModule,
    PipesModule,
    UserInputModule
  ],
  exports : [
    DashboardComponent
  ]

})
export class DashboardModule {}


// TODO Implement
