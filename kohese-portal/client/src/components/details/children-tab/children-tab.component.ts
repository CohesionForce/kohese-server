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
import { Component, OnInit, OnDestroy, Input, EventEmitter,
  ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Subscription ,  BehaviorSubject ,  Observable } from 'rxjs';

// Other External Dependencies

// Kohese
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../common/src/item-proxy.js';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

@Component({
  selector : 'children-tab',
  templateUrl : './children-tab.component.html',
  styleUrls: ['./children-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildrenTabComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy {

  /* Ui Switches */
  orderedChildren : boolean;

  /* Data */
  itemProxy : ItemProxy;
  filterString : string;
  initialized : boolean = false;
  itemSortField : string;

  /* Observables */
  filterSubject : BehaviorSubject<string>;
  @Input() proxyStream : Observable<ItemProxy>;
  editableStream: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  childrenStream : BehaviorSubject<Array<ItemProxy>> = new BehaviorSubject([]);

  /* Subscriptions */
  proxyChangesSub : Subscription;
  editableStreamSub : Subscription;
  treeConfigSubscription: Subscription;


  constructor(protected NavigationService : NavigationService,
              private itemRepository : ItemRepository,
              private changeRef : ChangeDetectorRef
  ) {
    super(NavigationService);
  }

  ngOnInit() {
    this.proxyChangesSub = this.proxyStream.subscribe((newProxy : ItemProxy) => {
      if (newProxy) {
        this.updateProxy(newProxy);
      } else {
        this.itemProxy = undefined;
      }
    });

    this.editableStreamSub = this.editableStream.subscribe((value: any) => {
      this.updateProxy(this.itemProxy);
    });

    this.treeConfigSubscription = TreeConfiguration.getWorkingTree().getChangeSubject().subscribe((change: any) => {
      if(change.type === 'update') {
        this.updateProxy(change.proxy);
      }
    });

    this.filterSubject = new BehaviorSubject('');
    this.initialized = true;
  }

  ngOnDestroy () {
    this.proxyChangesSub.unsubscribe();
    this.editableStreamSub.unsubscribe();
  }

  updateProxy (newProxy : ItemProxy) {
    this.itemProxy = newProxy;
    this.childrenStream.next(this.itemProxy.children);
    this.orderedChildren = this.itemProxy.childrenAreManuallyOrdered();
    this.changeRef.markForCheck();
  }

  onFilterUpdate (filter : string) {
    this.filterSubject.next(filter);
    console.log(filter);
  }

  /**
   * Either populates or destroys an array of itemIDs and
   * returns true if id's exist wtihin itemIds and lenth is > 0. undefined otherwise.
   * It then passes the newly sorted list of children to the children-table component
   */
  toggleOrderedChildren () {
    this.itemProxy.toggleChildrenAreManuallyOrdered();
    this.orderedChildren = this.itemProxy.childrenAreManuallyOrdered();
    this.childrenStream.next(this.itemProxy.children);
  }

  public async upsertItem(): Promise<void> {
    let kind: string = this.itemProxy.kind;
    if(this.itemProxy.dirty) {
      await this.itemRepository.upsertItem(kind, this.itemProxy.item);
      this.editableStream.next(false);
      this.updateProxy(this.itemProxy);
      this.changeRef.markForCheck();
    }
  }

  public async discardChanges() {
    if(this.itemProxy.dirty) {
      await this.itemRepository.fetchItem(this.itemProxy);
      this.updateProxy(this.itemProxy);
      this.editableStream.next(false);
      this.changeRef.markForCheck();
    } else {
      this.editableStream.next(false);
      this.changeRef.markForCheck();
    }
  }

}
