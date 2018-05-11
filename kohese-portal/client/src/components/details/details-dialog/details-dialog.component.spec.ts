import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { DetailsDialogComponent } from './details-dialog.component';

describe('DetailsDialogComponent', () => {
  let component: DetailsDialogComponent;
  let fixture: ComponentFixture<DetailsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailsDialogComponent ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { itemProxy: TreeConfiguration.
          getWorkingTree().getRootProxy() } },
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: MatDialogRef, useValue: { close: () => {} } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(DetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
