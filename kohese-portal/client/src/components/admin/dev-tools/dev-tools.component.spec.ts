import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../../../material.module';
import { LogService } from '../../../services/log/log.service';
import { MockLogService } from '../../../../mocks/services/MockLogService';
import { DevToolsComponent } from './dev-tools.component';

describe('DevToolsComponent', () => {
  let component: DevToolsComponent;
  let fixture: ComponentFixture<DevToolsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ DevToolsComponent ],
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MaterialModule
      ],
      providers: [ { provide: LogService, useClass: MockLogService } ]
    }).compileComponents();

    fixture = TestBed.createComponent(DevToolsComponent);
    component = fixture.componentInstance;
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
