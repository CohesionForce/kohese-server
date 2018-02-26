import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../material.module'

import { SessionService } from '../../services/user/session.service';
import { AdminComponent } from './admin.component';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockSessionService } from '../../../mocks/services/MockSessionService';
import { PipesModule } from '../../pipes/pipes.module';

describe('Component: Admin', ()=>{
  let adminComponent: AdminComponent;
  let adminFixture : ComponentFixture<AdminComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [AdminComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         PipesModule,
         FormsModule,
         ReactiveFormsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: SessionService, useClass: MockSessionService}
      ]
    }).compileComponents();

    adminFixture = TestBed.createComponent(AdminComponent);
    adminComponent = adminFixture.componentInstance;

    adminFixture.detectChanges();
    
  })

  it('instantiates the admin component', ()=>{
    expect(adminComponent).toBeTruthy(); 
  })
})