import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { SideBarComponent } from './sidebar.component';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DialogService } from '../../../services/dialog/dialog.service';
import { CurrentUserService } from '../../../services/user/current-user.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockCurrentUserService } from '../../../../mocks/services/MockCurrentUserService';
import { LensService } from '../../../services/lens-service/lens.service';
import { MockLensService } from '../../../../mocks/services/MockLensService';

describe('Component: SideBar', ()=>{
  let sideBarComponent: SideBarComponent;
  let sideBarFixture : ComponentFixture<SideBarComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [SideBarComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: DialogService, useClass: MockDialogService},
        {provide: CurrentUserService, useClass: MockCurrentUserService},
        {provide: LensService, useClass: MockLensService}
      ]
    }).compileComponents();

    sideBarFixture = TestBed.createComponent(SideBarComponent);
    sideBarComponent = sideBarFixture.componentInstance;

    sideBarFixture.detectChanges();
    
  })

  it('instantiates the SideBar component', ()=>{
    expect(sideBarComponent).toBeTruthy(); 
  })
})