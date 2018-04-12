import { NgModule } from "@angular/core/";

import { CommonModule } from "@angular/common";
import { KMarkdownComponent } from "../user-input/k-markdown/k-markdown.component";
import { ServicesModule } from '../../services/services.module';
import { MaterialModule } from '../../material.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardSelectorComponent } from './dashboard-selector/dashboard-selector.component';
import { UserInputModule } from '../user-input/user-input.module';
import { AssignmentDashboardComponent } from './assignment-dashboard/assignment-dashboard.component'

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardSelectorComponent,
    AssignmentDashboardComponent
  ],
  entryComponents: [
    KMarkdownComponent
  ],
  imports : [
    CommonModule,
    ServicesModule,
    MaterialModule,
    UserInputModule
  ],
  exports : [
    DashboardComponent
  ]

})
export class DashboardModule {}


// TODO Implement
