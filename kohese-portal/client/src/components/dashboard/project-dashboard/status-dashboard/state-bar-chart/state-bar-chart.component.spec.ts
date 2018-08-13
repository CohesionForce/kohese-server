import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StateFilterService } from '../../../state-filter.service';
import { MockStateFilterService } from '../../../../../../mocks/services/MockStateFilterService';
import { DialogService } from '../../../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../../../mocks/services/MockDialogService';
import { StateBarChartComponent } from './state-bar-chart.component';

describe('StateBarChartComponent', () => {
  let component: StateBarChartComponent;
  let fixture: ComponentFixture<StateBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StateBarChartComponent ],
      providers: [ {
        provide: StateFilterService,
        useClass: MockStateFilterService
        }, { provide: DialogService, useClass: MockDialogService } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StateBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
