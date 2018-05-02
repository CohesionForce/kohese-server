import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardModule } from '../../dashboard.module';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { MockDialogService } from '../../../../../mocks/services/MockDialogService';
import { MockNavigationService } from '../../../../../mocks/services/MockNavigationService';
import { UserStatisticsComponent } from './user-statistics.component';

describe('UserStatisticsComponent', () => {
  let component: UserStatisticsComponent;
  let fixture: ComponentFixture<UserStatisticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ DashboardModule ],
      providers: [
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: DialogService, useClass: MockDialogService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
