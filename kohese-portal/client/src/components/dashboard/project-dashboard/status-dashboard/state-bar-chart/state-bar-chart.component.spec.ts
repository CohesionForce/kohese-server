import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of as ObservableOf } from 'rxjs';

import { MaterialModule } from '../../../../../material.module';
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
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MaterialModule
      ],
      providers: [ { provide: DialogService, useClass: MockDialogService } ],
      schemas: [NO_ERRORS_SCHEMA]
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
