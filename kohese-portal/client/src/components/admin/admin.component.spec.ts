import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../material.module'

import { SessionService } from '../../services/user/session.service';
import { AdminComponent } from './admin.component';
import { MockItem } from '../../../mocks/data/MockItem';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockSessionService } from '../../../mocks/services/MockSessionService';
import { DialogService } from '../../services/dialog/dialog.service';
import { MockDialogService } from '../../../mocks/services/MockDialogService';
import { PipesModule } from '../../pipes/pipes.module';
import { MockUserData } from '../../../mocks/data/MockUser';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { LensModule } from '../lens/lens.module';

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
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: SessionService, useClass: MockSessionService},
        { provide: DialogService, useClass: MockDialogService }
      ]
    }).compileComponents();

    adminFixture = TestBed.createComponent(AdminComponent);
    adminComponent = adminFixture.componentInstance;

    let koheseUserDataModel: any = MockItem();
    koheseUserDataModel.id = 'KoheseUser';
    new ItemProxy('Item', koheseUserDataModel);

    let koheseUserViewModel: any = MockItem();
    koheseUserViewModel.id = 'view-koheseuser';
    new ItemProxy('Item', koheseUserViewModel);

    adminFixture.detectChanges();
  });

  //it('instantiates the admin component', ()=>{
  //  expect(adminComponent).toBeTruthy();
  //});
});
