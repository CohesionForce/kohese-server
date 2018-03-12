import { Component, OnInit, OnDestroy, Input, EventEmitter, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { NavigatableComponent } from '../../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../../services/navigation/navigation.service';

import * as ItemProxy from '../../../../../../common/src/item-proxy.js';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { MatTableDataSource } from '@angular/material'
import { Observable } from 'rxjs/Observable';

@Component({
  selector : 'children-table',
  templateUrl : './children-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildrenTableComponent extends NavigatableComponent
                                    implements OnInit, OnDestroy {
  @Input()
  filterSubject : BehaviorSubject<string>;
  private _editableStream: BehaviorSubject<boolean>;
  get editableStream() {
    return this._editableStream;
  }
  @Input('editableStream')
  set editableStream(editableStream: BehaviorSubject<boolean>) {
    this._editableStream = editableStream;
  }

  /* Obvervables */
  filteredItems : Array<ItemProxy>;
  
  @Input()
  childrenStream : BehaviorSubject<ItemProxy>;
  tableStream : MatTableDataSource<ItemProxy>;

  /* Subscriptions */
  filterSub : Subscription;

  /* Data */
  initialized : boolean;
  rowDef : Array<string>;
  children : Array<ItemProxy>;

  constructor (protected NavigationService : NavigationService,
               private changeRef : ChangeDetectorRef) {
    super(NavigationService);
    this.initialized = false;
  }

  ngOnInit () {
    this.childrenStream.subscribe((newChildren : Array<ItemProxy>)=>{
      this.children = newChildren;
      this.tableStream = new MatTableDataSource<ItemProxy>(this.children)
      this.changeRef.markForCheck();
    });
    this.initialized = true;
    this.rowDef = ['kind','name','assignedTo','actionState','description', 'childrenCount']
    this.filterSub = this.filterSubject.subscribe((newFilter) => {
      this.tableStream.filter = newFilter.trim().toLowerCase();
    })
  }

  ngOnDestroy () {
    this.filterSub.unsubscribe();
  }
  
  public whenDropOccurs(dropTarget: ItemProxy, dropEvent: any): void {
    dropEvent.preventDefault();
    if (this._editableStream.getValue()) {
      let droppedId: string = dropEvent.dataTransfer.getData('id');
      if (droppedId) {
        let parentProxy: ItemProxy = dropTarget.parentProxy;
        let removeIndex: number;
        for (let j: number = 0; j < parentProxy.children.length; j++) {
          if (parentProxy.children[j].item.id === droppedId) {
            removeIndex = j;
            break;
          }
        }
    
        let proxyToMove: ItemProxy = parentProxy.children.
          splice(removeIndex, 1)[0];
        parentProxy.children.splice(parentProxy.children.indexOf(dropTarget) +
          1, 0, proxyToMove);
    
        this.childrenStream.next(parentProxy.children);
        parentProxy.dirty = true;
        parentProxy.updateChildrenManualOrder();
      }
    }
  }
}

