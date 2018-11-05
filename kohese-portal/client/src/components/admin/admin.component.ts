import { Component, OnInit, OnDestroy } from '@angular/core'

import { ItemProxy } from '../../../../common/src/item-proxy';
import { SessionService } from '../../services/user/session.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit, OnDestroy {
  usernameInput: string;
  descriptionInput: string;
  emailInput: string;
  passwordInput: string;
  confirmPasswordInput: string;
  addUserForm: boolean = false;
  editUserForm: boolean = false;
  currentForm: string;
  selectedUserProxy: ItemProxy;
  sessions : any;
  users : Array<any>

  treeConfigSub : Subscription;

  constructor(private sessionService: SessionService, private itemRepository: ItemRepository) {
  }

  ngOnInit() {
    this.treeConfigSub =
      this.itemRepository.getTreeConfig().subscribe(async (newConfig)=>{
        if (newConfig) {
        this.sessions = await this.itemRepository.getSessionMap();
        this.users = this.sessionService.getUsers();
        }
    })
  }

  ngOnDestroy () {
    this.treeConfigSub.unsubscribe();
  }

  // TODO - Update to use forms module instead of this insanity

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
        let item: any = {
          parentId: this.sessionService.getSessionUser().getValue().item.parentId,
          name: this.usernameInput,
          description: this.descriptionInput,
          email: this.emailInput,
        };
        if (this.passwordInput !== '') {
          item.password = this.passwordInput;
        }

        this.itemRepository.buildItem('KoheseUser', item)
          .then(()=>{
            this.users = this.sessionService.getUsers();
          });
      }

      this.cancelForm();
    } else {
      alert('Confirmation password does not match password.');
    }
  }

  deleteUser(userProxy) {
    this.itemRepository.deleteItem(userProxy, false)
      .then(()=>{
        this.users = this.sessionService.getUsers();
      });
  }
}
