import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';

import { NavigationService } from '../../services/navigation/navigation.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { TreeRow } from './tree-row.class';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { CompareItemsComponent } from '../compare-items/compare-items.component';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'tree-row',
  templateUrl: './tree-row.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeRowComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  private _treeRow: TreeRow;
  get treeRow() {
    return this._treeRow;
  }
  @Input('treeRow')
  set treeRow(treeRow: TreeRow) {
    this._treeRow = treeRow;
  }
  
  private _rowActions: Array<Action> = [];
  get rowActions() {
    return this._rowActions;
  }
  @Input('rowActions')
  set rowActions(rowActions: Array<Action>) {
    this._rowActions = rowActions;
  }
  
  private _menuActions: Array<Action> = [];
  get menuActions() {
    return this._menuActions;
  }
  @Input('menuActions')
  set menuActions(menuActions: Array<Action>) {
    this._menuActions = menuActions;
  }
  
  private _treeRootStream: BehaviorSubject<ItemProxy>;
  get treeRootStream() {
    return this._treeRootStream;
  }
  @Input('treeRootStream')
  set treeRootStream(treeRootStream: BehaviorSubject<ItemProxy>) {
    this._treeRootStream = treeRootStream;
  }
  
  @Input()
  public selectedProxyIdStream: BehaviorSubject<string>;
  public koheseType: any;
  
  private _updateDisplaySubscription: Subscription;
  private _itemProxyChangeSubscription: Subscription;
  private _rootSubscription: Subscription;

  treeConfig : any;
  treeConfigSubscription : Subscription;
  
  public constructor(private _navigationService: NavigationService,
    private dialogService: DialogService,
    private typeService: DynamicTypesService,
    private itemRepository: ItemRepository,
    private _changeDetector: ChangeDetectorRef) {
    super(_navigationService);
  }

  public ngOnInit(): void {
    this.koheseType = this.typeService.getKoheseTypes()[this._treeRow.
      itemProxy.kind];
    
    this._updateDisplaySubscription = this._treeRow.updateDisplay.subscribe(
      (updateDisplay: boolean) => {
      if (updateDisplay) {
        this._changeDetector.markForCheck();
      }
    });
    
    this.treeConfigSubscription = this.itemRepository.getTreeConfig().subscribe((newConfig)=>{
      this.treeConfig = newConfig.config;
      this._itemProxyChangeSubscription = this.treeConfig.getChangeSubject()
        .subscribe((notification: any) => {
          if (notification.proxy) {
            if (this._treeRow.itemProxy.item.id === notification.proxy.item.id) {
              this._changeDetector.markForCheck();
            }
          }
      });
    });
    
    this._rootSubscription = this.treeRootStream.subscribe((root:
      ItemProxy) => {
      this._changeDetector.markForCheck();
    });
  }
  
  public ngOnDestroy(): void {
    this._rootSubscription.unsubscribe();
    this._itemProxyChangeSubscription.unsubscribe();
    this._updateDisplaySubscription.unsubscribe();
    this.treeConfigSubscription.unsubscribe();
  }

  public getIndentationStyle(): object {
    return {
      'padding-left': (this._treeRow.depth * 15) + 'px'
    };
  }
  
  public openComparisonDialog(): void {
    this.dialogService.openComponentDialog(CompareItemsComponent, {
      data : {
        baseProxy: this._treeRow.itemProxy,
        editable: true
      }
    }).updateSize('90%', '90%');
  }
}

class Action {
  public constructor(public name: string, public description: string,
    public icon: string, public perform: (row: TreeRow) => void) {
  }
}

export class RowAction extends Action {
  public constructor(name: string, description: string, icon: string,
    public show: (row: TreeRow) => boolean, perform: (row:
    TreeRow) => void) {
    super(name, description, icon, perform);
  }
}

export class MenuAction extends Action {
  public constructor(name: string, description: string, icon: string,
    public enable: (row: TreeRow) => boolean, perform: (row:
    TreeRow) => void) {
    super(name, description, icon, perform);
  }
}
