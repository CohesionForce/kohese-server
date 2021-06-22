/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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


import { ItemRepository } from './../../../services/item-repository/item-repository.service';
import { DetailsComponent } from './../../details/details.component';
import { DialogService } from './../../../services/dialog/dialog.service';
import { Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ItemProxy } from './../../../../../common/src/item-proxy';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'stateful-proxy-card',
  templateUrl: './stateful-proxy-card.component.html',
  styleUrls: ['./stateful-proxy-card.component.scss'],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class StatefulProxyCardComponent implements OnInit {
  @Input()
  proxy : ItemProxy;
  @Input()
  highlightColor : string;
  editable : boolean = false;

  constructor(private dialogService : DialogService,
              private changeRef : ChangeDetectorRef,
              private itemRepository : ItemRepository) { }

  ngOnInit() {
  }

  openProxyDialog() {
    this.dialogService.openComponentDialog(DetailsComponent, {
      data : {
        itemProxy : this.proxy
      }
    }).updateSize('70%', '70%')
      .afterClosed().subscribe((results)=>{

      });
  }

  toggleEdit (editable : boolean ) {
    this.editable = !editable
    this.changeRef.markForCheck();
  }

  stateChanged(stateName, value) {
    this.proxy.item[stateName] = value;
    this.changeRef.markForCheck();
  }

  upsertItem() {
    this.itemRepository.upsertItem(this.proxy.kind, this.proxy.item)
      .then((newAssignment)=>{
        this.proxy = newAssignment;
        this.editable = false;
        this.changeRef.markForCheck();
      })
  }
}
