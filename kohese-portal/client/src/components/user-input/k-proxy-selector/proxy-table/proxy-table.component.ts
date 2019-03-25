import { DetailsDialogComponent } from './../../../details/details-dialog/details-dialog.component';
import { DialogService } from './../../../../services/dialog/dialog.service';
import { ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';
import { ItemRepository } from './../../../../services/item-repository/item-repository.service';
import { ItemProxy } from './../../../../../../common/src/item-proxy';
import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TreeConfiguration } from './../../../../../../common/src/tree-configuration';

export enum MoveDirection {
  UP, DOWN
}

export interface MoveEvent {
  moveDirection: MoveDirection;
  candidates: Array<string>;
}

export interface RemoveEvent {
  candidates: Array<string>;
}

@Component({
  selector: 'proxy-table',
  templateUrl: './proxy-table.component.html',
  styleUrls: ['./proxy-table.component.scss'],
  animations : [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ProxyTableComponent implements OnInit {
    private _columns: Array<string> = ['checkbox'];
    get columns() {
      return this._columns;
    }
    @Input('columns')
    set columns(columns: Array<string>) {
      this._columns.push(...columns);
    }
    @Input()
    dataStream: Observable<any>;
    @Input()
    expandedFormat: any;
    expandedEdit = false;
    private _disabled: boolean = false;
    get disabled() {
      return this._disabled;
    }
    @Input('disabled')
    set disabled(disabled: boolean) {
      this._disabled = disabled;
      this._intermediateSelectedIds.fill(undefined);
      this._selectedIds.length = 0;
      this.changeRef.markForCheck();
    }

    dataSource: Array<ItemProxy>;
    
    private _intermediateSelectedIds: Array<string> = [];
    private _selectedIds: Array<string> = [];
    get selectedIds() {
      return this._selectedIds;
    }
    @Output('move')
    private _moveEventEmitter: EventEmitter<MoveEvent> =
      new EventEmitter<MoveEvent>();
    @Output('remove')
    private _removeEventEmitter: EventEmitter<RemoveEvent> =
      new EventEmitter<RemoveEvent>();

    expandedItem: ItemProxy;
    treeConfigSub: Subscription;
    treeConfig: TreeConfiguration;
    
    get MoveDirection() {
      return MoveDirection;
    }
    
    public static readonly CHECKBOX_COLUMN_WIDTH: number = 40;
    
    constructor(private itemRepository: ItemRepository,
                private changeRef: ChangeDetectorRef,
                private dialogService: DialogService) {

    }

    ngOnInit() {
      this.treeConfigSub = this.itemRepository.getTreeConfig()
        .subscribe((newConfig) => {
        if (newConfig) {
          this.treeConfig = newConfig.config;
          this.dataStream.subscribe((data) => {
            this.dataSource = [];
            for (const idx in data) {
              if (idx) {
                const proxy = newConfig.config.getProxyFor(data[idx].id);
                if (proxy) {
                  this.dataSource.push(proxy);
                }
              }
            }
            this._intermediateSelectedIds.length = this.dataSource.length;
            this._intermediateSelectedIds.fill(undefined);
            this.changeRef.markForCheck();
            console.log(this);
          });
        }
    });
  }

    toggleExpand(item) {
      console.log(item);
      if (this.expandedItem !== item) {
        this.expandedItem = item;
      } else {
        this.expandedItem = undefined;
      }
    }

    ////////////

    stateChanged(a, b, c) {
      console.log(a, b, c);
    }
    ////
    upsertItem(proxy: ItemProxy) {
      this.itemRepository.upsertItem(proxy).then((savedProxy) => {
        if (savedProxy) {
          this.expandedEdit = false;
        }
      });
    }

    openProxyDetails(proxy: ItemProxy) {
        this.dialogService.openComponentDialog(DetailsDialogComponent, {
          data : {
            itemProxy : proxy
          }
          }).updateSize('80%', '80%')
          .afterClosed().subscribe((results) => {
          // Probably need to do something here to spin off an update
          });
    }
  
  public checkStateChanged(checked: boolean, itemProxy: ItemProxy): void {
    if (checked) {
      this._intermediateSelectedIds.splice(this.dataSource.indexOf(itemProxy),
        1, itemProxy.item.id);
    } else {
      this._intermediateSelectedIds.splice(this.dataSource.indexOf(itemProxy),
        1, undefined);
    }
    
    this._selectedIds.length = 0;
    for (let j: number = 0; j < this._intermediateSelectedIds.length; j++) {
      if (this._intermediateSelectedIds[j]) {
        this._selectedIds.push(this._intermediateSelectedIds[j]);
      }
    }
  }
  
  public canMoveSelectionUp(): boolean {
    let ids: Array<string> = this.dataSource.map((itemProxy: ItemProxy) => {
      return itemProxy.item.id;
    });
    for (let j: number = 0; j < this._selectedIds.length; j++) {
      if (ids.indexOf(this._selectedIds[j]) === 0) {
        return false;
      }
    }
    
    return true;
  }
  
  public canMoveSelectionDown(): boolean {
    let ids: Array<string> = this.dataSource.map((itemProxy: ItemProxy) => {
      return itemProxy.item.id;
    });
    for (let j: number = 0; j < this._selectedIds.length; j++) {
      if (ids.indexOf(this._selectedIds[j]) === (ids.length - 1)) {
        return false;
      }
    }
    
    return true;
  }
  
  public moveSelection(moveDirection: MoveDirection): void {
    this._moveEventEmitter.emit({ moveDirection: moveDirection,
      candidates: this._selectedIds });
    this.changeRef.markForCheck();
  }
  
  public removeSelection(): void {
    this._removeEventEmitter.emit({ candidates: this._selectedIds });
    this._selectedIds.length = 0;
    this.changeRef.markForCheck();
  }
  
  public getCheckboxColumnWidth(): object {
    return {
      'min-width': ProxyTableComponent.CHECKBOX_COLUMN_WIDTH + 'px'
    };
  }
  
  public getColumnWidthStyle(tableDivWidth: number): object {
    let columnWidthStyle: any = {
      'min-width': '100px'
    };
    // Subtract one to account for the checkbox column
    let equalWidth: number = ((tableDivWidth - ProxyTableComponent.
      CHECKBOX_COLUMN_WIDTH) / (this._columns.length - 1));
    if (equalWidth > 100) {
      columnWidthStyle['min-width'] = equalWidth + 'px';
    }
    
    return columnWidthStyle;
  }
  
  public getRowWidthStyle(tableDivWidth: number): object {
    return {
      'min-width': (((this._columns.length - 1) * this.getColumnWidthStyle(
        tableDivWidth)['min-width']) + ProxyTableComponent.
        CHECKBOX_COLUMN_WIDTH) + 'px'
    };
  }
}
