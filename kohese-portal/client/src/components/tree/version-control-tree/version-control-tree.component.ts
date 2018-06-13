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
import { TreeRow } from '../tree-row.class';
import { Image, RowAction, MenuAction } from '../tree-row.component';

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
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef, route:
    ActivatedRoute, private _itemRepository: ItemRepository, dialogService:
    DialogService, private _navigationService: NavigationService,
    private _versionControlService: VersionControlService,
    private _toastrService: ToastrService, private _dynamicTypesService:
    DynamicTypesService) {
    super(route, dialogService);
  }
  
  public ngOnInit(): void {
    let versionControlRowActions: Array<RowAction> = [
      new RowAction('Revert', 'Undoes all uncommitted changes to this Item',
        'fa fa-undo', (row: TreeRow) => {
        return (Object.keys((row.object as ItemProxy).status).length > 0);
        }, (row: TreeRow) => {
        this._dialogService.openYesNoDialog('Undo Changes', 'Are you sure ' +
          'that you want to undo all changes to this Item since the last ' +
          'commit?').subscribe((result: any) => {
          if (result) {
            this._versionControlService.revertItems([(row.object as ItemProxy)]).
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
        (row: TreeRow) => {
        return (row.object as ItemProxy).status['Unstaged'];
        }, (row: TreeRow) => {
        this._versionControlService.stageItems([(row.object as ItemProxy)]).subscribe(
          (statusMap: any) => {
          if (statusMap.error) {
            this._toastrService.error('Stage Failed', 'Version Control');
          } else {
            this._toastrService.success('Stage Succeeded', 'Version Control');
          }
        });
      }),
      new RowAction('Unstage', 'Un-stages changes to this Item', 'fa fa-minus',
        (row: TreeRow) => {
        return (row.object as ItemProxy).status['Staged'];
        }, (row: TreeRow) => {
        this._versionControlService.unstageItems([(row.object as ItemProxy)]).
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
      'version of this Item', 'fa fa-exchange', (row: TreeRow) => {
      return (row.object as ItemProxy).status['Staged'];
      }, (row: TreeRow) => {
      this.openComparisonDialog(row, VersionDesignator.STAGED_VERSION);
    });
    this.rootMenuActions.push(stagedVersionComparisonAction);
    this.menuActions.push(stagedVersionComparisonAction);
    
    let lastCommittedVersionComparisonAction: MenuAction = new MenuAction(
      'Compare Against Last Committed Version', 'Compares this Item against ' +
      'the last committed version of this Item', 'fa fa-exchange', (row:
      TreeRow) => {
      if ((row.object as ItemProxy).history) {
        return ((row.object as ItemProxy).history.length > 0);
      } else {
        this._itemRepository.getHistoryFor(row.object as ItemProxy);
        return false;
      }
      }, (row: TreeRow) => {
      this.openComparisonDialog(row, VersionDesignator.LAST_COMMITTED_VERSION);
    });
    this.rootMenuActions.push(lastCommittedVersionComparisonAction);
    this.menuActions.push(lastCommittedVersionComparisonAction);
    
    let itemComparisonAction: MenuAction = new MenuAction('Compare Against...',
      'Compare this Item against another Item', 'fa fa-exchange', (row: TreeRow) => {
      return true;
      }, (row: TreeRow) => {
      this.openComparisonDialog(row, undefined);
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
              row.refresh();
            } else {
              this.refresh();
            }
          }
        });
        
        this._rootSubject.next(this.buildRow(this._absoluteRoot));
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
  
  private buildRows(root: ItemProxy): void {
    this.clear();
    
    let rootRow: TreeRow = this.buildRow(root);
    rootRow.expanded = true;
    root.visitTree({ includeOrigin: false }, undefined, (proxy: ItemProxy) => {
      let build: boolean = (Object.keys(proxy.status).length > 0);
      if (!build) {
        for (let j: number = 0; j < proxy.children.length; j++) {
          if (this.getRow(proxy.children[j].item.id)) {
            build = true;
            break;
          }
        }
      }
      
      if (build) {
        this.buildRow(proxy);
      }
    });
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
      let childRow: TreeRow = this.getRow(proxy.children[j].item.id);
      if (childRow) {
        children.push(childRow);
      }
    }
    
    return children;
  }
  
  public postTreeTraversalActivity(): void {
    this._changeDetectorRef.markForCheck();
  }
  
  public rootChanged(): void {
    this.buildRows(this._rootSubject.getValue().object);
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
  
  private openComparisonDialog(row: TreeRow, changeVersionDesignator:
    VersionDesignator): void {
    let compareItemsDialogParameters: any = {
      baseProxy: row.object,
      editable: true
    };
    
    if (null != changeVersionDesignator) {
      compareItemsDialogParameters['changeProxy'] = row.object;
      compareItemsDialogParameters['changeVersion'] = changeVersionDesignator;
    }
    
    this._dialogService.openComponentDialog(CompareItemsComponent, {
      data: compareItemsDialogParameters
    }).updateSize('90%', '90%');
  }
}