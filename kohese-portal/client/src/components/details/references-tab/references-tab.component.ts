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
export class ReferencesTabComponent extends NavigatableComponent
 implements OnInit, OnDestroy {
  
  /* Data */
  @Input() 
  proxyStream : Observable<ItemProxy>;
  itemProxy : ItemProxy
  multiRefStreams : Array<ReferenceTableInfo> = [] ;
  singleRefInfo : Array<ReferenceInfo> = [];
  rowDef : Array<string> = ['name','kind','description'];

  /* Subscriptions */
  proxySubscription : Subscription;

  constructor (private navigationService : NavigationService,
               private changeRef : ChangeDetectorRef ) {
    super(navigationService);
  }

  ngOnInit () {
    this.proxySubscription = this.proxyStream.subscribe((newProxy) => {
      this.multiRefStreams = [];
      this.singleRefInfo = [];
      this.itemProxy = newProxy;
      let relCatKeys = Object.keys(this.itemProxy.relations);
      for(let relCategory of relCatKeys) {
        console.log('Relations' + relCategory);
        let relationKeys = Object.keys(this.itemProxy.relations[relCategory]);
        for (let relation of relationKeys ) {
          console.log('Relation' + relation)
          if (this.itemProxy.relations[relCategory][relation] instanceof Array) {
            console.log('Array' + relation);
            this.multiRefStreams.push({
              relationName : relation,
              tableStream : new MatTableDataSource
              (this.itemProxy.relations[relCategory][relation])
            })
          } else {
            this.singleRefInfo.push({
              relationName : relation,
              referenceProxy : this.itemProxy.relations[relCategory][relation]
            })
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

 interface ReferenceTableInfo {
  relationName : string;
  tableStream : MatTableDataSource<ItemProxy>
 }

 interface ReferenceInfo {
   relationName : string;
   referenceProxy : ItemProxy;
 }