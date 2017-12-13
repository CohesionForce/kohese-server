import { Component } from '@angular/core'
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';

import { ItemProxy } from '../../../../common/models/item-proxy';
import { UserService } from '../../services/user/user.service';

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
  private remoteNameInput: string;
  private remoteUrlInput: string;
  private remotes: any[] = [];
  private commitMessageInput: string;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
  }
  
  navigate(state) {
  }
  
  addUser() {
    this.usernameInput = '';
    this.descriptionInput = '';
    this.emailInput = '';
    this.passwordInput = '';
    this.confirmPasswordInput = '';
    this.currentForm = 'Add User';
    this.addUserForm = true;
    this.selectedUserProxy = new ItemProxy('KoheseUser', {
      parentId: this.userService.getUsersItemId()
    });
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
      this.selectedUserProxy.item.name = this.usernameInput;
      this.selectedUserProxy.item.description = this.descriptionInput;
      this.selectedUserProxy.item.email = this.emailInput;
      if (this.passwordInput !== '') {
        this.selectedUserProxy.item.password = this.passwordInput;
      }
      
      // TODO Update the user on the server
      this.cancelForm();
    } else {
      alert('Confirmation password does not match password.');
    }
  }
  
  deleteUser(userProxy) {
    // TODO Delete user on the server
  }
  
  addRemote() {
    if ((this.remoteNameInput !== '') && (this.remoteUrlInput !== '')) {
      // TODO Add remote through VersionControlService
    } else {
      alert('Please specify both a remote name and URL.');
    }
  }
  
  getRemotes(): any[] {
    // TODO Get remotes from VersionControlService
    return [];
  }
  
  commit() {
    if (this.commitMessageInput === '') {
      this.commitMessageInput = '<No message supplied>';
    }
    
    // TODO Commit through VersionControlService
  }
  
  push() {
    // TODO Push through VersionControlService
  }
}
