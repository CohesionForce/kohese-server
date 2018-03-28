import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
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
  public selectedViewStream: BehaviorSubject<string>;
  @Input()
  public selectedProxyIdStream: BehaviorSubject<string>;
  public koheseType: any;
  
  private _updateDisplaySubscription: Subscription;
  
  public constructor(private _navigationService: NavigationService,
    private dialogService: DialogService,
    private typeService: DynamicTypesService,
    private itemRepository: ItemRepository,
    private versionControlService: VersionControlService,
    private _changeDetector: ChangeDetectorRef) {
    super(_navigationService);
  }

  public ngOnInit(): void {
    this.koheseType = this.typeService.getKoheseTypes()[this._treeRow.
      itemProxy.kind];
    if (!this.koheseType) {
      this.koheseType = {
        name: this._treeRow.itemProxy.kind,
        icon: 'fa fa-sticky-note'
      };
    }
    
    this._updateDisplaySubscription = this._treeRow.updateDisplay.subscribe(
      (updateDisplay: boolean) => {
      if (updateDisplay) {
        this._changeDetector.markForCheck();
      }
    });
  }
  
  public ngOnDestroy(): void {
    this._updateDisplaySubscription.unsubscribe();
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
        this.versionControlService.revertItems([this._treeRow.itemProxy]);
      }
    });
  }
  
  public getIndentationStyle(): object {
    let indentationAmount: number = 0;
    let parentProxy: ItemProxy = this._treeRow.itemProxy.parentProxy;
    while (parentProxy && (parentProxy !== this._treeRootStream.getValue())) {
      indentationAmount += 15;
      parentProxy = parentProxy.parentProxy;
    }
    
    return {
      'padding-left': indentationAmount + 'px'
    };
  }
  
  public openComparisonDialog(): void {
    this.dialogService.openComponentDialog(CompareItemsComponent, {
      baseProxy: this._treeRow.itemProxy,
      editable: true
    }).updateSize('70%', '70%');
  }
}
