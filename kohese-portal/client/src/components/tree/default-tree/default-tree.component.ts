import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChild, OnInit, OnDestroy,
  Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row.class';
import { RowAction, MenuAction } from '../tree-row.component';

@Component({
  selector: 'default-tree',
  templateUrl: './default-tree.component.html',
  styleUrls: ['../tree.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultTreeComponent extends Tree implements OnInit, OnDestroy {
  private _absoluteRoot: ItemProxy;
  get absoluteRoot() {
    return this._absoluteRoot;
  }
  
  private _synchronizeWithSelection: boolean = true;
  get synchronizeWithSelection() {
    return this._synchronizeWithSelection;
  }
  
  private _itemRepositorySubscription: Subscription;
  private _treeConfigurationSubscription: Subscription;
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    route: ActivatedRoute, private _itemRepository: ItemRepository,
    dialogService: DialogService) {
    super(route, dialogService);
  }
  
  public ngOnInit(): void {
    this.rootRowActions.push(new RowAction('Set Parent As Root',
      'Set this row\'s parent as the root', 'fa fa-level-up', (row:
      TreeRow) => {
      return (this._rootSubject.getValue() && (this._rootSubject.getValue() !==
        this._absoluteRoot));
      }, (row: TreeRow) => {
      this._rootSubject.next(row.itemProxy.parentProxy);
    }));
    
    let deleteMenuAction: MenuAction = new MenuAction('Delete',
      'Deletes this Item', 'fa fa-times delete-button', (row: TreeRow) => {
      return !row.itemProxy.internal;
      }, (row: TreeRow) => {
      this._dialogService.openCustomTextDialog('Confirm Deletion',
        'Are you sure you want to delete ' + row.itemProxy.item.name + '?', [
        'Cancel', 'Delete', 'Delete Recursively']).subscribe((result: any) => {
        if (result) {
          if (row.itemProxy === this._rootSubject.getValue()) {
            this._rootSubject.next(row.getRowParentProxy());
          }
          
          this._itemRepository.deleteItem(row.itemProxy, (2 === result));
        }
      });
    });
    this.rootMenuActions.push(deleteMenuAction);
    this.menuActions.push(deleteMenuAction);
    
    this._itemRepositorySubscription = this._itemRepository.getTreeConfig()
      .subscribe((treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        this._absoluteRoot = treeConfigurationObject.config.getRootProxy();
        this._absoluteRoot.visitTree({ includeOrigin: true }, (proxy:
          ItemProxy) => {
          this.buildRow(proxy);
        });
        
        let lostAndFoundProxy: ItemProxy = treeConfigurationObject.config.
          getLostAndFoundProxy();
        if (!this.getRow(lostAndFoundProxy.item.id)) {
          this.buildRow(lostAndFoundProxy);
        }
        
        if (this._treeConfigurationSubscription) {
          this._treeConfigurationSubscription.unsubscribe();
        }
        this._treeConfigurationSubscription = treeConfigurationObject.config.
          getChangeSubject().subscribe((notification: any) => {
          switch (notification.type) {
            case 'create': {
                this.insertRow(notification.proxy);
                this.refresh();
              }
              break;
            case 'delete': {
                this.deleteRow(notification.id);
                this.refresh();
              }
              break;
            case 'loaded': {
                this._absoluteRoot.visitTree({ includeOrigin: true }, (proxy:
                  ItemProxy) => {
                  this.buildRow(proxy);
                });
                this.refresh();
                this.showSelection();
              }
              break;
          }
        });
        
        this._rootSubject.next(this._absoluteRoot);
        
        this._route.params.subscribe((parameters: Params) => {
          if (this._synchronizeWithSelection) {
            this.showSelection();
          }
        });
        
        this.showSelection();
      }
    });
  }
  
  public ngOnDestroy(): void {
    this.prepareForDismantling();
    if (this._treeConfigurationSubscription) {
      this._treeConfigurationSubscription.unsubscribe();
    }
    this._itemRepositorySubscription.unsubscribe();
  }
  
  public toggleSelectionSynchronization(): void {
    this._synchronizeWithSelection = !this._synchronizeWithSelection;
    if (this._synchronizeWithSelection) {
      this.showSelection();
    }
  }
  
  public postTreeTraversalActivity(): void {
    this._changeDetectorRef.markForCheck();
  }
}