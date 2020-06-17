import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { SessionService } from '../../services/user/session.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { LensService,
  ApplicationLens } from '../../services/lens-service/lens.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { FormatDefinitionType } from '../../../../common/src/FormatDefinition.interface';
import { FormatObjectEditorComponent } from '../object-editor/format-object-editor/format-object-editor.component';
import { ItemProxy } from '../../../../common/src/item-proxy';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent implements OnInit, OnDestroy {
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

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _sessionService: SessionService, private _itemRepository:
    ItemRepository, private _lensService: LensService, private _dialogService:
    DialogService) {
  }

  public ngOnInit(): void {
    this._treeConfigurationSubscription = this._itemRepository.getTreeConfig().
      subscribe(async (treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        this._koheseUserDataModel = treeConfigurationObject.config.getProxyFor(
          'KoheseUser').item;
        this._koheseUserViewModel = treeConfigurationObject.config.getProxyFor(
          'view-koheseuser').item;
        this._sessionMap = await this._itemRepository.getSessionMap();
        this._changeDetectorRef.markForCheck();
      }
    });
    
    this._lensSubscription = this._lensService.getLensSubject().subscribe(
      (lens: ApplicationLens) => {
      this._lens = lens;
      this._changeDetectorRef.markForCheck();
    });
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
}
