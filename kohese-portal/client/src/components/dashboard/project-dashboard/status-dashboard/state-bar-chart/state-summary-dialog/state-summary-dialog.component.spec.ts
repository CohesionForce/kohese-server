import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MAT_DIALOG_DATA } from '@angular/material';

import { ItemRepository } from '../../../../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../../../../mocks/services/MockItemRepository';
import { NavigationService } from '../../../../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../../../../mocks/services/MockNavigationService';
import { DialogService } from '../../../../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../../../../mocks/services/MockDialogService';
import { StateSummaryDialogComponent } from './state-summary-dialog.component';

describe('StateSummaryDialogComponent', () => {
  let component: StateSummaryDialogComponent;
  let fixture: ComponentFixture<StateSummaryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StateSummaryDialogComponent ],
      imports: [ NgxDatatableModule ],
      providers: [ {
          provide: MAT_DIALOG_DATA,
          useValue: {
            proxies: [],
            kindName: 'Item',
            stateName: 'Approved'
          }
        },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: DialogService, useClass: MockDialogService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StateSummaryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
