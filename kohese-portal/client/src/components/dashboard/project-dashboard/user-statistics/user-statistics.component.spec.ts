/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of as ObservableOf } from 'rxjs';

import { DashboardModule } from '../../dashboard.module';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { StateFilterService } from '../../state-filter.service';
import { MockDialogService } from '../../../../../mocks/services/MockDialogService';
import { MockNavigationService } from '../../../../../mocks/services/MockNavigationService';
import { MockStateFilterService } from '../../../../../mocks/services/MockStateFilterService';
import { TreeConfiguration } from '../../../../../../common/src/tree-configuration';
import { UserStatisticsComponent } from './user-statistics.component';

describe('UserStatisticsComponent', () => {
  let component: UserStatisticsComponent;
  let fixture: ComponentFixture<UserStatisticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ DashboardModule ],
      providers: [
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: DialogService, useClass: MockDialogService },
        { provide: StateFilterService, useClass: MockStateFilterService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserStatisticsComponent);
    component = fixture.componentInstance;
    component.projectStream = ObservableOf({
      proxy: TreeConfiguration.getWorkingTree().getProxyFor('test-uuid1'),
      users: [],
      projectItems: []
    });

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
