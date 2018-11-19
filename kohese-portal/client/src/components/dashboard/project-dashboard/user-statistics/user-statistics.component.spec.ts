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
      proxy: TreeConfiguration.getWorkingTree().getProxyFor('Kurios Iesous'),
      users: [],
      projectItems: []
    });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
