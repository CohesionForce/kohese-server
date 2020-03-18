import { DetailsComponent } from './../../../details/details.component';
import { DialogService } from './../../../../services/dialog/dialog.service';
import { ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';
import { ItemRepository } from './../../../../services/item-repository/item-repository.service';
import { ItemProxy } from './../../../../../../common/src/item-proxy';
import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TreeConfiguration } from './../../../../../../common/src/tree-configuration';

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
    private static readonly _CHECKBOX_COLUMN_ID: string = 'checkbox';
    private _columns: Array<string> = [ProxyTableComponent.
      _CHECKBOX_COLUMN_ID];
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
    @Input('disabled')
    set disabled(disabled: boolean) {
      this._disabled = disabled;
      this._selection.length = 0;
      if (this._disabled) {
        this._columns.splice(0, 1);
      } else {
        this._columns.splice(0, 0, ProxyTableComponent._CHECKBOX_COLUMN_ID);
      }
      this.changeRef.markForCheck();
    }

    dataSource: Array<ItemProxy>;
    
    private _selection: Array<any> = [];
    get selection() {
      return this._selection;
    }

    expandedItem: ItemProxy;
    treeConfigSub: Subscription;
    treeConfig: TreeConfiguration;
    
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
      this.itemRepository.upsertItem(proxy.kind, proxy.item).then((savedProxy:
        ItemProxy) => {
        if (savedProxy) {
          this.expandedEdit = false;
        }
      });
    }

    openProxyDetails(proxy: ItemProxy) {
        this.dialogService.openComponentDialog(DetailsComponent, {
          data : {
            itemProxy : proxy
          }
          }).updateSize('80%', '80%')
          .afterClosed().subscribe((results) => {
          // Probably need to do something here to spin off an update
          });
    }
  
  public checkStateChanged(itemProxy: ItemProxy): void {
    let elementIndex: number = this._selection.indexOf(itemProxy);
      if (elementIndex === -1) {
      this._selection.push(itemProxy);
    } else {
      this._selection.splice(elementIndex, 1);
    }
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
    let equalWidth: number = ((tableDivWidth - (this._disabled ? 0 :
      ProxyTableComponent.CHECKBOX_COLUMN_WIDTH)) / (this._columns.length -
      (this._disabled ? 0 : 1)));
    if (equalWidth > 100) {
      columnWidthStyle['min-width'] = equalWidth + 'px';
    }
    
    return columnWidthStyle;
  }
  
  public getRowWidthStyle(tableDivWidth: number): object {
    return {
      'min-width': (((this._columns.length - (this._disabled ? 0 : 1)) *
        (+this.getColumnWidthStyle(tableDivWidth)['min-width'].replace('px',
        ''))) + (this._disabled ? 0 : ProxyTableComponent.
        CHECKBOX_COLUMN_WIDTH)) + 'px'
    };
  }
}
