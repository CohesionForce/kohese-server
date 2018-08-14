import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { DocumentRowComponent } from './document-row.component';

describe('Component: DocumentRowComponent', () => {
  let component: DocumentRowComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentRowComponent ],
      providers: [ { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService } ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();
    
    let fixture: ComponentFixture<DocumentRowComponent> = TestBed.
      createComponent(DocumentRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
