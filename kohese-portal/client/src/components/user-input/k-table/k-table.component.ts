import { BehaviorSubject } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ItemProxy } from './../../../../../common/src/item-proxy';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { TableDefinition } from '../../type-editor/TableDefinition.interface';
import { TreeConfiguration } from './../../../../../common/src/tree-configuration';
import { ProxyTableComponent } from '../k-proxy-selector/proxy-table/proxy-table.component';

@Component({
  selector: 'k-table',
  templateUrl: './k-table.component.html',
  styleUrls: ['./k-table.component.scss']
})
export class KTableComponent implements OnInit, OnDestroy {
  private _tableDefinition: TableDefinition;
  get tableDefinition() {
    return this._tableDefinition;
  }
  @Input('tableDefinition')
  set tableDefinition(tableDefinition: TableDefinition) {
    this._tableDefinition = tableDefinition;
  }
  
  private _rows: Array<any>;
  get rows() {
    return this._rows;
  }
  @Input('rows')
  set rows(rows: Array<any>) {
    this._rows = rows;
    if (this.tableDataStream) {
      this.tableDataStream.next(this._rows);
    }
  }
  
  @Input ()
  editable = false;

  treeConfig: TreeConfiguration;
  treeConfigSub: Subscription;
  
  tableDataStream: BehaviorSubject<Array<any>>;
  
  @ViewChild('proxyTable')
  private _table: ProxyTableComponent;
  
  get selection() {
    return this._table.selection;
  }

  constructor(private itemRepository: ItemRepository) { }

  ngOnInit() {
    this.treeConfigSub = this.itemRepository.getTreeConfig()
    .subscribe((newConfig) => {
      if (newConfig) {
        this.treeConfig = newConfig.config;
        this.tableDataStream = new BehaviorSubject<Array<any>>(this._rows);
      }
    });
  }

  ngOnDestroy() {
    if (this.treeConfigSub) {
      this.treeConfigSub.unsubscribe();
    }
  }
}
