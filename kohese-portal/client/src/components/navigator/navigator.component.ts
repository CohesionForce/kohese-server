import {
  Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChildren, QueryList
} from '@angular/core';

import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { SessionService } from '../../services/user/session.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Tree } from '../tree/tree.class';
import { TreeRow } from '../tree/tree-row.class';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { ProxyFilter } from '../../classes/ProxyFilter.class';

@Component({
  selector: 'navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigatorComponent implements OnInit, AfterViewInit, OnDestroy {
  /* Data */
  @ViewChildren('defaultTree')
  private _defaultTreeQueryList: QueryList<Tree>;
  @ViewChildren('referenceTree')
  private _referenceTreeQueryList: QueryList<Tree>;
  
  public proxyFilter: ProxyFilter = new ProxyFilter();
  private _filterDelayIdentifier: any;
  private _viewMap: any = {
    'Default': '',
    'References': '',
    'Version Control': ''
  };
  get viewMap() {
    return this._viewMap;
  }
  
  public selectedViewStream: BehaviorSubject<string> =
    new BehaviorSubject<string>('Default');
  private _koheseTypes: object = {};
  get koheseTypes() {
    return this._koheseTypes;
  }
  
  public readonly actionStates: Array<string> = ['Pending Review',
    'In Verification', 'Assigned'];
  public userList: Array<ItemProxy>; // This will eventually be of type KoheseUser
  public readonly NO_KIND_SPECIFIED: string = '---';

  /* Subscriptions */
  private currentTreeConfigSubscription: Subscription;

  public constructor(private typeService: DynamicTypesService,
    private ItemRepository: ItemRepository,
    private SessionService: SessionService,
    private _changeDetector: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this.currentTreeConfigSubscription = this.ItemRepository.getTreeConfig().
      subscribe((newConfig: any) => {
      if (newConfig) {
        this._koheseTypes = this.typeService.getKoheseTypes();
        this.userList = this.SessionService.getUsers();
      }
    });
  }
  
  public ngAfterViewInit(): void {
    let defaultTree: Tree = this._defaultTreeQueryList.toArray()[0];
    this.processTree(defaultTree);
    this._viewMap['Default'] = defaultTree;
    this._viewMap['Version Control'] = this._viewMap['Default'];
    
    // Unsubscribe?
    this._defaultTreeQueryList.changes.subscribe((queryList: QueryList<Tree>) => {
      defaultTree = queryList.toArray()[0];
      if (defaultTree) {
        this.processTree(defaultTree);
        this._viewMap['Default'] = defaultTree;
        this._viewMap['Version Control'] = this._viewMap['Default'];
      }
    });
    
    // Unsubscribe?
    this._referenceTreeQueryList.changes.subscribe((queryList: QueryList<Tree>) => {
      let referenceTree: Tree = queryList.toArray()[0];
      if (referenceTree) {
        this.processTree(referenceTree);
        this._viewMap['References'] = referenceTree;
      }
    });
  }
  
  public ngOnDestroy(): void {
    this.currentTreeConfigSubscription.unsubscribe();
  }
  
  public viewSelectionChanged(viewSelected: string): void {
    switch (viewSelected) {
      case 'Version Control':
        this.proxyFilter.status = true;
        this.proxyFilter.dirty = false;
        break;
      default:
        this.proxyFilter.status = false;
        this.proxyFilter.dirty = false;
    }

    this.selectedViewStream.next(viewSelected);
    this._changeDetector.detectChanges();
    this._viewMap[viewSelected].showRows();
  }
  
  private processTree(tree: Tree): void {
    tree.preRowProcessingActivity = (row: TreeRow) => {
      let show: boolean = true;
      row.matchesFilter = this.doesRowMatchFilter(row, tree, this.
        proxyFilter, false);
      show = row.matchesFilter;
      if (!show) {
        let rowChildrenProxies: Array<ItemProxy> = row.
          getRowChildrenProxies();
        for (let j: number = 0; j < rowChildrenProxies.length; j++) {
          if (this.doesRowMatchFilter(tree.getRow(rowChildrenProxies[j].
            item.id), tree, this.proxyFilter, true)) {
            show = true;
            break;
          }
        }
      }
    
      if (show !== row.visible) {
        row.visible = show;
      }
    };
  }
  
  private doesRowMatchFilter(row: TreeRow, tree: Tree, filter: ProxyFilter,
    checkChildren: boolean): boolean {
    let matches: boolean = true;
    if (filter.status && (Object.keys(row.itemProxy.status).length === 0)) {
      matches = false;
    } else if (filter.dirty && !row.itemProxy.dirty) {
      matches =  false;
    } else if (filter.kind) {
      if (row.itemProxy.kind !== filter.kind.dataModelProxy.item.name) {
        matches = false;
      } else if (row.itemProxy.kind === 'Action') {
        if (filter.actionState && (row.itemProxy.item.actionState !==
          filter.actionState)) {
          matches = false;
        } else if (filter.actionAssignee && (row.itemProxy.item.assignedTo !==
          filter.actionAssignee)) {
          matches = false;
        }
      }
    }
    
    if (matches) {
      matches = false;
      let filterExpression: RegExp;
      let filterIsRegex: Array<string> = filter.filterString.
        match(new RegExp('^\/(.*)\/([gimy]*)$'));
      if (filterIsRegex) {
        filterExpression = new RegExp(filterIsRegex[1], filterIsRegex[2]);
        filter.textRegexHighlight = new RegExp('(' + filterIsRegex[1]
          + ')', 'g' + filterIsRegex[2]);
      } else {
        let cleanedPhrase: string = filter.filterString.
          replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filterExpression = new RegExp(filter.filterString, 'i');
        filter.textRegexHighlight = new RegExp('(' + cleanedPhrase
          + ')', 'gi');
      }
      
      for (let key in row.itemProxy.item) {
        if (key.charAt(0) !== '$' &&
          (typeof row.itemProxy.item[key] === 'string') &&
          row.itemProxy.item[key].match(filterExpression)) {
          matches = true;
          break;
        }
      }
    }
    
    if (!matches && checkChildren) {
      let rowChildrenProxies: Array<ItemProxy> = row.getRowChildrenProxies();
      for (let j: number = 0; j < rowChildrenProxies.length; j++) {
        if (this.doesRowMatchFilter(tree.getRow(rowChildrenProxies[j].
          item.id), tree, filter, true)) {
          matches = true;
          break;
        }
      }
    }
    
    return matches;
  }

  public whenFilterStringChanges(): void {
    if (this._filterDelayIdentifier) {
      clearTimeout(this._filterDelayIdentifier);
    }

    this._filterDelayIdentifier = setTimeout(() => {
      this._viewMap[this.selectedViewStream.getValue()].showRows();
      this._filterDelayIdentifier = undefined;
    }, 1000);
  }
}
