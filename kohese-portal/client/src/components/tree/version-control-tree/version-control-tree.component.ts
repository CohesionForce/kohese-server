import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ToastrService } from 'ngx-toastr';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { CompareItemsComponent,
  VersionDesignator } from '../../compare-items/compare-items.component';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row/tree-row.class';
import { Image, RowAction, MenuAction } from '../tree-row/tree-row.component';

@Component({
  selector: 'version-control-tree',
  templateUrl: './version-control-tree.component.html',
  styleUrls: ['../tree.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class VersionControlTreeComponent extends Tree implements OnInit,
  OnDestroy {
  private _absoluteRoot: ItemProxy;
  get absoluteRoot() {
    return this._absoluteRoot;
  }

  private _images: Array<Image> = [
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

  public constructor(private _changeDetectorRef: ChangeDetectorRef, route:
    ActivatedRoute, private _itemRepository: ItemRepository, dialogService:
    DialogService, private _navigationService: NavigationService,
    private _versionControlService: VersionControlService,
    private _toastrService: ToastrService, private _dynamicTypesService:
    DynamicTypesService) {
    super(route, dialogService, false);
  }

  public ngOnInit(): void {
    let versionControlRowActions: Array<RowAction> = [
      new RowAction('Revert', 'Undoes all uncommitted changes to this Item',
        'fa fa-undo', (object: any) => {
        return (Object.keys((object as ItemProxy).status).length > 0);
        }, (object: any) => {
        this._dialogService.openYesNoDialog('Undo Changes', 'Are you sure ' +
          'that you want to undo all changes to this Item since the last ' +
          'commit?').subscribe((result: any) => {
          if (result) {
            this._versionControlService.revertItems([(object as ItemProxy)]).
              subscribe((statusMap: any) => {
              if (statusMap.error) {
                this._toastrService.error('Revert Failed', 'Version Control');
              } else {
                this._toastrService.success('Revert Succeeded',
                  'Version Control');
              }
            });
          }
        });
      }),
      new RowAction('Stage', 'Stages changes to this Item', 'fa fa-plus',
        (object: any) => {
        return (object as ItemProxy).status['Unstaged'];
        }, (object: any) => {
        this._versionControlService.stageItems([(object as ItemProxy)]).subscribe(
          (statusMap: any) => {
          if (statusMap.error) {
            this._toastrService.error('Stage Failed', 'Version Control');
          } else {
            this._toastrService.success('Stage Succeeded', 'Version Control');
          }
        });
      }),
      new RowAction('Unstage', 'Un-stages changes to this Item', 'fa fa-minus',
        (object: any) => {
        return (object as ItemProxy).status['Staged'];
        }, (object: any) => {
        this._versionControlService.unstageItems([(object as ItemProxy)]).
          subscribe((statusMap: any) => {
          if (statusMap.error) {
            this._toastrService.error('Unstage Failed', 'Version Control');
          } else {
            this._toastrService.success('Unstage Succeeded',
              'Version Control');
          }
        });
      })
    ];
    this.rootRowActions.splice(0, 0, ...versionControlRowActions);
    this.rowActions.splice(0, 0, ...versionControlRowActions);

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

        if (this._treeConfigurationSubscription) {
          this._treeConfigurationSubscription.unsubscribe();
        }
        this._treeConfigurationSubscription = treeConfigurationObject.config.
          getChangeSubject().subscribe((notification: any) => {
          if (notification.proxy) {
            let row: TreeRow = this.getRow(notification.proxy.item.id);
            if (row) {
              // Row already exists, so update it
              if (this.proxyHasVCStatus(notification.proxy)){
                row.refresh();
              } else {
                // Row does not represent a modified item
                if (this.getChildren(row).length){
                  // This row would still be displayed as an ancestor
                  row.refresh();
                } else {
                  // Row has no descendants and needs to be removed
                  this.removeRowAndAncestors(notification.proxy);
                  this.refresh();
                }
              }
            } else {
              // Need to add a new row
              this.addRowAndAncestors(notification.proxy);
              this.refresh();
            }
          }
        });

        this.buildRows(this._absoluteRoot);
        this.rootSubject.next(this._absoluteRoot);
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

  private proxyHasVCStatus (proxy: ItemProxy): boolean {
    return (Object.keys(proxy.status).length > 0);
  }

  private addRowAndAncestors(proxy: ItemProxy): void {
    if (this.proxyHasVCStatus(proxy)) {
      this.buildRow(proxy);

      // Build the ancestors if necessary
      let ancestor = proxy.parentProxy;
      while (!this.getRow(ancestor.item.id)){
        this.buildRow(ancestor);
        ancestor = ancestor.parentProxy;
      }
    }
  }

  private removeRowAndAncestors(proxy: ItemProxy){
    let currentRow = this.getRow(proxy.item.id);
    if (currentRow){
      if (!(this.proxyHasVCStatus(proxy) || this.getChildren(currentRow).length)){
        // Delete the row and any applicable ancestors
        this.deleteRow(proxy.item.id);

        let ancestor = proxy.parentProxy;
        let ancestorRow = this.getRow(ancestor.item.id);
        while ((ancestor !== this._absoluteRoot) && !(this.proxyHasVCStatus(ancestor) || this.getChildren(ancestorRow).length)){
          this.deleteRow(ancestor.item.id);
          ancestor = ancestor.parentProxy;
          ancestorRow = this.getRow(ancestor.item.id);
        }
      }
    }

  }

  private buildRows(root: ItemProxy): void {
    this.clear();

    let rootRow: TreeRow = this.buildRow(root);
    rootRow.expanded = true;
    root.visitTree({ includeOrigin: false }, (proxy: ItemProxy) => {
      this.addRowAndAncestors(proxy);
    });
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
    let children: Array<ItemProxy> = [];
    let proxy: ItemProxy = (object as ItemProxy);
    for (let j: number = 0; j < proxy.children.length; j++) {
      let child: ItemProxy = proxy.children[j];
      if (this.getRow(child.item.id)) {
        children.push(child);
      }
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
    return (object as ItemProxy).item.name;
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
