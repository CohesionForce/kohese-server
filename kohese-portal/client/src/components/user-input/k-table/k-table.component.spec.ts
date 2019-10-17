import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { KTableComponent } from './k-table.component';

describe('Component: k-table', () => {
  let component: KTableComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KTableComponent],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    
    let fixture: ComponentFixture<KTableComponent> = TestBed.createComponent(
      KTableComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });
});