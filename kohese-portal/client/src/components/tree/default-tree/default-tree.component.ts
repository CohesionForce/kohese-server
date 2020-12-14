
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
import { FormatDefinition,
  FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { CompareItemsComponent,
  VersionDesignator } from '../../compare-items/item-comparison/compare-items.component';
import { ReportSpecificationComponent,
  ReportSpecifications } from '../../reports/report-specification/report-specification.component';
import { Tree, TargetPosition } from '../tree.class';
import { TreeRow } from '../tree-row/tree-row.class';
import { Image, DisplayableEntity, Action,
  ActionGroup } from '../tree-row/tree-row.component';
import { Filter, FilterCriterion } from '../../filter/filter.class';
import { ItemProxyFilter } from '../../filter/item-proxy-filter.class';
import { CreateWizardComponent } from '../../create-wizard/create-wizard.component';
import { ImportComponent } from '../../import/import.component';

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
    }, async (object: any) => {
      let result: any = await this._dialogService.openDropdownDialog('Remove ' +
        'Descendants', 'Do you also want to remove all descendants of ' +
        (object as ItemProxy).item.name + '?', '', 'No', (value: any) => {
        return true;
      }, { Yes: 'Yes', No: 'No' });
      if (result) {
        if (object === this.rootSubject.getValue()) {
          this.rootSubject.next(this.getParent(object));
        }
        this.rowFocused(undefined);
        this._itemRepository.deleteItem((object as ItemProxy), (result ===
          'Yes'));
      }
    });
    this.rootMenuActions.unshift(deleteAction);
    this.menuActions.unshift(deleteAction);

    let produceReportAction: Action = new Action('Produce Report', 'Produce ' +
      'a report from this Item and its descendants', 'fa fa-file-text-o',
      (object: any) => {
      return !(object as ItemProxy).internal;
    }, (object: any) => {
      this._dialogService.openComponentDialog(
        ReportSpecificationComponent, {
        data: {
          defaultName: (object as ItemProxy).item.name + '_' + new Date().
            toISOString(),
          allowDescendantInclusionSpecification: true,
          allowLinkSpecification: true,
          getReportContent: (initialContent: string, reportSpecifications:
            ReportSpecifications) => {
            let processItemProxy: (itemProxy: ItemProxy) => void = (itemProxy:
              ItemProxy) => {
              initialContent += this._itemRepository.getMarkdownRepresentation(
                itemProxy.item, undefined, itemProxy.model.item, itemProxy.
                model.view.item, FormatDefinitionType.DOCUMENT, itemProxy.
                getDepthFromAncestor(object as ItemProxy),
                reportSpecifications.addLinks);
            };

            if (reportSpecifications.includeDescendants) {
              let itemProxyStack: Array<ItemProxy> = [(object as ItemProxy)];
              while (itemProxyStack.length > 0) {
                let itemProxy: ItemProxy = itemProxyStack.shift();
                processItemProxy(itemProxy);
                itemProxyStack.unshift(...itemProxy.children);
              }
            } else {
              processItemProxy((object as ItemProxy));
            }

            return initialContent;
          }
        }
      }).updateSize('40%', '40%');
    });
    this.rootMenuActions.unshift(produceReportAction);
    this.menuActions.unshift(produceReportAction);

    let analyzeAction: Action = new Action('Analyze...', 'Analyze content ' +
      'from this Item and its descendants', 'fa fa-search', (object: any) => {
      return true;
    }, (object: any) => {
      this._navigationService.navigate('Analysis',
        { id: (object as ItemProxy).item.id });
    });
    this.rootMenuActions.unshift(analyzeAction);
    this.menuActions.unshift(analyzeAction);

    let importAction: Action = new Action('Import...', 'Import one or more ' +
      'files as children of this Item', 'fa fa-file-o', (object: any) => {
      return !(object as ItemProxy).internal || (object === this.
        _absoluteRoot);
    }, (object: any) => {
      this._dialogService.openComponentDialog(ImportComponent, {
        data: {
          parentId: (object as ItemProxy).item.id
        }
      }).updateSize('90%', '90%');
    });
    this.rootMenuActions.unshift(importAction);
    this.menuActions.unshift(importAction);

    let addChildAction: Action = new Action('Add Child', 'Add a child to ' +
      'this Item', 'fa fa-plus add-button', (object: any) => {
      return !(object as ItemProxy).internal || (object === this.
        _absoluteRoot);
    }, (object: any) => {
      this._dialogService.openComponentDialog(CreateWizardComponent, {
        data: {
          parentId: (object as ItemProxy).item.id
        }
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
            case 'update':
            case 'dirty':
              this.refresh();
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
                let row: TreeRow = this.getRow(notification.proxy.item.id);
                /* The below conditional should not be necessary; however, an
                error has been produced during removal without this
                conditional. */
                if (row) {
                  row.refresh();
                }
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

        /* Let one or more queued asynchronous tasks execute prior to
        executing showFocus so that showFocus will succeed */
        setTimeout(() => {
          this.showFocus();
        }, 0);
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
    return (object as ItemProxy).item.name;
  }

  protected getTags(object: any): Array<string> {
    let item: any = (object as ItemProxy).item;
    return (item.tags ? item.tags.split(',') : []);
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

  protected hasError(object: any): boolean {
    return !!(object as ItemProxy).validationError;
  }

  protected async target(target: any, targetingObject: any, targetPosition: TargetPosition): Promise<void> {
    let targetProxy: ItemProxy = (target as ItemProxy);
    let parentProxy: ItemProxy = targetProxy.parentProxy;
    let targetingProxy: ItemProxy = (targetingObject as ItemProxy);
    let targetProxyRepo = targetProxy.getRepositoryProxy();
    let targetingProxyRepo = targetingProxy.getRepositoryProxy();
    let moveItem = true;

    // The targetingName is the name of the item being moved
    // The targetName is the repository name selected in which to move targetingName.
    let targetName = targetProxy.item.name;
    let targetRepoName = targetProxyRepo.item.name;
    let targetingName = targetingProxy.item.name;
    let targetingRepoName = targetingProxyRepo.item.name;

    // Selects the correct name when a user chooses BEFORE/AFTER/CHILD on Move
    if ((targetRepoName !== parentProxy.item.name) &&
        (targetPosition === TargetPosition.BEFORE || targetPosition === TargetPosition.AFTER)) {
      targetRepoName = parentProxy.item.name;
    }

    // Truncate, trim, and add ellipses if any names are too long.
    if (targetingName.length >= 40) {
      targetingName = targetingName.slice(0, 40).trim() + '...';
    }
    if (targetingRepoName.length >= 40) {
      targetingRepoName = targetingRepoName.slice(0, 40).trim() + '...';
    }
    if (targetName.length >= 40) {
      targetName = targetName.slice(0, 40).trim() + '...';
    }
    if (targetRepoName.length >= 40) {
      targetRepoName = targetRepoName.slice(0, 40).trim() + '...';
    }


    // Determine if user wants to move the selected item to a different repository.
    if (targetingProxyRepo !== targetProxyRepo) {
      console.log('!!! This will move %s items to the selected repository', targetingProxy.descendantCount + 1);
      moveItem = await this._dialogService.openSimpleDialog(
        'Moving ' + targetingName,
        'Do you want to move ' + (targetingProxy.descendantCount + 1) + ' item(s) from the ' + targetingRepoName +
        ' repository to the ' + targetRepoName + ' repository?',
        {
          acceptLabel: 'Move',
          cancelLabel: 'Skip'
        });
    }

    // If user selects move...
    if (moveItem) {
      if ((targetPosition === TargetPosition.BEFORE) || (targetPosition === TargetPosition.AFTER)) {
        parentProxy = targetProxy.parentProxy;
        if (targetingProxy.item.parentId !== parentProxy.item.id) {
          targetingProxy.item.parentId = parentProxy.item.id;
          targetingProxy.updateItem(targetingProxy.kind, targetingProxy.item);
          this._itemRepository.upsertItem(targetingProxy.kind, targetingProxy.
            item);
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
        this._itemRepository.upsertItem(parentProxy.kind, parentProxy.item);
      } else {
        targetingProxy.item.parentId = targetProxy.item.id;
        targetingProxy.updateItem(targetingProxy.kind, targetingProxy.item);
        this._itemRepository.upsertItem(targetingProxy.kind, targetingProxy.
          item);
      }
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
