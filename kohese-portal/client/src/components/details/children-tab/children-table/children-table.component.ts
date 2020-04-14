import { Component, OnInit, OnDestroy, Input, EventEmitter, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { NavigatableComponent } from '../../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../../../common/src/item-proxy.js';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { Subscription ,  BehaviorSubject ,  Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material'

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
  childrenStream : BehaviorSubject<Array<ItemProxy>>;
  tableStream : MatTableDataSource<ItemProxy>;

  /* Subscriptions */
  filterSub : Subscription;
  childrenStreamSub : Subscription;

  /* Data */
  rowDef : Array<string>;
  children : Array<ItemProxy>;

  constructor (protected NavigationService : NavigationService,
               private changeRef : ChangeDetectorRef) {
    super(NavigationService);
  }

  ngOnInit () {
    this.childrenStreamSub =
      this.childrenStream.subscribe((newChildren : Array<ItemProxy>)=>{
      this.children = newChildren;
      this.tableStream = new MatTableDataSource<ItemProxy>(this.children)
      this.changeRef.markForCheck();
    });
    this.rowDef = ['kind','name','assignedTo','state','description', 'childrenCount']
    this.filterSub = this.filterSubject.subscribe((newFilter) => {
      this.tableStream.filter = newFilter.trim().toLowerCase();
    })
  }

  ngOnDestroy () {
    this.filterSub.unsubscribe();
    this.childrenStreamSub.unsubscribe();
  }

  public whenDropOccurs(dropTarget: ItemProxy, dropEvent: any): void {
    dropEvent.preventDefault();
    if (this._editableStream.getValue()) {
      let droppedId: string = dropEvent.dataTransfer.getData('id');
      if (droppedId) {
        let parentProxy: ItemProxy = dropTarget.parentProxy;
        if (parentProxy.childrenAreManuallyOrdered()) {
          let removeIndex: number;
          for (let j: number = 0; j < parentProxy.children.length; j++) {
            if (parentProxy.children[j].item.id === droppedId) {
              removeIndex = j;
              break;
            }
          }

          let proxyToMove: ItemProxy = parentProxy.children.
            splice(removeIndex, 1)[0];
          parentProxy.children.splice(parentProxy.children.
            indexOf(dropTarget) + 1, 0, proxyToMove);

          this.childrenStream.next(parentProxy.children);
          parentProxy.updateChildrenManualOrder();
        }
      }
    }
  }
}

