import { Component, OnInit, OnDestroy, ViewChildren, Input, Output,
  EventEmitter, ChangeDetectionStrategy,
  ChangeDetectorRef, QueryList } from '@angular/core';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { VersionControlService } from '../../services/version-control/version-control.service';
import { RowComponent } from '../../classes/RowComponent.class';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { ProxyFilter } from '../../classes/ProxyFilter.class';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'tree-row',
  templateUrl: './tree-row.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeRowComponent extends RowComponent
  implements OnInit, OnDestroy {
  @Input()
  public selectedViewStream: Observable<string>;
  @Input()
  public selectedProxyIdStream: Observable<string>;
  @Input()
  public filterStream: Observable<ProxyFilter>;
  public koheseType: any;
  private _matchesFilter: boolean = false;
  get matchesFilter() {
    return this._matchesFilter;
  }
  private _expanded: boolean = false;
  get expanded() {
    return this._expanded;
  }
  @ViewChildren('rows')
  public childrenRows: QueryList<TreeRowComponent>;
  
  @Output()
  public rootChanged: EventEmitter<ItemProxy> = new EventEmitter<ItemProxy>();
  @Output()
  public visibilityChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  private _filterStreamSubscription: Subscription;
  
  constructor(NavigationService : NavigationService,
    private dialogService: DialogService,
    private typeService: DynamicTypesService,
    private itemRepository: ItemRepository,
    private versionControlService: VersionControlService,
    private _changeDetector: ChangeDetectorRef) {
    super(NavigationService);
  }

  public ngOnInit(): void {
    this.koheseType = this.typeService.getKoheseTypes()[this.itemProxy.kind];
    if (!this.koheseType) {
      this.koheseType = {
        name: this.itemProxy.kind,
        icon: 'fa fa-sticky-note'
      };
    }
    
    this._filterStreamSubscription = this.filterStream.subscribe((proxyFilter: ProxyFilter) => {
      this.filter(proxyFilter);
    });
    
    this.visibilityChanged.emit(this.isVisible());
  }
  
  public ngOnDestroy(): void {
    this._filterStreamSubscription.unsubscribe();
  }

  public removeItem(): void {
    this.dialogService.openCustomTextDialog('Confirm Deletion',
      'Are you sure you want to delete ' + this.itemProxy.item.name + '?',
      ['Cancel', 'Delete', 'Delete Recursively']).
      subscribe((result: any) => {
      if (result) {
        this.itemRepository.deleteItem(this.itemProxy, (2 === result));
      }
    });
  }
  
  public revertChanges(): void {
    this.dialogService.openYesNoDialog('Undo Changes', 'Are you sure that you '
      + 'want to undo all changes to this item since the previous commit?').
      subscribe((result: any) => {
      if (result) {
        this.versionControlService.revertItems([this.itemProxy]);
      }
    });
  }
  
  private filter(proxyFilter: ProxyFilter): void {
    let show: boolean = true;
    if (proxyFilter.filterString || proxyFilter.kind || proxyFilter.status ||
      proxyFilter.dirty || proxyFilter.status) {
      let proxy: ItemProxy = this.getProxy();
      this._matchesFilter = this.doesProxyMatchFilter(proxy, proxyFilter, false);
      show = this._matchesFilter;
      if (!show) {
        for (let j: number = 0; j < proxy.children.length; j++) {
          if (this.doesProxyMatchFilter(proxy.children[j], proxyFilter, true)) {
            show = true;
            break;
          }
        }
      }
    } else {
      this._matchesFilter = false;
      proxyFilter.textRegexHighlight = null;
    }
    
    /* Expand tree-rows that have version control system changes to one or more
    children */
    if (proxyFilter.status && show) {
      this.expand(true, false);
    }
    
    if (show !== this.isVisible()) {
      this.setVisible(show);
      this.visibilityChanged.emit(show);
      this._changeDetector.markForCheck();
    }
  }
  
  private doesProxyMatchFilter(proxy: ItemProxy, proxyFilter: ProxyFilter, checkChildren: boolean): boolean {
    let matches: boolean = true;
    if (proxyFilter.status && (!proxy.status ||
      (proxy.status.length === 0))) {
      matches = false;
    } else if (proxyFilter.dirty && !proxy.dirty) {
      matches =  false;
    } else if (proxyFilter.kind) {
      if (proxy.kind !== proxyFilter.kind.name) {
        matches = false;
      } else if (proxy.kind === 'Action') {
        if (proxyFilter.actionState && (proxy.item.actionState !==
          proxyFilter.actionState)) {
          matches = false;
        } else if (proxyFilter.actionAssignee && (proxy.item.assignedTo !==
          proxyFilter.actionAssignee)) {
          matches = false;
        }
      }
    }
    
    if (matches) {
      matches = false;
      let filterExpression: RegExp;
      let filterIsRegex: Array<string> = proxyFilter.filterString.
        match(new RegExp('^\/(.*)\/([gimy]*)$'));
      if (filterIsRegex) {
        filterExpression = new RegExp(filterIsRegex[1], filterIsRegex[2]);
        proxyFilter.textRegexHighlight = new RegExp('(' + filterIsRegex[1]
          + ')', 'g' + filterIsRegex[2]);
      } else {
        let cleanedPhrase: string = proxyFilter.filterString.
          replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filterExpression = new RegExp(proxyFilter.filterString, 'i');
        proxyFilter.textRegexHighlight = new RegExp('(' + cleanedPhrase
          + ')', 'gi');
      }
       
      for (let key in proxy.item) {
        if (key.charAt(0) !== '$' &&
          (typeof proxy.item[key] === 'string') &&
          proxy.item[key].match(filterExpression)) {
          matches = true;
          break;
        }
      }
    }
    
    if (!matches && checkChildren) {
      for (let j: number = 0; j < proxy.children.length; j++) {
        if (this.doesProxyMatchFilter(proxy.children[j], proxyFilter, true)) {
          matches = true;
          break;
        }
      }
    }
    
    return matches;
  }
  
  public expand(expand: boolean, recurse: boolean): void {
    this._expanded = expand;
    this._changeDetector.markForCheck();
    if (recurse) {
      for (let row of this.childrenRows.toArray()) {
        row.expand(expand, true);
      }
    }
  }
}