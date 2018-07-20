import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChild, OnInit, OnDestroy,
  Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { CompareItemsComponent,
  VersionDesignator } from '../../compare-items/compare-items.component';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row/tree-row.class';
import { Image, RowAction, MenuAction } from '../tree-row/tree-row.component';

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
    new Image('assets/icons/versioncontrol/dirty.ico', 'Unsaved Changes',
      false, (object: any) => {
      return (object as ItemProxy).dirty;
    }),
    new Image('assets/icons/versioncontrol/unstaged.ico', 'Unstaged', false,
      (object: any) => {
      return !!(object as ItemProxy).status['Unstaged'];
    }),
    new Image('assets/icons/versioncontrol/index-mod.ico', 'Staged', false,
      (object: any) => {
      return !!(object as ItemProxy).status['Staged'];
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
    NavigationService, private _dynamicTypesService: DynamicTypesService) {
    super(route, dialogService, false);
  }

  public ngOnInit(): void {
    let deleteMenuAction: MenuAction = new MenuAction('Delete',
      'Deletes this Item', 'fa fa-times delete-button', (object: any) => {
      return !(object as ItemProxy).internal;
      }, (object: any) => {
      this._dialogService.openCustomTextDialog('Confirm Deletion',
        'Are you sure you want to delete ' + (object as ItemProxy).item.name + '?', [
        'Cancel', 'Delete', 'Delete Recursively']).subscribe((result: any) => {
        if (result) {
          if (object === this.rootSubject.getValue()) {
            this.rootSubject.next(this.getParent(object));
          }
          
          this._itemRepository.deleteItem((object as ItemProxy), (2 === result));
        }
      });
    });
    this.rootMenuActions.push(deleteMenuAction);
    this.menuActions.push(deleteMenuAction);

    let stagedVersionComparisonAction: MenuAction = new MenuAction('Compare ' +
      'Against Staged Version', 'Compare this Item against the staged ' +
      'version of this Item', 'fa fa-exchange', (object: any) => {
      return (object as ItemProxy).status['Staged'];
      }, (object: any) => {
      this.openComparisonDialog((object as ItemProxy), VersionDesignator.
        STAGED_VERSION);
    });
    this.rootMenuActions.push(stagedVersionComparisonAction);
    this.menuActions.push(stagedVersionComparisonAction);

    let lastCommittedVersionComparisonAction: MenuAction = new MenuAction(
      'Compare Against Last Committed Version', 'Compares this Item against ' +
      'the last committed version of this Item', 'fa fa-exchange', (object:
      any) => {
      if ((object as ItemProxy).history) {
        return ((object as ItemProxy).history.length > 0);
      } else {
        this._itemRepository.getHistoryFor(object as ItemProxy);
        return false;
      }
      }, (object: any) => {
      this.openComparisonDialog((object as ItemProxy), VersionDesignator.
        LAST_COMMITTED_VERSION);
    });
    this.rootMenuActions.push(lastCommittedVersionComparisonAction);
    this.menuActions.push(lastCommittedVersionComparisonAction);

    let itemComparisonAction: MenuAction = new MenuAction('Compare Against...',
      'Compare this Item against another Item', 'fa fa-exchange', (object:
      any) => {
      return true;
      }, (object: any) => {
      this.openComparisonDialog((object as ItemProxy), undefined);
    });
    this.rootMenuActions.push(itemComparisonAction);
    this.menuActions.push(itemComparisonAction);

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
                this.buildRow(notification.proxy);
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
                this.showFocus();
              }
              break;
            default:
              if (notification.proxy) {
                this.getRow(notification.proxy.item.id).refresh();
              }
          }
        });
        
        this.rootSubject.next(this._absoluteRoot);
        
        this._route.params.subscribe((parameters: Params) => {
          if (this._synchronizeWithSelection) {
            this.showFocus();
          }
        });
        
        this.refresh();
        this.showFocus();
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
      this.showFocus();
    }
  }
  
  protected getId(object: any): any {
    return (object as ItemProxy).item.id;
  }
  
  protected getParent(object: any): any {
    let parent: ItemProxy = undefined;
    if ((object as ItemProxy).parentProxy) {
      parent = (object as ItemProxy).parentProxy;
    }

    return parent;
  }
  
  protected getChildren(object: any): Array<any> {
    let children: Array<any> = [];
    let proxy: ItemProxy = (object as ItemProxy);
    for (let j: number = 0; j < proxy.children.length; j++) {
      children.push(proxy.children[j]);
    }

    return children;
  }

  protected postTreeTraversalActivity(): void {
    this._changeDetectorRef.markForCheck();
  }
  
  protected rowFocused(row: TreeRow): void {
    this._navigationService.navigate('Explore', {
      id: this.getId(row.object)
    });
  }

  protected getText(object: any): string {
    let item: any = (object as ItemProxy).item;
    let text: string = item.name;
    if (item.tags) {
      text = text + ' ' + item.tags;
    }
    
    return text;
  }

  protected getIcon(object: any): string {
    let iconString: string = '';
    let koheseType: KoheseType = (object as ItemProxy).model.type;
    if (koheseType && koheseType.viewModelProxy) {
      iconString = koheseType.viewModelProxy.item.icon;
    }

    return iconString;
  }
  
  protected filter(object: any): boolean {
    return super.filter((object as ItemProxy).item);
  }
  
  private openComparisonDialog(proxy: ItemProxy, changeVersionDesignator:
    VersionDesignator): void {
    let compareItemsDialogParameters: any = {
      baseProxy: proxy,
      editable: true
    };

    if (null != changeVersionDesignator) {
      compareItemsDialogParameters['changeProxy'] = proxy;
      compareItemsDialogParameters['changeVersion'] = changeVersionDesignator;
    }

    this._dialogService.openComponentDialog(CompareItemsComponent, {
      data: compareItemsDialogParameters
    }).updateSize('90%', '90%');
  }
}
