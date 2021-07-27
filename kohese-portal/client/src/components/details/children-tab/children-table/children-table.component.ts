/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, BehaviorSubject } from 'rxjs';

// NPM

// Kohese
import { NavigatableComponent } from '../../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../../common/src/item-proxy.js';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { DetailsComponent } from '../../../details/details.component';

@Component({
  selector: 'children-table',
  templateUrl: './children-table.component.html',
  styleUrls: ['./children-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildrenTableComponent extends NavigatableComponent implements OnInit, OnDestroy {
  @Input()
  filterSubject: BehaviorSubject<string>;
  private _editableStream: BehaviorSubject<boolean>;
  get editableStream() {
    return this._editableStream;
  }
  @Input('editableStream')
  set editableStream(editableStream: BehaviorSubject<boolean>) {
    this._editableStream = editableStream;
  }
  @Input()
  childrenStream: BehaviorSubject<Array<ItemProxy>>;
  tableStream: MatTableDataSource<ItemProxy>;

  /* Obvervables */
  filteredItems: Array<ItemProxy>;

  /* Subscriptions */
  filterSub: Subscription;
  childrenStreamSub: Subscription;

  /* Data */
  rowDef: Array<string>;
  children: Array<ItemProxy>;

  get navigationService() {
    return this._navigationService;
  }

  constructor(
    private changeRef: ChangeDetectorRef,
    private _dialogService: DialogService,
    private _navigationService: NavigationService) {
    super(_navigationService);
  }

  ngOnInit() {
    this.childrenStreamSub =
      this.childrenStream.subscribe((newChildren: Array<ItemProxy>) => {
        this.children = newChildren;
        this.tableStream = new MatTableDataSource<ItemProxy>(this.children)
        this.changeRef.markForCheck();
      });
    this.rowDef = ['kind', 'name', 'assignedTo', 'state', 'childrenCount', "nav"]
    this.filterSub = this.filterSubject.subscribe((newFilter) => {
      this.tableStream.filter = newFilter.trim().toLowerCase();
    })
  }

  ngOnDestroy() {
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

  public displayInformation(itemProxy: ItemProxy): void {
    this._dialogService.openComponentDialog(DetailsComponent, {
      data: { itemProxy: itemProxy }
    }).updateSize('90%', '90%');
  }
}
