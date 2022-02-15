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
import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, Observable } from 'rxjs';

// Other External Dependencies

// Kohese
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';

@Component({
  selector: 'references-tab',
  templateUrl: './references-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./references-tab.component.scss']
})
export class ReferencesTabComponent implements OnInit, OnDestroy {

  /* Data */
  @Input()
  proxyStream: Observable<ItemProxy>;
  @Input()
  routingStrategy : string;
  @Input()
  editableStream : Observable<boolean>;
  itemProxy: ItemProxy
  referenceInfo: Array<ReferenceTableInfo> = [];
  referencedByInfo: Array<ReferenceTableInfo> = [];

  /* Subscriptions */
  proxySubscription: Subscription;

  constructor(private changeRef: ChangeDetectorRef,
              private navigationService: NavigationService
  ) {}

  ngOnInit() {
    console.log(this);
    this.proxySubscription = this.proxyStream.subscribe((newProxy) => {
      if (newProxy) {
        this.referenceInfo = [];
        this.referencedByInfo = [];
        this.itemProxy = newProxy;
        let relTypeKeys = Object.keys(this.itemProxy.relations);
        for (let relType of relTypeKeys) {
          console.log('RelationType' + relType);
          let relCatKeys = Object.keys(this.itemProxy.relations[relType]);
          for (let relCategory of relCatKeys) {
            console.log('RelationKind' + relCategory);
            let relationKeys = Object.keys(this.itemProxy.relations[relType][relCategory]);
            for (let relation of relationKeys) {
              console.log('Relation' + relation)
              let relationList = this.itemProxy.relations[relType][relCategory][relation];
              if (!(relationList instanceof Array)) {
                relationList = [relationList];
              }
              console.log('Array' + relation);
              if (relType === 'references') {
                this.referenceInfo.push({
                  relationKind: relCategory,
                  relationName: relation,
                  tableStream: new MatTableDataSource(relationList)
                })
              } else {
                this.referencedByInfo.push({
                  relationKind: relCategory,
                  relationName: relation,
                  tableStream: new MatTableDataSource(relationList)
                })
              }
            }
          }
        }
        this.changeRef.markForCheck();
      } else {
        this.itemProxy = undefined;
      }
    })
  }

  ngOnDestroy() {
    this.proxySubscription.unsubscribe();
  }

}

export interface ReferenceTableInfo {
  relationKind: string;
  relationName: string;
  tableStream: MatTableDataSource<ItemProxy>
}
