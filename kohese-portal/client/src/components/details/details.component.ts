import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  OnDestroy, Input, ViewChildren, QueryList, Optional,
  Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Subscription,  BehaviorSubject } from 'rxjs';

import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { FormatObjectEditorComponent } from '../object-editor/format-object-editor/format-object-editor.component';
import { FormatDefinitionType } from '../type-editor/FormatDefinition.interface';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';

/* This component serves as a manager for viewing proxy details in the explore view.
   It functions by retrieving an id from the route parameters and then retrieving
   the proxy from the current tree configuration object
*/
@Component({
  selector: 'details-view',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent implements OnInit, OnDestroy {
  private _itemProxy: ItemProxy;
  get itemProxy() {
    return this._itemProxy;
  }
  @Input('itemProxy')
  set itemProxy(itemProxy: ItemProxy) {
    this._itemProxy = itemProxy;
    this._itemRepository.getHistoryFor(this.itemProxy);
    this.proxyStream.next(this._itemProxy);
  }
  
  treeConfig: TreeConfiguration;

  /* Observables */
  proxyStream: BehaviorSubject<ItemProxy> = new BehaviorSubject<ItemProxy>(
    undefined);
  editableStream: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false);

  /* Subscriptions */
  treeConfigSub: Subscription;
  
  get matDialogRef() {
    return this._matDialogRef;
  }
  
  get FormatDefinitionType() {
    return FormatDefinitionType;
  }
  
  @ViewChildren(FormatObjectEditorComponent)
  private _formatObjectEditorQueryList: QueryList<FormatObjectEditorComponent>;

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<DetailsComponent>,
    private _itemRepository: ItemRepository, private _navigationService:
    NavigationService, private _dialogService: DialogService) {
  }

  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this.treeConfig = TreeConfiguration.getWorkingTree();
      this.itemProxy = this._data['itemProxy'];
    } else {
      this.treeConfigSub = this._itemRepository.getTreeConfig().subscribe(
        (treeConfigurationObject: any) => {
        this.treeConfig = treeConfigurationObject.config;
        this.editableStream.next(false);
        if (this._itemProxy) {
          this.itemProxy = this.treeConfig.getProxyFor(this._itemProxy.item.
            id);
          if (this._itemProxy) {
            this._itemRepository.registerRecentProxy(this._itemProxy);
          }
        }
        
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  public ngOnDestroy(): void {
    if (!this.isDialogInstance()) {
      this.treeConfigSub.unsubscribe();
    }
  }
  
  public isDialogInstance(): boolean {
    return (this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data);
  }
  
  public upsertItem(): void {
    try {
      let kind: string;
      let formatObjectEditorArray: Array<FormatObjectEditorComponent> = this.
        _formatObjectEditorQueryList.toArray();
      if (formatObjectEditorArray.length > 0) {
        kind = formatObjectEditorArray[0].selectedType.name;
      } else {
        kind = this._itemProxy.kind;
      }
      
      ItemProxy.validateItemContent(kind, this._itemProxy.item,
        TreeConfiguration.getWorkingTree());
      this._itemRepository.upsertItem(kind, this._itemProxy.item).then(
        (updatedItemProxy: ItemProxy) => {
        this.editableStream.next(false);
        this._changeDetectorRef.markForCheck();
      });
    } catch (error) {
      this._dialogService.openInformationDialog('Invalid Item', 'The ' +
        'following attributes are insufficiently populated: ' + error.
        validation.missingProperties.join(', ') + '.');
    }
  }

  public cancelEditing(): void {
    this._itemRepository.fetchItem(this._itemProxy).then((proxy:
      ItemProxy) => {
      this.editableStream.next(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  
  public navigate(id: string, openNewTab: boolean): void {
    if (openNewTab) {
      this._navigationService.addTab('Explore', { id: id });
    } else {
      this._navigationService.navigate('Explore', { id: id });
    }
  }
}
