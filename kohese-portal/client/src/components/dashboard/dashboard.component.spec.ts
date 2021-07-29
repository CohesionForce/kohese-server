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


// Angular
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TreeModule } from 'angular-tree-component';
import { MaterialModule } from '../../material.module';


// Kohese
import { PipesModule } from '../../pipes/pipes.module';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { CurrentUserService } from '../../services/user/current-user.service';
import { SessionService } from '../../services/user/session.service';
import { ItemBoardModule } from '../item-board/item-board.module';
import { LensModule } from '../lens/lens.module';
import { ObjectEditorModule } from '../object-editor/object-editor.module';
import { ActivityFeedComponent } from './activity-feed/activity-feed.component';
import { AssignmentDashboardComponent } from './assignment-dashboard/assignment-dashboard.component';
import { DashboardSelectorComponent } from './dashboard-selector/dashboard-selector.component';
import { DashboardComponent } from './dashboard.component';
import { ProjectDashboardComponent } from './project-dashboard/project-dashboard.component';
import { ProjectOverviewComponent } from './project-dashboard/project-overview/project-overview.component';
import { StateBarChartComponent } from './project-dashboard/status-dashboard/state-bar-chart/state-bar-chart.component';
import { StatusDashboardComponent } from './project-dashboard/status-dashboard/status-dashboard.component';
import { UserStatisticsComponent } from './project-dashboard/user-statistics/user-statistics.component';

// Mocks
import { MockCurrentUserService } from '../../../mocks/services/MockCurrentUserService';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { MockSessionService } from '../../../mocks/services/MockSessionService';

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
        ActivityFeedComponent,
        ProjectOverviewComponent,
        UserStatisticsComponent,
        StatusDashboardComponent,
        StateBarChartComponent,

      ],
      imports: [
        RouterModule.forRoot([]),
        CommonModule,
        FormsModule,
        BrowserAnimationsModule,
        TreeModule,
        MaterialModule,
        PipesModule,
        LensModule,
        ObjectEditorModule,
        ItemBoardModule
      ],
      providers: [
        {provide: NavigationService, useClass: MockNavigationService},
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: SessionService, useClass: MockSessionService},
        {provide: CurrentUserService, useClass: MockCurrentUserService},
        { provide: APP_BASE_HREF, useValue: '/'}
      ]
    }).compileComponents();

    dashboardFixture = TestBed.createComponent(DashboardComponent);
    dashboardComponent = dashboardFixture.componentInstance;

    dashboardFixture.detectChanges();

  })

  afterEach(() => {
    dashboardFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the dashboard component', ()=>{
    expect(dashboardComponent).toBeTruthy();
  })
})
