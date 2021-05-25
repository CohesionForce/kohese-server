import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MaterialModule } from '../../../material.module';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { StatefulProxyCardComponent } from './stateful-proxy-card.component';

describe('StatefulProxyCardComponent', () => {
  let component: StatefulProxyCardComponent;
  let fixture: ComponentFixture<StatefulProxyCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatefulProxyCardComponent ],
      imports: [ MaterialModule ],
      providers: [ { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository } ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatefulProxyCardComponent);
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
