// Angular
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy,
         ViewChild, ViewChildren, QueryList } from '@angular/core';
import { MatExpansionPanel } from '@angular/material';
import { Title } from '@angular/platform-browser';

// NPM
import { Subscription } from 'rxjs';

// Custom
import { SessionService } from '../../services/user/session.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { LensService, ApplicationLens } from '../../services/lens-service/lens.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { FormatDefinitionType } from '../../../../common/src/FormatDefinition.interface';
import { FormatObjectEditorComponent } from '../object-editor/format-object-editor/format-object-editor.component';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DetailsComponent } from '../details/details.component';
import { CacheManager } from '../../../../client/cache-worker/CacheManager';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent implements OnInit, OnDestroy {
  // Data
  private lockoutList: Array<string> = [];

  // Getters
  private _lens: ApplicationLens;
  get lens() {
    return this._lens;
  }

  private _koheseUserDataModel: any;
  get koheseUserDataModel() {
    return this._koheseUserDataModel;
  }

  private _koheseUserViewModel: any;
  get koheseUserViewModel() {
    return this._koheseUserViewModel;
  }

  private _sessionMap: any;
  get sessionMap() {
    return this._sessionMap;
  }

  private _treeConfigurationSubscription: Subscription;
  private _lensSubscription: Subscription;

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

  get ApplicationLens() {
    return ApplicationLens;
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
    private _lensService: LensService,
    private _dialogService: DialogService,
    private _navigationService: NavigationService,
    private title : Title
    ) {
      this.title.setTitle("Users");
    }

  public ngOnInit(): void {
    this._treeConfigurationSubscription = this._itemRepository.getTreeConfig().
      subscribe(async (treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        let modelProxy : KoheseModel = TreeConfiguration.getWorkingTree().getModelProxyFor('KoheseUser');
        this._koheseUserDataModel = modelProxy.item;
        this._koheseUserViewModel = modelProxy.view.item;
        this._sessionMap = await this._itemRepository.getSessionMap();
        this._changeDetectorRef.markForCheck();
      }
    });

    this._lensSubscription = this._lensService.getLensSubject().subscribe(
      (lens: ApplicationLens) => {
      this._lens = lens;
      this._changeDetectorRef.markForCheck();
    });

    // Loads user lockout list for lock/reinstate panel buttons
    this.getUserLockoutList();
  }

  public ngOnDestroy(): void {
    this._lensSubscription.unsubscribe();
    this._treeConfigurationSubscription.unsubscribe();
  }

  public add(): void {
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
        let itemProxy: ItemProxy = await this._itemRepository.upsertItem(
          result.type.name, result.object);
        this._sessionService.users.push(itemProxy.item);
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  public displayInformation(user: any): void {
    let userIdProxy: ItemProxy = this._itemRepository.getTreeConfig().
    getValue().config.getProxyFor(user.id);

    this._dialogService.openComponentDialog(DetailsComponent, {
      data: {
        itemProxy: userIdProxy
      }
    }).updateSize('90%', '90%');
  }

  public save(user: any): void {
    this._itemRepository.upsertItem(this._itemRepository.getTreeConfig().
      getValue().config.getProxyFor(user.id).kind, user).then(
      (returnedItemProxy: ItemProxy) => {
      this._changeDetectorRef.markForCheck();
    });
    this._editableSet.splice(this._editableSet.indexOf(user.id), 1);
  }

  public discardChanges(user: any): void {
    this._itemRepository.fetchItem(this._itemRepository.getTreeConfig().
      getValue().config.getProxyFor(user.id));
    this._editableSet.splice(this._editableSet.indexOf(user.id), 1);
    this._changeDetectorRef.markForCheck();
  }

  public async remove(user: any): Promise<void> {
    let response: any = await this._dialogService.openYesNoDialog('Remove ' +
      user.name, 'Are you sure that you want to remove ' + user.name +
      ' from the system?');
    if (response) {
      this._itemRepository.deleteItem(this._itemRepository.getTreeConfig().
        getValue().config.getProxyFor(user.id), false).then(() => {
        this._sessionService.users.splice(this._sessionService.users.indexOf(
          user), 1);
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  //////////////////////////////////////////////////////////
  // Provides the option to lock a current user
  //////////////////////////////////////////////////////////
  private async lockUser(user: any) {
    let lock: any = await this._dialogService.openYesNoDialog('Lock ' +
      user.name, 'Lock ' + user.name + ' out of Kohese?');
    if (lock) {
      let response = await this.cacheManager.sendMessageToWorker('Admin/lockoutUser', {username: user.username}, true);
      console.log('::: ' + response.username + 'has been locked out.');
      this.getUserLockoutList();
      this._changeDetectorRef.markForCheck();
    }
  }
  //////////////////////////////////////////////////////////
  // Provides the option to reinstate a locked user
  //////////////////////////////////////////////////////////
  private async reinstateUser(user: any) {
    let reinstate: any = await this._dialogService.openYesNoDialog('Reinstate ' + user.name + '?\n',
      'Reinstate ' + user.name + '?');
    if (reinstate) {
      let response = await this.cacheManager.sendMessageToWorker('Admin/reinstateUser', {username: user.username}, true);
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

  isModified(user: any): boolean {
    return this._itemRepository.getTreeConfig().getValue().config.getProxyFor(user.id).dirty;
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
