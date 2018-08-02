import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { Subscription } from 'rxjs/Subscription';
import { ToastrService } from 'ngx-toastr';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { VersionControlService, VersionControlState,
  VersionControlSubState } from '../../../services/version-control/version-control.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { CompareItemsComponent,
  VersionDesignator } from '../../compare-items/compare-items.component';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row/tree-row.class';
import { Image, RowAction, MenuAction } from '../tree-row/tree-row.component';
import { Filter, FilterCriterion } from '../../filter/filter.class';
import { ItemProxyFilter } from '../../filter/item-proxy-filter.class';

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
  
  private _searchCriterion: FilterCriterion = new FilterCriterion(new Filter().
    filterableProperties[0], FilterCriterion.CONDITIONS.CONTAINS, '');
  get searchCriterion() {
    return this._searchCriterion;
  }
  
  private _filterDelayIdentifier: any;
  
  get VersionControlState() {
    return VersionControlState;
  }

  private _images: Array<Image> = [
    new Image('assets/icons/versioncontrol/unstaged.ico', 'Unstaged', false,
      (object: any) => {
      return !!(object as ItemProxy).status[VersionControlState.UNSTAGED];
    }),
    new Image('assets/icons/versioncontrol/index-mod.ico', 'Staged', false,
      (object: any) => {
      return !!(object as ItemProxy).status[VersionControlState.STAGED];
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
        return (object as ItemProxy).status[VersionControlState.UNSTAGED];
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
        return (object as ItemProxy).status[VersionControlState.STAGED];
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
      return (object as ItemProxy).status[VersionControlState.STAGED];
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
      let proxy: ItemProxy = (object as ItemProxy);
      return !((proxy.status[VersionControlState.STAGED] ===
        VersionControlSubState.NEW) || (proxy.status[VersionControlState.
        UNSTAGED] === VersionControlSubState.NEW));
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
    let proxy: ItemProxy = (object as ItemProxy);
    let item: any = proxy.item;
    item['kind'] = proxy.kind;
    item['status'] = proxy.status;
    return super.filter(item); 
  }
  
  protected isMultiselectEnabled(object: any): boolean {
    return (Object.keys((object as ItemProxy).status).length > 0);
  }
  
  public openFilterDialog(): Observable<any> {
    if (!this.filterSubject.getValue()) {
      this.filterSubject.next(new ItemProxyFilter(this._dynamicTypesService,
        this._itemRepository));
    }
    
    return super.openFilterDialog().do((filter: Filter) => {
      if (filter && !filter.isElementPresent(this._searchCriterion)) {
        this._searchCriterion.value = '';
      }
    });
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
  
  public areSelectedProxiesInState(state: VersionControlState): boolean {
    let selectedObjects: Array<any> = this.selectedObjectsSubject.getValue();
    for (let j: number = 0; j < selectedObjects.length; j++) {
      if (state) {
        if (!(selectedObjects[j] as ItemProxy).status[state]) {
          return false;
        }
      } else if (0 === Object.keys((selectedObjects[j] as ItemProxy).status).
        length) {
        return false;
      }
    }
    
    return true;
  }
  
  public stageSelectedChanges(): void {
    this._versionControlService.stageItems(this.selectedObjectsSubject.
      getValue() as Array<ItemProxy>).subscribe((statusMap: any) => {
      if (statusMap.error) {
        this._toastrService.error('Stage Failed', 'Version Control');
      } else {
        this._toastrService.success('Stage Succeeded', 'Version Control');
      }
    });
  }
  
  public unstageSelectedChanges(): void {
    this._versionControlService.unstageItems(this.selectedObjectsSubject.
      getValue() as Array<ItemProxy>).subscribe((statusMap: any) => {
      if (statusMap.error) {
        this._toastrService.error('Unstage Failed', 'Version Control');
      } else {
        this._toastrService.success('Unstage Succeeded',
          'Version Control');
      }
    });
  }
  
  public revertSelectedChanges(): void {
    this._versionControlService.revertItems(this.selectedObjectsSubject.
      getValue() as Array<ItemProxy>).subscribe((statusMap: any) => {
      if (statusMap.error) {
        this._toastrService.error('Revert Failed', 'Version Control');
      } else {
        this._toastrService.success('Revert Succeeded', 'Version Control');
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
      compareItemsDialogParameters['changeVersion'] = changeVersionDesignator;
    }

    this._dialogService.openComponentDialog(CompareItemsComponent, {
      data: compareItemsDialogParameters
    }).updateSize('90%', '90%');
  }
}
