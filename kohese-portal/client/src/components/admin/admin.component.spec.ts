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
import { MockUserData } from '../../../mocks/data/MockUser';
import * as ItemProxy from '../../../../common/models/item-proxy';

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

  describe('user actions', ()=>{
    it('should initialize the user Form', ()=>{
      adminComponent.addUser();
      expect(adminComponent.usernameInput).toBe('');
      expect(adminComponent.descriptionInput).toBe('');
      expect(adminComponent.emailInput).toBe('');
      expect(adminComponent.passwordInput).toBe('');
      expect(adminComponent.confirmPasswordInput).toBe('');
      expect(adminComponent.currentForm).toBe('Add User');
      expect(adminComponent.addUserForm).toBe(true);
    })

    it('should set the fields to the selected User values', ()=>{
      let mockProxy = new ItemProxy('KoheseUser', MockUserData())
      adminComponent.editUser(mockProxy);
      expect(adminComponent.usernameInput).toBe(mockProxy.item.name);
      expect(adminComponent.descriptionInput).toBe(mockProxy.item.description);
      expect(adminComponent.emailInput).toBe(mockProxy.item.email);
      expect(adminComponent.editUserForm).toBe(true);
      expect(adminComponent.currentForm).toBe('Edit User');
      expect(adminComponent.selectedUserProxy).toBe(mockProxy);
    })

    it('should clear the form when the user selects cancel',()=>{
      adminComponent.cancelForm();
      expect(adminComponent.addUserForm).toBe(false);
      expect(adminComponent.editUserForm).toBe(false);
      expect(adminComponent.selectedUserProxy).toBe(undefined);
      expect(adminComponent.usernameInput).toBe('');
      expect(adminComponent.descriptionInput).toBe('');
      expect(adminComponent.emailInput).toBe('');
      expect(adminComponent.passwordInput).toBe('');
      expect(adminComponent.confirmPasswordInput).toBe('');
    })

    it('should delete a user', ()=>{
      let mockProxy = new ItemProxy('KoheseUser', MockUserData());
      let deleteSpy = spyOn(TestBed.get(ItemRepository), 'deleteItem').and.returnValue(Promise.resolve()); 
      adminComponent.deleteUser(mockProxy);
      expect(deleteSpy).toHaveBeenCalled();
    })

    it('should reject an update when passwords do not match',()=>{
      adminComponent.passwordInput = '1';
      adminComponent.confirmPasswordInput = '2';
      let buildSpy = spyOn(TestBed.get(ItemRepository), 'buildItem');
      expect(buildSpy).not.toHaveBeenCalled();
    })
    describe('save item', ()=>{
      beforeEach(()=>{
        adminComponent.passwordInput = '1';
        adminComponent.confirmPasswordInput = '1';
        adminComponent.usernameInput = 'test user';
        adminComponent.descriptionInput = "test description";
        adminComponent.emailInput = "test@test.com"
      })
    })
    it('should send an update command user when an existing user is saved', ()=>{
      adminComponent.selectedUserProxy = new ItemProxy('KoheseUser', MockUserData());
      let upsertSpy = spyOn(TestBed.get(ItemRepository), 'upsertItem');
      adminComponent.updateUser();
      expect(upsertSpy).toHaveBeenCalled();
      expect(adminComponent.selectedUserProxy).not.toBeDefined()

    })
    it('should send a create command when a new user is saved',()=>{
      pending();
    })
  })
})