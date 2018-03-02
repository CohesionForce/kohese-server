import { Component, OnInit, OnDestroy, ViewChildren,
  QueryList } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TreeRowComponent } from './tree-row.component';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';
import { VersionControlService } from '../../services/version-control/version-control.service';
import { SessionService } from '../../services/user/session.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ItemProxy } from '../../../../common/models/item-proxy';
import { ProxyFilter } from '../../classes/ProxyFilter.class';
import { RowComponent } from '../../classes/RowComponent.class';
import { KoheseType } from '../../classes/UDT/KoheseType.class';

@Component({
  selector : 'tree-view',
  templateUrl : './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent extends NavigatableComponent
                              implements OnInit, OnDestroy {
    /* UI Toggles */
    private locationSynced: boolean = false;

    /* Data */
    private absoluteRoot : ItemProxy;
    public root: ItemProxy;
    public isRootDefault: boolean = true;
    public selectedProxyIdStream: BehaviorSubject<string> = new BehaviorSubject<string>('');
    public proxyFilter: ProxyFilter = new ProxyFilter();
    public filterStream: BehaviorSubject<ProxyFilter> = new BehaviorSubject<ProxyFilter>(this.proxyFilter);
    // TODO Probably want to get this from somewhere else
    public viewList: Array<string> = ['Default', 'Version Control'];
    public selectedViewStream: BehaviorSubject<string> = new BehaviorSubject<string>(this.viewList[0]);
    public _numberOfRowsVisible: number = 0;
    get numberOfRowsVisible() {
      return this._numberOfRowsVisible;
    }
    private koheseTypes: object;
    public actionStates: Array<string> = ['Pending Review', 'In Verification', 'Assigned'];
    public userList : Array<ItemProxy>; // This will eventually be of type KoheseUser
    private readonly NO_KIND_SPECIFIED: string = '---';
    @ViewChildren('rows')
    public childrenRows: QueryList<TreeRowComponent>;

    /* Subscriptions */
    private repoStatusSub: Subscription;
    private routeParametersSubscription: Subscription;

  constructor (protected NavigationService : NavigationService,
    private typeService: DynamicTypesService,
    private ItemRepository : ItemRepository,
    private VersionControlService : VersionControlService,
    private SessionService : SessionService,
    private route : ActivatedRoute) {
    super(NavigationService);
  }

  ngOnInit(): void {
    this.repoStatusSub = this.ItemRepository.getRepoStatusSubject()
      .subscribe(update => {
      if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
        this.root = this.ItemRepository.getRootProxy();
        this.absoluteRoot = this.root;
        this.koheseTypes = this.typeService.getKoheseTypes();
      }
    });
    
    this.routeParametersSubscription = this.route.params.
      subscribe((parameters: Params) => {
      this.selectedProxyIdStream.next(parameters['id']);
    });

    this.userList = this.SessionService.getUsers();

    // TODO set up sync listener functionality
  }
  
  ngAfterViewInit(): void {
    // TODO See if this is needed
    this.childrenRows.changes.subscribe((change: any) => {
    });
  }

  ngOnDestroy(): void {
    this.routeParametersSubscription.unsubscribe();
    this.repoStatusSub.unsubscribe();
  }

  filter(): void {
    this.filterStream.next(this.proxyFilter);
  }

  upLevel(): void {
    this.root = this.root.parentProxy;
    this.isRootDefault = (this.root === this.absoluteRoot);
  }

  resetRoot(): void {
    this.root = this.absoluteRoot;
    this.isRootDefault = true;
  }

  expandSyncedNodes(): void {
    // TODO Implement tree sync
  }

  /******** List expansion functions */
  expandAll(): void {
    for (let row of this.childrenRows.toArray()) {
      row.expand(true, true);
    }
  }

  collapseAll(): void {
    for (let row of this.childrenRows.toArray()) {
      row.expand(false, true);
    }
  }

  /*collapseChildren(itemProxy: ItemProxy): void {
    var childrenList = itemProxy.getDescendants();
    this.collapsed[itemProxy.item.id] = true;
    for (var i = 0; i < childrenList.length; i++) {
      var proxy = childrenList[i];
      this.collapsed[proxy.item.id] = true;
    }
  }*/

  /*expandChildren(itemProxy: ItemProxy): void {
    var childrenList = itemProxy.getDescendants();
    this.collapsed[itemProxy.item.id] = false;
    for (var i = 0; i < childrenList.length; i++) {
      var proxy = childrenList[i];
      this.collapsed[proxy.item.id] = false;
    }
  }*/

  /****** End list expansion functions */

  viewSelectionChanged(viewSelected: string): void {
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
    this.filterStream.next(this.proxyFilter);
  }
  
  public whenRootChanges(proxy: ItemProxy): void {
    this.root = proxy;
    this.isRootDefault = false;
  }
  
  public whenRowVisibilityChanges(visible: boolean): void {
    if (visible) {
      this._numberOfRowsVisible++;
    } else {
      this._numberOfRowsVisible--;
    }
  }
}
