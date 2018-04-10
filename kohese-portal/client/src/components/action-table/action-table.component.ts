import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { NavigatableComponent } from '../../classes/NavigationComponent.class'
import { NavigationService } from '../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../common/src/item-proxy.js'
import { Observable, Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

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
  @Input() 
  editableStream : Observable<boolean>
  editableStreamSubscription : Subscription
  editable : boolean;

  baseRowDef : Array<string> = ['name', 'state', 'assignedTo', 'estimatedHoursEffort', 'remainingHoursEffort', 'actualHoursEffort'];
  actionRowDef : Array<string> = ['name', 'state', 'assignedTo', 'estimatedHoursEffort', 'remainingHoursEffort', 'actualHoursEffort', 'actions'];

  /* Subscriptions */
  proxyStreamSub : Subscription;

  constructor(protected NavigationService : NavigationService,
              private itemRepository : ItemRepository,
              private changeRef :  ChangeDetectorRef) {
    super(NavigationService);
  }

  ngOnInit() {
    this.rowDef = this.baseRowDef;

    this.proxyStreamSub = this.proxyStream.subscribe((newProxy : ItemProxy) => {
      this.itemProxy = newProxy;
      this.tableStream = new MatTableDataSource(this.itemProxy.getSubtreeAsList());
      this.changeRef.markForCheck();
    })

    if (this.editableStream) {
      this.editableStreamSubscription = this.editableStream.subscribe((editable)=>{
        this.editable = editable;
        if (this.editable) {
          this.rowDef = this.actionRowDef;          
        } else {
          this.rowDef = this.baseRowDef;
        }
        this.changeRef.markForCheck();
      })
    }    
  }

  ngOnDestroy () {
    this.proxyStreamSub.unsubscribe();
    if (this.editableStreamSubscription) {
      this.editableStreamSubscription.unsubscribe();
    }
  }

  getRowIndent (row) {
    return {
      'padding-left' : row.depth * 10 + 'px'
    }
  }

  saveRow(savedAction : ItemProxy) {
    console.log('Save row');
    this.itemRepository.upsertItem(savedAction)
      .then((updatedItemProxy: ItemProxy) => {
        console.log((updatedItemProxy));
      });
  }
}
