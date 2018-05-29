import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChild, OnInit, OnDestroy,
  Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row.class';
import { Image, RowAction, MenuAction } from '../tree-row.component';

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
  
  private _images: Array<Image> = [
    new Image('assets/icons/versioncontrol/dirty.ico', 'Unsaved Changes', (row: TreeRow) => {
    return (row.object as ItemProxy).dirty;
    }),
    new Image('assets/icons/versioncontrol/unstaged.ico', 'Unstaged', (row: TreeRow) => {
    return !!(row.object as ItemProxy).status['Unstaged'];
    }),
    new Image('assets/icons/versioncontrol/index-mod.ico', 'Staged', (row: TreeRow) => {
    return !!(row.object as ItemProxy).status['Staged'];
    })
  ];
  get images() {
    return this._images;
  }
  
  private _itemRepositorySubscription: Subscription;
  private _treeConfigurationSubscription: Subscription;
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    route: ActivatedRoute, private _itemRepository: ItemRepository,
    dialogService: DialogService, private _navigationService:
    NavigationService) {
    super(route, dialogService);
  }
  
  public ngOnInit(): void {
    this.rootRowActions.push(new RowAction('Set Parent As Root',
      'Set this row\'s parent as the root', 'fa fa-level-up', (row:
      TreeRow) => {
      return (this._rootSubject.getValue() && (this._rootSubject.getValue().
        object !== this._absoluteRoot));
      }, (row: TreeRow) => {
      this._rootSubject.next(this.getParent(row));
    }));
    
    let deleteMenuAction: MenuAction = new MenuAction('Delete',
      'Deletes this Item', 'fa fa-times delete-button', (row: TreeRow) => {
      return !(row.object as ItemProxy).internal;
      }, (row: TreeRow) => {
      this._dialogService.openCustomTextDialog('Confirm Deletion',
        'Are you sure you want to delete ' + (row.object as ItemProxy).item.name + '?', [
        'Cancel', 'Delete', 'Delete Recursively']).subscribe((result: any) => {
        if (result) {
          if (row === this._rootSubject.getValue()) {
            this._rootSubject.next(this.getParent(row));
          }
          
          this._itemRepository.deleteItem((row.object as ItemProxy), (2 === result));
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
            default:
              if (notification.proxy) {
                this.getRow(notification.proxy.item.id).refresh();
              }
          }
        });
        
        this._rootSubject.next(this.getRow(this._absoluteRoot.item.id));
        
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
  
  public getId(row: TreeRow): string {
    return (row.object as ItemProxy).item.id;
  }
  
  public getParent(row: TreeRow): TreeRow {
    let parent: TreeRow = undefined;
    if ((row.object as ItemProxy).parentProxy) {
      parent = this.getRow((row.object as ItemProxy).parentProxy.item.id);
    }
    
    return parent;
  }
  
  public getChildren(row: TreeRow): Array<TreeRow> {
    let children: Array<TreeRow> = [];
    let proxy: ItemProxy = (row.object as ItemProxy);
    for (let j: number = 0; j < proxy.children.length; j++) {
      children.push(this.getRow(proxy.children[j].item.id));
    }
    
    return children;
  }
  
  public postTreeTraversalActivity(): void {
    this._changeDetectorRef.markForCheck();
  }
  
  public rowSelected(row: TreeRow): void {
    this._navigationService.navigate('Explore', { id: this.getId(row) });
  }
  
  public getText(object: any): string {
    return (object as ItemProxy).item.name;
  }
  
  public getIcon(object: any): string {
    let iconString: string = '';
    let koheseType: KoheseType = (object as ItemProxy).model.type;
    if (koheseType && koheseType.viewModelProxy) {
      iconString = koheseType.viewModelProxy.item.icon;
    }
    
    return iconString;
  }
}