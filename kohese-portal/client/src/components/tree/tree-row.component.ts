import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { NavigationService } from '../../services/navigation/navigation.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { VersionControlService } from '../../services/version-control/version-control.service';
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

  treeConfig : any;
  treeConfigSubscription : Subscription;
  
  public constructor(private _navigationService: NavigationService,
    private dialogService: DialogService,
    private typeService: DynamicTypesService,
    private itemRepository: ItemRepository,
    private versionControlService: VersionControlService,
    private _changeDetector: ChangeDetectorRef,
    private _toastrService: ToastrService) {
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
    })
  }
  
  public ngOnDestroy(): void {
    this._itemProxyChangeSubscription.unsubscribe();
    this._updateDisplaySubscription.unsubscribe();
    this.treeConfigSubscription.unsubscribe();
  }

  public removeItem(): void {
    this.dialogService.openCustomTextDialog('Confirm Deletion',
      'Are you sure you want to delete ' + this._treeRow.itemProxy.item.name +
      '?', ['Cancel', 'Delete', 'Delete Recursively']).
      subscribe((result: any) => {
      if (result) {
        this.itemRepository.deleteItem(this._treeRow.itemProxy,
          (2 === result));
      }
    });
  }
  
  public revertChanges(): void {
    this.dialogService.openYesNoDialog('Undo Changes', 'Are you sure that you '
      + 'want to undo all changes to this item since the previous commit?').
      subscribe((result: any) => {
      if (result) {
        this.versionControlService.revertItems([this._treeRow.itemProxy]).
          subscribe((statusMap: any) => {
          if (statusMap.error) {
            this._toastrService.error('Revert Failed', 'Version Control');
          } else {
            this._toastrService.success('Revert Succeeded', 'Version Control');
          }
        });
      }
    });
  }
  
  public stageChanges(): void {
    this.versionControlService.stageItems([this._treeRow.itemProxy]).subscribe(
      (statusMap: any) => {
      if (statusMap.error) {
        this._toastrService.error('Stage Failed', 'Version Control');
      } else {
        this._toastrService.success('Stage Succeeded', 'Version Control');
      }
    });
  }
  
  public unstageChanges(): void {
    this.versionControlService.unstageItems([this._treeRow.itemProxy]).
      subscribe((statusMap: any) => {
      if (statusMap.error) {
        this._toastrService.error('Unstage Failed', 'Version Control');
      } else {
        this._toastrService.success('Unstage Succeeded', 'Version Control');
      }
    });
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
