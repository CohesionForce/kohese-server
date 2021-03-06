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
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable ,  Subscription } from 'rxjs';
import {tap} from 'rxjs/operators';

// Other External Dependencies
import { ToastrService } from 'ngx-toastr';

// Kohese
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { NotificationService } from '../../../services/notifications/notification.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { CompareItemsComponent, VersionDesignator } from '../../compare-items/item-comparison/compare-items.component';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row/tree-row.class';
import { Image, Action } from '../tree-row/tree-row.component';
import { Filter, FilterCriterion } from '../../filter/filter.class';
import { ItemProxyFilter } from '../../filter/item-proxy-filter.class';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

@Component({
  selector: 'version-control-tree',
  templateUrl: './version-control-tree.component.html',
  styleUrls: ['../tree.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class VersionControlTreeComponent extends Tree implements OnInit,
  OnDestroy {

  private _searchCriterion: FilterCriterion = new FilterCriterion(new Filter().
    filterableProperties[0], FilterCriterion.CONDITIONS.CONTAINS, '');
  get searchCriterion() {
    return this._searchCriterion;
  }

  private _filterDelayIdentifier: any;

  private _images: Array<Image> = [
    new Image('assets/icons/versioncontrol/dirty.ico', (object: any) => {
      return 'Unsaved Changes';
    }, false, (object: any) => {
      return (object as ItemProxy).dirty;
    }),
    new Image('assets/icons/versioncontrol/unstaged.ico', (object: any) => {
      return 'Unstaged' + ((object as ItemProxy).vcStatus.isNew() ? ' - New' :
        '');
    }, false, (object: any) => {
      return ((object as ItemProxy).vcStatus.isUnstaged());
    }),
    new Image('assets/icons/versioncontrol/index-mod.ico', (object: any) => {
      return 'Staged' + ((object as ItemProxy).vcStatus.isNew() ? ' - New' :
        '');
    }, false, (object: any) => {
      return ((object as ItemProxy).vcStatus.isStaged());
    })
  ];
  get images() {
    return this._images;
  }

  private _itemRepositorySubscription: Subscription;
  private _treeConfigurationSubscription: Subscription;

  public constructor(
    route: ActivatedRoute,
    dialogService: DialogService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _itemRepository: ItemRepository,
    private _navigationService: NavigationService,
    private _versionControlService: VersionControlService,
    private _toastrService: ToastrService,
    private _notificationService: NotificationService,
    private _dynamicTypesService: DynamicTypesService,
    private title : Title
    ) {
    super(route, dialogService);
  }

  public ngOnInit(): void {
    this._searchCriterion.external = true;
    let versionControlRowActions: Array<Action> = [
      new Action('Revert', 'Undoes all uncommitted changes to this Item',
        'fa fa-undo', (object: any) => {
        return ((object as ItemProxy).vcStatus.hasChanges());
        }, async (object: any) => {
        let result: any = await this._dialogService.openYesNoDialog('Undo ' +
          'Changes', 'Are you sure that you want to undo all changes to ' +
          'this Item since the last commit?');
        if (result) {
          this._versionControlService.revertItems([(object as ItemProxy)]).
            subscribe((statusMap: any) => {
            if (statusMap.error) {
              this._toastrService.error('Revert Failed', 'Version Control',
                {positionClass: 'toast-bottom-right'});
              this._notificationService.addNotifications('ERROR: Version Control - Revert Failed');
            } else {
              this._toastrService.success('Revert Succeeded',
                'Version Control', {positionClass: 'toast-bottom-right'});
              this._notificationService.addNotifications('COMPLETED: Version Control - Revert Succeeded');
            }
          });
        }
      }),
      new Action('Stage', 'Stages changes to this Item', 'fa fa-plus',
        (object: any) => {
        return ((object as ItemProxy).vcStatus.isUnstaged());
        }, (object: any) => {
        this._versionControlService.stageItems([(object as ItemProxy)]).subscribe(
          (statusMap: any) => {
          if (statusMap.error) {
            this._toastrService.error('Stage Failed', 'Version Control',
              {positionClass: 'toast-bottom-right'});
            this._notificationService.addNotifications('ERROR: Version Control - Stage Failed');
          } else {
            this._toastrService.success('Stage Succeeded', 'Version Control',
              {positionClass: 'toast-bottom-right'});
            this._notificationService.addNotifications('COMPLETED: Version Control - Stage Succeeded');
          }
        });
      }),
      new Action('Unstage', 'Un-stages changes to this Item', 'fa fa-minus',
        (object: any) => {
        return ((object as ItemProxy).vcStatus.isStaged());
        }, (object: any) => {
        this._versionControlService.unstageItems([(object as ItemProxy)]).
          subscribe((statusMap: any) => {
          if (statusMap.error) {
            this._toastrService.error('Unstage Failed', 'Version Control',
              {positionClass: 'toast-bottom-right'});
            this._notificationService.addNotifications('ERROR: Version Control - Unstage Failed');
          } else {
            this._toastrService.success('Unstage Succeeded',
              'Version Control', {positionClass: 'toast-bottom-right'});
            this._notificationService.addNotifications('COMPLETED: Version Control - Unstage Succeeded');
          }
        });
      })
    ];
    this.rootRowActions.splice(0, 0, ...versionControlRowActions);
    this.rowActions.splice(0, 0, ...versionControlRowActions);

    // TODO: Reimplement when "User can stage tree" task is completed

    // let stagedVersionComparisonAction: Action = new Action('Compare ' +
    //   'Against Staged Version', 'Compare this Item against the staged ' +
    //   'version of this Item', 'fa fa-exchange', (object: any) => {
    //   return ((object as ItemProxy).vcStatus.isStaged());
    //   }, (object: any) => {
    //   this.openComparisonDialog((object as ItemProxy), VersionDesignator.
    //     STAGED_VERSION);
    // });
    // this.rootMenuActions.push(stagedVersionComparisonAction);
    // this.menuActions.push(stagedVersionComparisonAction);

    let lastCommittedVersionComparisonAction: Action = new Action(
      'Compare Against Last Committed Version', 'Compares this Item against ' +
      'the last committed version of this Item', 'fa fa-exchange', (object:
      any) => {
      return (!(object as ItemProxy).vcStatus.isNew());
      }, (object: any) => {
      this.openComparisonDialog((object as ItemProxy), VersionDesignator.
        LAST_COMMITTED_VERSION);
    });
    this.rootMenuActions.push(lastCommittedVersionComparisonAction);
    this.menuActions.push(lastCommittedVersionComparisonAction);

    let itemComparisonAction: Action = new Action('Compare Against...',
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
        this.absoluteRoot = treeConfigurationObject.config.getRootProxy();

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
                if (this.getChildren(row.object).length){
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

        this.buildRows(this.absoluteRoot);
        this.rootSubject.next(this.absoluteRoot);
        this.refresh();

        this.initialize();

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
    return (proxy.vcStatus.hasStatus());
  }

  private addRowAndAncestors(proxy: ItemProxy): void {
    if (this.proxyHasVCStatus(proxy)) {
      this.buildRow(proxy);

      // Build the ancestors if necessary
      let ancestor = proxy.parentProxy;
      while (ancestor && !this.getRow(ancestor.item.id)){
        this.buildRow(ancestor);
        ancestor = ancestor.parentProxy;
      }
    }
  }

  private removeRowAndAncestors(proxy: ItemProxy){
    if (!(this.proxyHasVCStatus(proxy) || this.getChildren(proxy).length)){
      // Delete the row and any applicable ancestors
      this.deleteRow(proxy.item.id);

      let ancestor: ItemProxy = proxy.parentProxy;
      while (ancestor && (ancestor !== this.absoluteRoot) && !(this.
        proxyHasVCStatus(ancestor) || this.getChildren(ancestor).length)){
        this.deleteRow(ancestor.item.id);
        ancestor = ancestor.parentProxy;
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
    let selectedProxyTitle = TreeConfiguration.getWorkingTree().getProxyFor(this.getId(row.object));
    this.title.setTitle('Version Control | ' + selectedProxyTitle);
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
    let proxy: ItemProxy = (object as ItemProxy);
    let item: any = proxy.item;
    return super.filter(item);
  }

  protected isMultiselectEnabled(object: any): boolean {
    return ((object as ItemProxy).vcStatus.hasStatus());
  }

  public openFilterDialog(filter: Filter): Observable<any> {
    if (!filter) {
      filter = new ItemProxyFilter(this._dynamicTypesService, this.
        _itemRepository);
    }

    return super.openFilterDialog(filter).pipe(tap((resultingFilter: Filter) => {
      if (resultingFilter && !resultingFilter.isElementPresent(this.
        _searchCriterion)) {
        this._searchCriterion.value = '';
      }
    }));
  }

  public removeFilter(): void {
    this._searchCriterion.value = '';
    super.removeFilter();
  }

  public searchStringChanged(searchString: string): void {
    if (this._filterDelayIdentifier) {
      clearTimeout(this._filterDelayIdentifier);
    }

    this._filterDelayIdentifier = setTimeout(() => {
      let advancedFilter: Filter = this.filterSubject.getValue();
      if (searchString) {
        if (!advancedFilter) {
          advancedFilter = new ItemProxyFilter(this._dynamicTypesService, this.
            _itemRepository);
        }

        if (!advancedFilter.isElementPresent(this._searchCriterion)) {
          this._searchCriterion.property = advancedFilter.filterableProperties[
            0];
          advancedFilter.rootElement.criteria.push(this._searchCriterion);
          this.filterSubject.next(advancedFilter);
        }
      } else {
        advancedFilter.removeElement(this._searchCriterion);
        this.filterSubject.next(advancedFilter);
      }

      this.refresh();

      this._filterDelayIdentifier = undefined;
    }, 1000);
  }

  public areSelectedProxiesInState(state: string): boolean {
    let selectedObjects: Array<any> = this.selectedObjectsSubject.getValue();
    for (let j: number = 0; j < selectedObjects.length; j++) {
      if (state) {
        if (0 === (selectedObjects[j] as ItemProxy).vcStatus.statusArray.filter((status:
          string) => {
          return status.startsWith(state);
        }).length) {
          return false;
        }
      } else if (0 === (selectedObjects[j] as ItemProxy).vcStatus.statusArray.length) {
        return false;
      }
    }

    return true;
  }

  public stageSelectedChanges(): void {
    this._versionControlService.stageItems(this.selectedObjectsSubject.
      getValue() as Array<ItemProxy>).subscribe((statusMap: any) => {
      if (statusMap.error) {
        this._toastrService.error('Stage Failed', 'Version Control',
          {positionClass: 'toast-bottom-right'});
        this._notificationService.addNotifications('ERROR: Version Control - Stage Failed');
      } else {
        this._toastrService.success('Stage Succeeded', 'Version Control',
          {positionClass: 'toast-bottom-right'});
        this._notificationService.addNotifications('COMPLETED: Version Control - Stage Succeeded');
      }
    });
  }

  public unstageSelectedChanges(): void {
    this._versionControlService.unstageItems(this.selectedObjectsSubject.
      getValue() as Array<ItemProxy>).subscribe((statusMap: any) => {
      if (statusMap.error) {
        this._toastrService.error('Unstage Failed', 'Version Control',
          {positionClass: 'toast-bottom-right'});
        this._notificationService.addNotifications('ERROR: Version Control - Unstage Failed');
      } else {
        this._toastrService.success('Unstage Succeeded',
          'Version Control', {positionClass: 'toast-bottom-right'});
          this._notificationService.addNotifications('COMPLETED: Version Control - Unstage Succeeded');
      }
    });
  }

  public revertSelectedChanges(): void {
    this._versionControlService.revertItems(this.selectedObjectsSubject.
      getValue() as Array<ItemProxy>).subscribe((statusMap: any) => {
      if (statusMap.error) {
        this._toastrService.error('Revert Failed', 'Version Control',
          {positionClass: 'toast-bottom-right'});
        this._notificationService.addNotifications('ERROR: Version Control - Revert Failed');
      } else {
        this._toastrService.success('Revert Succeeded', 'Version Control',
          {positionClass: 'toast-bottom-right'});
        this._notificationService.addNotifications('COMPLETED: Version Control - Revert Succeeded');
      }
    });
  }

  private openComparisonDialog(proxy: ItemProxy, changeVersionDesignator:
    VersionDesignator): void {
    let compareItemsDialogParameters: any = {
      baseProxy: proxy,
      editable: true
    };

    if (null != changeVersionDesignator) {
      compareItemsDialogParameters['changeProxy'] = proxy;
      compareItemsDialogParameters['baseVersion'] = changeVersionDesignator;
    }

    this._dialogService.openComponentDialog(CompareItemsComponent, {
      data: compareItemsDialogParameters
    }).updateSize('90%', '90%');
  }
}
