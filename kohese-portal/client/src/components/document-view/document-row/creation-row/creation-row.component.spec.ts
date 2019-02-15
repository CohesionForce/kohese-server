import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../../../../material.module';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';
import { CreationRowComponent } from './creation-row.component';

describe('CreationRowComponent', () => {
  let component: CreationRowComponent;
  let fixture: ComponentFixture<CreationRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreationRowComponent ],
      imports: [
        FormsModule,
        MaterialModule
      ],
      providers: [ { provide: ItemRepository, useClass: MockItemRepository } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
