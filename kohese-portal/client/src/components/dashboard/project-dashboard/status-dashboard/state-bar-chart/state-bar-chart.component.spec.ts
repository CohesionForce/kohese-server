import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of as ObservableOf } from 'rxjs';

import { StateFilterService } from '../../../state-filter.service';
import { MockStateFilterService } from '../../../../../../mocks/services/MockStateFilterService';
import { DialogService } from '../../../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../../../mocks/services/MockDialogService';
import { TreeConfiguration } from '../../../../../../../common/src/tree-configuration';
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
