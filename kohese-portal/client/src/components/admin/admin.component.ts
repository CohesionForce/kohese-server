import { Component, OnInit } from '@angular/core'

import * as ItemProxy from '../../../../common/models/item-proxy';
import { SessionService } from '../../services/user/session.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  private usernameInput: string;
  private descriptionInput: string;
  private emailInput: string;
  private passwordInput: string;
  private confirmPasswordInput: string;
  private addUserForm: boolean = false;
  private editUserForm: boolean = false;
  private currentForm: string;
  private selectedUserProxy: ItemProxy;

  constructor(private sessionService: SessionService, private itemRepository: ItemRepository) {
  }

  ngOnInit() {
  }

  addUser() {
    this.usernameInput = '';
    this.descriptionInput = '';
    this.emailInput = '';
    this.passwordInput = '';
    this.confirmPasswordInput = '';
    this.currentForm = 'Add User';
    this.addUserForm = true;
  }

  editUser(userProxy: ItemProxy) {
    this.usernameInput = userProxy.item.name;
    this.descriptionInput = userProxy.item.description;
    this.emailInput = userProxy.item.email;
    this.editUserForm = true;
    this.currentForm = 'Edit User';
    this.selectedUserProxy = userProxy;
  }

  cancelForm() {
    this.addUserForm = false;
    this.editUserForm = false;
    this.selectedUserProxy = undefined;
    this.usernameInput = '';
    this.descriptionInput = '';
    this.emailInput = '';
    this.passwordInput = '';
    this.confirmPasswordInput = '';
  }

  updateUser() {
    if (this.passwordInput === this.confirmPasswordInput) {
      if (this.selectedUserProxy) {
        this.selectedUserProxy.item.name = this.usernameInput;
        this.selectedUserProxy.item.description = this.descriptionInput;
        this.selectedUserProxy.item.email = this.emailInput;
        if (this.passwordInput !== '') {
          this.selectedUserProxy.item.password = this.passwordInput;
        }
        
        this.itemRepository.upsertItem(this.selectedUserProxy);
      } else {
        // TODO
        let item: any = {
          parentId: this.sessionService.getSessionUser().getValue().item.parentId,
          name: this.usernameInput,
          description: this.descriptionInput,
          email: this.emailInput,
        };
        if (this.passwordInput !== '') {
          item.password = this.passwordInput;
        }
        
        this.itemRepository.createItem('KoheseUser', item);
      }

      this.cancelForm();
    } else {
      alert('Confirmation password does not match password.');
    }
  }

  deleteUser(userProxy) {
    this.itemRepository.deleteItem(userProxy, false);
  }
}
