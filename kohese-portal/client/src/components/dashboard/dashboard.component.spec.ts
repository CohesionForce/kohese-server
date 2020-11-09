import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TreeModule } from 'angular-tree-component';

import { MockCurrentUserService } from '../../../mocks/services/MockCurrentUserService';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { MockSessionService } from '../../../mocks/services/MockSessionService';
import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { CurrentUserService } from '../../services/user/current-user.service';
import { SessionService } from '../../services/user/session.service';
import { CategoryBoardModule } from '../category-board/category-board.module';
import { LensModule } from '../lens/lens.module';
import { ObjectEditorModule } from '../object-editor/object-editor.module';
import { ReportGeneratorModule } from '../report-generator/report-generator.module';
import { ActivityFeedComponent } from './activity-feed/activity-feed.component';
import { AssignmentDashboardComponent } from './assignment-dashboard/assignment-dashboard.component';
import { DashboardSelectorComponent } from './dashboard-selector/dashboard-selector.component';
import { DashboardComponent } from './dashboard.component';
import { ProjectDashboardComponent } from './project-dashboard/project-dashboard.component';
import { ProjectOverviewComponent } from './project-dashboard/project-overview/project-overview.component';
import { StateBarChartComponent } from './project-dashboard/status-dashboard/state-bar-chart/state-bar-chart.component';
import { StatusDashboardComponent } from './project-dashboard/status-dashboard/status-dashboard.component';
import { UserStatisticsComponent } from './project-dashboard/user-statistics/user-statistics.component';
import { ReportDashboardComponent } from './report-dashboard/report-dashboard.component';

describe('Component: Dashboard', ()=>{
  let dashboardComponent: DashboardComponent;
  let dashboardFixture : ComponentFixture<DashboardComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [
        DashboardComponent,
        DashboardSelectorComponent,
        AssignmentDashboardComponent,
        ProjectDashboardComponent,
        ReportDashboardComponent,
        ActivityFeedComponent,
        ProjectOverviewComponent,
        UserStatisticsComponent,
        StatusDashboardComponent,
        StateBarChartComponent,
      ],
      imports: [
        CommonModule,
        FormsModule,
        BrowserAnimationsModule,
        TreeModule,
        MaterialModule,
        PipesModule,
        LensModule,
        ObjectEditorModule,
        ReportGeneratorModule,
        CategoryBoardModule
      ],
      providers: [
        {provide: NavigationService, useClass: MockNavigationService},
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: SessionService, useClass: MockSessionService},
        {provide: CurrentUserService, useClass: MockCurrentUserService}
      ]
    }).compileComponents();

    dashboardFixture = TestBed.createComponent(DashboardComponent);
    dashboardComponent = dashboardFixture.componentInstance;

    dashboardFixture.detectChanges();

  })

  it('instantiates the dashboard component', ()=>{
    expect(dashboardComponent).toBeTruthy();
  })
})
