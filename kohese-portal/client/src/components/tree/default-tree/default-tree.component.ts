
import {tap} from 'rxjs/operators';
import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChild, OnInit, OnDestroy,
  Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject ,  Observable ,  Subscription } from 'rxjs';

import { DialogService } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { CompareItemsComponent,
  VersionDesignator } from '../../compare-items/item-comparison/compare-items.component';
import { Tree, TargetPosition } from '../tree.class';
import { TreeRow } from '../tree-row/tree-row.class';
import { Image, DisplayableEntity, Action,
  ActionGroup } from '../tree-row/tree-row.component';
import { Filter, FilterCriterion } from '../../filter/filter.class';
import { ItemProxyFilter } from '../../filter/item-proxy-filter.class';
import { CreateWizardComponent } from '../../create-wizard/create-wizard.component';

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

  private _searchCriterion: FilterCriterion = new FilterCriterion(new Filter().
    filterableProperties[0], FilterCriterion.CONDITIONS.CONTAINS, '');
  get searchCriterion() {
    return this._searchCriterion;
  }

  private _filterDelayIdentifier: any;

  private _images: Array<Image> = [
    new Image('assets/icons/versioncontrol/dirty.ico', 'Unsaved Changes',
      false, (object: any) => {
      return (object as ItemProxy).dirty;
    }),
    new Image('assets/icons/versioncontrol/unstaged.ico', 'Unstaged', false,
      (object: any) => {
      return ((object as ItemProxy).vcStatus.isUnstaged());
    }),
    new Image('assets/icons/versioncontrol/index-mod.ico', 'Staged', false,
      (object: any) => {
      return ((object as ItemProxy).vcStatus.isStaged());
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
    super(route, dialogService);
    this.canMoveRows = true;
  }

  public ngOnInit(): void {
    this._searchCriterion.external = true;

    for (let j: number = 0; j < this.rowActions.length; j++) {
      let displayableEntity: DisplayableEntity = this.rowActions[j];
      if (displayableEntity instanceof ActionGroup) {
        for (let k: number = 0; k < (displayableEntity as ActionGroup).actions.
          length; k++) {
          let action: Action = (displayableEntity as ActionGroup).actions[k];
          if ((action.text === TargetPosition.BEFORE) || (action.text ===
            TargetPosition.AFTER)) {
            action.canActivate = (object: any) => {
              let parentProxy: ItemProxy = (object as ItemProxy).parentProxy;
              return (parentProxy && parentProxy.childrenAreManuallyOrdered());
            };
          }
        }
      }
    }

    let deleteAction: Action = new Action('Delete',
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
          this.rowFocused(undefined);
          this._itemRepository.deleteItem((object as ItemProxy), (2 === result));
        }
      });
    });
    this.rootMenuActions.unshift(deleteAction);
    this.menuActions.unshift(deleteAction);
    
    let addChildAction: Action = new Action('Add Child', 'Add a child to ' +
      'this Item', 'fa fa-plus add-button', (object: any) => {
      return !(object as ItemProxy).internal || (object === this.
        _absoluteRoot);
    }, (object: any) => {
      this._dialogService.openComponentDialog(CreateWizardComponent, {
        data: {
          parentId: (object as ItemProxy).item.id
        },
        disableClose: true
      }).updateSize('90%', '90%');
    });
    this.rootMenuActions.unshift(addChildAction);
    this.menuActions.unshift(addChildAction);

    let stagedVersionComparisonAction: Action = new Action('Compare ' +
      'Against Staged Version', 'Compare this Item against the staged ' +
      'version of this Item', 'fa fa-exchange', (object: any) => {
      return ((object as ItemProxy).vcStatus.isStaged());
      }, (object: any) => {
      this.openComparisonDialog((object as ItemProxy), VersionDesignator.
        STAGED_VERSION);
    });
    this.rootMenuActions.push(stagedVersionComparisonAction);
    this.menuActions.push(stagedVersionComparisonAction);

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

        this.refresh();

        this.initialize();

        this._route.params.subscribe((parameters: Params) => {
          if (this._synchronizeWithSelection) {
            this.showFocus();
          }
        });

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
      id: (row ? this.getId(row.object) : '')
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
    let proxy: ItemProxy = (object as ItemProxy);
    let item: any = proxy.item;
    item['kind'] = proxy.kind;  // TODO: Need to remove update of item
    item['status'] = proxy.vcStatus.statusArray; // TODO: Need to remove update of item
    return super.filter(item);
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

  protected target(target: any, targetingObject: any, targetPosition:
    TargetPosition): void {
    let targetProxy: ItemProxy = (target as ItemProxy);
    let targetingProxy: ItemProxy = (targetingObject as ItemProxy);
    if ((targetPosition === TargetPosition.BEFORE) || (targetPosition ===
      TargetPosition.AFTER)) {
      let parentProxy: ItemProxy = targetProxy.parentProxy;
      if (targetingProxy.item.parentId !== parentProxy.item.id) {
        targetingProxy.item.parentId = parentProxy.item.id;
        targetingProxy.updateItem(targetingProxy.kind, targetingProxy.item);
        this._itemRepository.upsertItem(targetingProxy);
      }

      parentProxy.children.splice(parentProxy.children.indexOf(targetingProxy),
        1);
      let targetIndex: number = parentProxy.children.indexOf(targetProxy);
      if (targetPosition === TargetPosition.BEFORE) {
        parentProxy.children.splice(targetIndex, 0, targetingProxy);
      } else {
        parentProxy.children.splice(targetIndex + 1, 0, targetingProxy);
      }

      parentProxy.updateChildrenManualOrder();
      this._itemRepository.upsertItem(parentProxy);
    } else {
      targetingProxy.item.parentId = targetProxy.item.id;
      targetingProxy.updateItem(targetingProxy.kind, targetingProxy.item);
      this._itemRepository.upsertItem(targetingProxy);
    }
  }

  protected mayMove(object: any): boolean {
    return super.mayMove(object) && !(object as ItemProxy).internal;
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
