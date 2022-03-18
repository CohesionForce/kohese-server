/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy,
         ViewChildren, QueryList } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

// Other External Dependencies

// Kohese
import { SessionService } from '../../services/user/session.service';
import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { FormatDefinitionType } from '../../../../common/src/FormatDefinition.interface';
import { FormatObjectEditorComponent } from '../object-editor/format-object-editor/format-object-editor.component';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DetailsComponent } from '../details/details.component';
import { CacheManager } from '../../../../client/cache-worker/CacheManager';
import { Hotkeys } from '../../services/hotkeys/hot-key.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent implements OnInit, OnDestroy {
  // Data
  private lockoutList: Array<string> = [];
  initialized: boolean = false;

  // Getters

  private _focusedItemProxy: ItemProxy;
  get focusedItemProxy(): ItemProxy {
    return this._focusedItemProxy;
  }
  set focusedItemProxy(item: ItemProxy) {
    this._focusedItemProxy = item;
  }

  private _koheseUserDataModel: any;
  get koheseUserDataModel() {
    return this._koheseUserDataModel;
  }

  private _koheseUserViewModel: any;
  get koheseUserViewModel() {
    return this._koheseUserViewModel;
  }

  private _users: any;
  get users() {
    return this._users;
  }
  set users(sortedUserProxiesArray: any) {
    this._users = sortedUserProxiesArray;
  }

  private _sessionMap: any;
  get sessionMap() {
    return this._sessionMap;
  }
  set sessionMap(value: any) {
    this._sessionMap = value;
  }

  repositoryStatusSubscription: Subscription;
  sessionMapChangeSub: Subscription;
  usersChangeSub: Subscription;
  private _saveShortcutSubscription: Subscription;
  private _exitShortcutSubscription: Subscription;

  private _editableSet: Array<string> = [];
  get editableSet() {
    return this._editableSet;
  }

  get sessionService() {
    return this._sessionService;
  }

  get FormatDefinitionType() {
    return FormatDefinitionType;
  }

  get Object() {
    return Object;
  }

  get navigationService() {
    return this._navigationService;
  }

  @ViewChildren(MatExpansionPanel)
  private expansionPanels: QueryList<MatExpansionPanel>;

  public constructor(
    private cacheManager : CacheManager,
    private _changeDetectorRef: ChangeDetectorRef,
    private _sessionService: SessionService,
    private _itemRepository:ItemRepository,
    private _dialogService: DialogService,
    private _navigationService: NavigationService,
    private hotkeys : Hotkeys,
    private title : Title
    ) {
      this.title.setTitle('Users');

      // The if statements prevent erroneous firing of shortcuts while not focused on this component
      this._saveShortcutSubscription = this.hotkeys.addShortcut({ keys: 'control.s', description: 'save and continue' }).subscribe(command => {
        if(this.focusedItemProxy) {
          this.saveAndContinueEditing(this.focusedItemProxy);
        }
      });

      this._exitShortcutSubscription = this.hotkeys.addShortcut({ keys: 'escape', description: 'discard changes and exit edit mode' }).subscribe(command => {
        if(this.focusedItemProxy) {
          this.discardChanges(this.focusedItemProxy);
        }
      });
    }

  public ngOnInit(): void {

    this.repositoryStatusSubscription = this._itemRepository.getRepoStatusSubject().subscribe(async (status: any) => {
      if (RepoStates.SYNCHRONIZATION_SUCCEEDED === status.state) {
        this.initialized = true;
        let modelProxy : KoheseModel = TreeConfiguration.getWorkingTree().getModelProxyFor('KoheseUser');
        this._koheseUserDataModel = modelProxy.item;
        this._koheseUserViewModel = modelProxy.view.item;
        this.sessionMap = this.sessionService.sessionMap;
        this.users = this.sessionService.userProxies;
        this.sessionMapChangeSub = this.sessionService.sessionChangeSubject.subscribe((sessionData) => {
          this.sessionMap = sessionData;
        });
        console.log(this.sessionMap);
        this.usersChangeSub = this.sessionService.usersChangeSubject.subscribe((userProxies) => {
          this.users = userProxies;
        });
        console.log(this.users);
        this._changeDetectorRef.markForCheck();
      }
    });

    // Loads user lockout list for lock/reinstate panel buttons
    this.getUserLockoutList();
  }

  public ngOnDestroy(): void {
    this.sessionMapChangeSub.unsubscribe();
    this.usersChangeSub.unsubscribe();
    this._saveShortcutSubscription.unsubscribe();
    this._exitShortcutSubscription.unsubscribe();
  }

  public async add(): Promise<void> {
    let username: string = this._sessionService.user.name;
    let timestamp: number = Date.now();
    this._dialogService.openComponentDialog(FormatObjectEditorComponent, {
      data: {
        type: this._koheseUserDataModel,
        object: {
          createdOn: timestamp,
          createdBy: username,
          modifiedOn: timestamp,
          modifiedBy: username,
          parentId: this._itemRepository.getTreeConfig().getValue().config.
            getRootProxy().getChildByName('Users').item.id
        },
        formatDefinitionType: FormatDefinitionType.DEFAULT,
        allowKindChange: true
      }
    }).updateSize('90%', '90%').afterClosed().subscribe(async (result:
      any) => {
      if (result) {
        await this._itemRepository.upsertItem(result.type.name, result.object);
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  public displayInformation(user: ItemProxy): void {

    this._dialogService.openComponentDialog(DetailsComponent, {
      data: {
        itemProxy: user
      }
    }).updateSize('90%', '90%');
  }

  public save(user: ItemProxy): void {
    this._itemRepository.upsertItem(user.kind, user.item).then((returnedItemProxy: ItemProxy) => {
      this._changeDetectorRef.markForCheck();
    });
    this._editableSet.splice(this._editableSet.indexOf(user.item.id), 1);
  }

  public saveAndContinueEditing(user: ItemProxy): void {
    this._itemRepository.upsertItem(user.kind, user.item).then((returnedItemProxy: ItemProxy) => {
        this._changeDetectorRef.markForCheck();
    });
  }

  public async discardChanges(user: ItemProxy): Promise<void> {
    if(user.dirty) {
      let response = await this._dialogService.openYesNoDialog('Discard Changes?', '');
      if(response === false) {
        return;
      }
      if(response === true) {
        await this._itemRepository.fetchItem(user);
        this._editableSet.splice(this._editableSet.indexOf(user.item.id), 1);
        this._changeDetectorRef.markForCheck();
      }
    } else {
      this._editableSet.splice(this._editableSet.indexOf(user.item.id), 1);
    }
  }

  public async remove(user: ItemProxy): Promise<void> {
    let response: any = await this._dialogService.openYesNoDialog('Remove ' +
      user.item.name, 'Are you sure that you want to remove ' + user.item.name +
      ' from the system?');
    if (response) {
      await this._itemRepository.deleteItem(user, false);
      this._changeDetectorRef.markForCheck();
    }
  }

  //////////////////////////////////////////////////////////
  // Provides the option to lock a current user
  //////////////////////////////////////////////////////////
  private async lockUser(user: ItemProxy) {
    let lock: any = await this._dialogService.openYesNoDialog('Lock ' +
      user.item.name, 'Lock ' + user.item.name + ' out of Kohese?');
    if (lock) {
      let response = await this.cacheManager.sendMessageToWorker('Admin/lockoutUser', {username: user.item.username}, true);
      console.log('::: ' + response.username + 'has been locked out.');
      this.getUserLockoutList();
      this._changeDetectorRef.markForCheck();
    }
  }
  //////////////////////////////////////////////////////////
  // Provides the option to reinstate a locked user
  //////////////////////////////////////////////////////////
  private async reinstateUser(user: ItemProxy) {
    let reinstate: any = await this._dialogService.openYesNoDialog('Reinstate ' + user.item.name + '?\n',
      'Reinstate ' + user.item.name + '?');
    if (reinstate) {
      let response = await this.cacheManager.sendMessageToWorker('Admin/reinstateUser', {username: user.item.username}, true);
      console.log('::: ' + response.username + 'has been reinstated.');
      this.getUserLockoutList();
      this._changeDetectorRef.markForCheck();
    }
  }

  //////////////////////////////////////////////////////////
  // Retrieve the locked users without initially
  // displaying a dialog.
  //////////////////////////////////////////////////////////
  private async getUserLockoutList() {
    let response = await this.cacheManager.sendMessageToWorker('Admin/getUserLockoutList', {}, true);
    this.lockoutList = response.userLockoutList;
  }

  //////////////////////////////////////////////////////////
  // Displays users currently locked out of the system
  //////////////////////////////////////////////////////////
  private async displayUserLockoutList() {
    await this.getUserLockoutList();
    // TODO: Find a way to display as a list, and not just comma separated.
    let listedUsers: string = this.lockoutList.join(', ');
    this._dialogService.openInformationDialog('Users Locked:', listedUsers);
    console.log('::: User lockout list retrieved');
    this._changeDetectorRef.markForCheck();
  }

  isModified(user: ItemProxy): boolean {
    return user.dirty;
  }

  public expandAll(): void {
    let expansionPanels: Array<MatExpansionPanel> = this.expansionPanels.toArray();
    for (let j: number = 0; j < expansionPanels.length; j++) {
      expansionPanels[j].open();
    }
  }

  public collapseAll(): void {
    let expansionPanels: Array<MatExpansionPanel> = this.expansionPanels.toArray();
    for (let j: number = 0; j < expansionPanels.length; j++) {
      expansionPanels[j].close();
    }
  }

}
