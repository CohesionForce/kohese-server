import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { NavigatableComponent } from '../../classes/NavigationComponent.class'
import { NavigationService } from '../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../common/src/item-proxy.js'
import { Observable, Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector : 'action-table',
  templateUrl : './action-table.component.html',
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class ActionTableComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy{
  @Input()
  proxyStream : Observable<Array<ItemProxy>>
  actionProxies :  Array<ItemProxy>;
  tableStream : MatTableDataSource<ItemProxy>;
  itemProxy : ItemProxy;
  rowDef : Array<string>;

  /* Subscriptions */
  proxyStreamSub : Subscription;

  constructor(protected NavigationService : NavigationService,
              private changeRef :  ChangeDetectorRef) {
    super(NavigationService);
  }

  ngOnInit() {
    this.proxyStreamSub = this.proxyStream.subscribe((newProxy : ItemProxy) => {
      this.itemProxy = newProxy;
      this.tableStream = new MatTableDataSource(this.itemProxy.getSubtreeAsList());
      this.changeRef.markForCheck();
    })

    this.rowDef = ['name', 'taskState', 'actionState', 'assignedTo']
  }

  ngOnDestroy () {
  }

  getRowIndent (row) {
    return {
      'padding-left' : row.depth * 10 + 'px'
    }
  }
}
