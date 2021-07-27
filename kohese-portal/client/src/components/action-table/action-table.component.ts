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
import { Observable, Subscription } from 'rxjs';

// NPM

// Kohese
import { NavigatableComponent } from '../../classes/NavigationComponent.class'
import { NavigationService } from '../../services/navigation/navigation.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DetailsComponent } from '../details/details.component';
import { ItemProxy } from '../../../../common/src/item-proxy.js';

@Component({
  selector: 'action-table',
  templateUrl: './action-table.component.html',
  styleUrls: ['./action-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionTableComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  @Input()
  proxyStream: Observable<ItemProxy>;
  actionProxies: Array<ItemProxy>;
  tableStream: MatTableDataSource<ItemProxy>;
  itemProxy: ItemProxy;
  rowDef: Array<string>;


  baseRowDef: Array<string> = ['name', 'predecessors', 'state', 'assignedTo', 'estimatedHoursEffort', 'remainingHoursEffort', 'actualHoursEffort', 'nav'];

  /* Subscriptions */
  proxyStreamSub: Subscription;

  get Array() {
    return Array;
  }

  get navigationService() {
    return this._navigationService;
  }

  constructor(
    private _navigationService: NavigationService,
    private changeRef: ChangeDetectorRef,
    private _dialogService: DialogService) {
    super(_navigationService);
  }

  ngOnInit() {
    this.rowDef = this.baseRowDef;

    this.proxyStreamSub = this.proxyStream.subscribe((newProxy: ItemProxy) => {
      if (newProxy) {
        this.itemProxy = newProxy;
        console.log(this.itemProxy);
        let proxyList = this.itemProxy.getSubtreeAsList();
        this.tableStream = new MatTableDataSource(proxyList);
        this.changeRef.markForCheck();
      } else {
        this.itemProxy = undefined;
        console.log('Item Proxy Undefined');
      }
    })
  }

  ngOnDestroy() {
    this.proxyStreamSub.unsubscribe();
  }

  //TODO: Text Wrapping does not work correctly with this method. (Name Col)
  getRowIndent(row) {
    return {
      'padding-left': row.depth * 10 + 'px'
    }
  }

  public displayInformation(itemProxy: ItemProxy): void {
    this._dialogService.openComponentDialog(DetailsComponent, {
      data: { itemProxy: itemProxy }
    }).updateSize('90%', '90%');
  }
}
