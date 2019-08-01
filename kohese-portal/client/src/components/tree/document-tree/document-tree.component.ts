
import {tap} from 'rxjs/operators';
import { EventEmitter, Output, Input } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { Observable ,  Subscription } from 'rxjs';
import { TreeRow } from '../tree-row/tree-row.class';
import { DisplayableEntity, Action,
  ActionGroup } from '../tree-row/tree-row.component';
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

  images = [];

  @Output()
  rootSelected : EventEmitter<ItemProxy> = new EventEmitter<ItemProxy>();
  @Output()
  onSelect : EventEmitter<ItemProxy> = new EventEmitter<ItemProxy>();
  @Input()
  selectedProxyStream : Observable<ItemProxy>;
  selectedProxyStreamSubscription : Subscription;

  constructor(router: ActivatedRoute, dialogService : DialogService,
    private _dynamicTypesService: DynamicTypesService,
    private itemRepository : ItemRepository,
    private changeRef : ChangeDetectorRef) {
    super(router, dialogService);
    this.canMoveRows = true;
  }

  ngOnInit() {
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
    item['kind'] = proxy.kind; // TODO: Need to remove update of item
    item['status'] = proxy.vcStatus.statusArray; // TODO: Need to remove update of item
    return super.filter(item);
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
}

/*

*/
