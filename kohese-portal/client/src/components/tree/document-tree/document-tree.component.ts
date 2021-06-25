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



import {tap} from 'rxjs/operators';
import { EventEmitter, Output, Input } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { Observable ,  Subscription } from 'rxjs';
import { TreeRow } from '../tree-row/tree-row.class';
import { Image, DisplayableEntity, Action, ActionGroup } from '../tree-row/tree-row.component';
import { ReportSpecificationComponent, ReportSpecifications } from '../../reports/report-specification/report-specification.component';
import { FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { CompareItemsComponent, VersionDesignator } from '../../compare-items/item-comparison/compare-items.component';
import { CreateWizardComponent } from '../../create-wizard/create-wizard.component';
import { ImportComponent } from '../../import/import.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { DialogService } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tree, TargetPosition } from '../tree.class';
import { Filter, FilterCriterion } from '../../filter/filter.class';
import { ItemProxyFilter } from '../../filter/item-proxy-filter.class';

@Component({
  selector: 'document-tree',
  templateUrl: './document-tree.component.html',
  styleUrls: ['./document-tree.component.scss', '../tree.component.scss']
})

// Controls the tree in outline view
export class DocumentTreeComponent extends Tree implements OnInit, OnDestroy {
  treeConfigSubscription : Subscription;
  treeConfig : any;
  paramSubscription: Subscription;
  changeSubjectSubscription : Subscription;
  sync : boolean = true;

  documentRoot : ItemProxy;
  documentRootId : string;

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

  @Output()
  rootSelected : EventEmitter<ItemProxy> = new EventEmitter<ItemProxy>();
  @Output()
  onSelect : EventEmitter<ItemProxy> = new EventEmitter<ItemProxy>();
  @Input()
  selectedProxyStream : Observable<ItemProxy>;
  selectedProxyStreamSubscription : Subscription;

  constructor(
    router: ActivatedRoute, dialogService : DialogService,
    private _dynamicTypesService: DynamicTypesService,
    private itemRepository : ItemRepository,
    private changeRef : ChangeDetectorRef,
    private navigationService: NavigationService) {
    super(router, dialogService);
    this.canMoveRows = true;
  }

  ngOnInit() {
    this._searchCriterion.external = true;

    for (let j: number = 0; j < this.rowActions.length; j++) {
      let displayableEntity: DisplayableEntity = this.rowActions[j];
      if (displayableEntity instanceof ActionGroup) {
        for (let k: number = 0; k < (displayableEntity as ActionGroup).actions.length; k++) {
          let action: Action = (displayableEntity as ActionGroup).actions[k];
          if ((action.text === TargetPosition.BEFORE) || (action.text === TargetPosition.AFTER)) {
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
      return !(object as ItemProxy).internal && ((object as ItemProxy).item.kind !== 'Repository');
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
        this.rowFocused(object);
        this.itemRepository.deleteItem((object as ItemProxy), (result === 'Yes'));
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
          defaultName: (object as ItemProxy).item.name + '_' + new Date().toISOString(),
          allowDescendantInclusionSpecification: true,
          allowLinkSpecification: true,
          getReportContent: (initialContent: string, reportSpecifications: ReportSpecifications) => {
            let processItemProxy: (itemProxy: ItemProxy) => void = (itemProxy: ItemProxy) => {
              initialContent += this.itemRepository.getMarkdownRepresentation(
                itemProxy.item, undefined, itemProxy.model.item, itemProxy.model.view.item, FormatDefinitionType.DOCUMENT,
                itemProxy.getDepthFromAncestor(object as ItemProxy), reportSpecifications.addLinks);
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
      this.navigationService.navigate('Analysis',
        { id: (object as ItemProxy).item.id });
    });
    this.rootMenuActions.unshift(analyzeAction);
    this.menuActions.unshift(analyzeAction);

    let importAction: Action = new Action('Import...', 'Import one or more ' +
      'files as children of this Item', 'fa fa-file-o', (object: any) => {
      return !(object as ItemProxy).internal || (object === this.absoluteRoot);
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
      return !(object as ItemProxy).internal || (object === this.absoluteRoot);
    }, (object: any) => {
      this._dialogService.openComponentDialog(CreateWizardComponent, {
        data: {
          parentId: (object as ItemProxy).item.id
        }
      }).updateSize('90%', '90%');
    });
    this.rootMenuActions.unshift(addChildAction);
    this.menuActions.unshift(addChildAction);

    // TODO: Reimplement when "User can stage tree" task is completed

    // let stagedVersionComparisonAction: Action = new Action('Compare ' +
    //   'Against Staged Version', 'Compare this Item against the staged ' +
    //   'version of this Item', 'fa fa-exchange', (object: any) => {
    //   return ((object as ItemProxy).vcStatus.isStaged());
    //   }, (object: any) => {
    //   this.openComparisonDialog((object as ItemProxy), VersionDesignator.STAGED_VERSION);
    // });
    // this.rootMenuActions.push(stagedVersionComparisonAction);
    // this.menuActions.push(stagedVersionComparisonAction);

    let lastCommittedVersionComparisonAction: Action = new Action(
      'Compare Against Last Committed Version', 'Compares this Item against ' +
      'the last committed version of this Item', 'fa fa-exchange', (object:
      any) => {
      return (!(object as ItemProxy).vcStatus.isNew());
      }, (object: any) => {
      this.openComparisonDialog((object as ItemProxy), VersionDesignator.LAST_COMMITTED_VERSION);
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

    this.paramSubscription = this._route.params.subscribe(params => {
      if (params['id']) {
       this.documentRootId = params['id'];
      }
    });

  this.treeConfigSubscription = this.itemRepository.getTreeConfig()
    .subscribe((treeConfigurationObject: any) => {
    this.treeConfig = treeConfigurationObject;
    if (this.treeConfig) {
      this.documentRoot = this.treeConfig.config.getProxyFor(this.documentRootId);
      this.absoluteRoot = this.documentRoot;
      this.documentRoot.visitTree({ includeOrigin: true }, (proxy:ItemProxy) => {
        this.buildRow(proxy);
      });

      if (this.changeSubjectSubscription) {
        this.changeSubjectSubscription.unsubscribe();
      }
      this.changeSubjectSubscription = treeConfigurationObject.config.
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
              this.documentRoot.visitTree({ includeOrigin: true }, (proxy:
                ItemProxy) => {
                this.buildRow(proxy);
              });
              this.refresh();
              this.showFocus();
            }
            break;
        }
      });

      this.rootSubject.next(this.documentRoot);
      this.rootSelected.emit(this.documentRoot);

      this.initialize();

      this.showFocus();
      setTimeout(()=>{
      }, 500)
    }
  });

  this.selectedProxyStreamSubscription = this.selectedProxyStream.subscribe((newSelection) => {
    if(this.sync && newSelection) {
      this.focusedObjectSubject.next(newSelection);
      this.showFocus();
    }
  })
}

  ngOnDestroy () {
    this.prepareForDismantling();
    if (this.treeConfigSubscription) {
      this.treeConfigSubscription.unsubscribe();
    }
    this.changeSubjectSubscription.unsubscribe();
  }


  toggleDocumentSync(): void {
    this.sync = !this.sync;
    if (this.sync) {
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
    let children: Array<ItemProxy> = [];
    let proxy: ItemProxy = (object as ItemProxy);
    for (let j: number = 0; j < proxy.children.length; j++) {
      children.push(proxy.children[j]);
    }

    return children;
  }

  protected postTreeTraversalActivity(): void {
    this.changeRef.markForCheck();
  }

  protected rowFocused(row: TreeRow): void {
    this.onSelect.emit(row.object);
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

  protected async target(target: any, targetingObject: any, targetPosition: TargetPosition): Promise<void> {
    let targetProxy: ItemProxy = (target as ItemProxy);
    let parentProxy: ItemProxy = targetProxy.parentProxy;
    let targetingProxy: ItemProxy = (targetingObject as ItemProxy);
    let targetProxyRepo = targetProxy.getRepositoryProxy();
    let targetingProxyRepo = targetingProxy.getRepositoryProxy();
    let moveItem = true;

    // Determine if user wants to move the selected item to a different repository.
    if (targetingProxyRepo !== targetProxyRepo) {

      // Selects the correct name when a user chooses BEFORE/AFTER/CHILD on Move
      if (targetPosition === TargetPosition.BEFORE || targetPosition === TargetPosition.AFTER) {
        targetProxyRepo = parentProxy.getRepositoryProxy();
      }

      // The targetingName is the name of the item being moved
      // The targetName is the repository name selected in which to move targetingName.
      let targetRepoName = targetProxyRepo.item.name;
      let targetingName = targetingProxy.item.name;
      let targetingRepoName = targetingProxyRepo.item.name;

      // Truncate, trim, and add ellipses if any names are too long.
      if (targetingName.length >= 40) {
        targetingName = targetingName.slice(0, 40).trim() + '...';
      }
      if (targetingRepoName.length >= 40) {
        targetingRepoName = targetingRepoName.slice(0, 40).trim() + '...';
      }
      if (targetRepoName.length >= 40) {
        targetRepoName = targetRepoName.slice(0, 40).trim() + '...';
      }

      moveItem = await this._dialogService.openSimpleDialog(
        'Moving ' + targetingName,
        'Do you want to move ' + (targetingProxy.getDescendantCountInSameRepo() + 1) + ' item(s) from the ' + targetingRepoName +
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
          this.itemRepository.upsertItem(targetingProxy.kind, targetingProxy.
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
        this.itemRepository.upsertItem(parentProxy.kind, parentProxy.item);
      } else {
        targetingProxy.item.parentId = targetProxy.item.id;
        targetingProxy.updateItem(targetingProxy.kind, targetingProxy.item);
        this.itemRepository.upsertItem(targetingProxy.kind, targetingProxy.item);
      }
    }

  }

  protected mayMove(object: any): boolean {
    return super.mayMove(object) && !(object as ItemProxy).internal;
  }

  public openFilterDialog(filter: Filter): Observable<any> {
    if (!filter) {
      filter = new ItemProxyFilter(this._dynamicTypesService, this.
        itemRepository);
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
            itemRepository);
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

  public setRowAsRoot(proxy: ItemProxy) {
    this.rootSubject.next(proxy);
    this.rootSelected.emit(proxy);
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

/*

*/
