import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { SessionService } from '../../services/user/session.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { FormatDefinitionType } from '../type-editor/FormatDefinition.interface';
import { FormatObjectEditorComponent } from '../object-editor/format-object-editor/format-object-editor.component';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent implements OnInit, OnDestroy {
  private _treeConfiguration: TreeConfiguration;
  get treeConfiguration() {
    return this._treeConfiguration;
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

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _sessionService: SessionService, private _itemRepository:
    ItemRepository, private _dialogService: DialogService) {
  }

  public ngOnInit(): void {
    this._treeConfigurationSubscription = this._itemRepository.getTreeConfig().
      subscribe(async (treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        this._treeConfiguration = treeConfigurationObject.config;
        this._koheseUserDataModel = this._treeConfiguration.getProxyFor(
          'KoheseUser').item;
        this._koheseUserViewModel = this._treeConfiguration.getProxyFor(
          'view-koheseuser').item;
        this._sessionMap = await this._itemRepository.getSessionMap();
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  public ngOnDestroy(): void {
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
          parentId: this._treeConfiguration.getRootProxy().getChildByName(
            'Users').item.id
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
    this._itemRepository.upsertItem(this._treeConfiguration.getProxyFor(user.
      id).kind, user).then((returnedItemProxy: ItemProxy) => {
      this._changeDetectorRef.markForCheck();
    });
    this._editableSet.splice(this._editableSet.indexOf(user.id), 1);
  }
  
  public discardChanges(user: any): void {
    this._itemRepository.fetchItem(this._treeConfiguration.getProxyFor(user.
      id));
    this._editableSet.splice(this._editableSet.indexOf(user.id), 1);
    this._changeDetectorRef.markForCheck();
  }
  
  public remove(user: any): void {
    this._dialogService.openYesNoDialog('Remove ' + user.name, 'Are you ' +
      'sure that you want to remove ' + user.name + ' from the system?').
      subscribe((response: any) => {
      if (response) {
        this._itemRepository.deleteItem(this._treeConfiguration.getProxyFor(user.
          id), false).then(() => {
          this._sessionService.users.splice(this._sessionService.users.indexOf(
            user), 1);
          this._changeDetectorRef.markForCheck();
        });
      }
    });
  }
}
