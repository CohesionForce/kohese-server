import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

import { NavigationService } from '../../../services/navigation/navigation.service';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';

import * as ItemProxy from '../../../../../common/src/item-proxy';
import { Subscription, Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector : 'references-tab',
  templateUrl: './references-tab.component.html',
  changeDetection : ChangeDetectionStrategy.OnPush,
  styleUrls: ['./references-tab.component.scss']
})
export class ReferencesTabComponent implements OnInit, OnDestroy {

  /* Data */
  @Input()
  proxyStream : Observable<ItemProxy>;
  itemProxy : ItemProxy
  referenceInfo : Array<ReferenceTableInfo> = [] ;
  referencedByInfo : Array<ReferenceTableInfo> = [] ;
  /* Subscriptions */
  proxySubscription : Subscription;

  constructor ( private changeRef : ChangeDetectorRef ) {
  }

  ngOnInit () {
    this.proxySubscription = this.proxyStream.subscribe((newProxy) => {
      this.referenceInfo = [];
      this.referencedByInfo = [];
      this.itemProxy = newProxy;
      let relTypeKeys = Object.keys(this.itemProxy.relations);
      for(let relType of relTypeKeys){
        console.log('RelationType' + relType);
        let relCatKeys = Object.keys(this.itemProxy.relations[relType]);
        for(let relCategory of relCatKeys) {
          console.log('RelationKind' + relCategory);
          let relationKeys = Object.keys(this.itemProxy.relations[relType][relCategory]);
          for (let relation of relationKeys ) {
            console.log('Relation' + relation)
            let relationList = this.itemProxy.relations[relType][relCategory][relation];
            if (!(relationList instanceof Array)) {
              relationList = [ relationList ];
            }
            console.log('Array' + relation);
            if (relType === 'references'){
              this.referenceInfo.push({
                relationKind : relCategory,
                relationName : relation,
                tableStream : new MatTableDataSource (relationList)
              })
            } else {
              this.referencedByInfo.push({
                relationKind : relCategory,
                relationName : relation,
                tableStream : new MatTableDataSource (relationList)
              })
            }
          }
        }
      }
      this.changeRef.markForCheck();

    })
  }

  ngOnDestroy () {
    this.proxySubscription.unsubscribe();
  }

 }

 export interface ReferenceTableInfo {
  relationKind : string;
  relationName : string;
  tableStream : MatTableDataSource<ItemProxy>
 }
