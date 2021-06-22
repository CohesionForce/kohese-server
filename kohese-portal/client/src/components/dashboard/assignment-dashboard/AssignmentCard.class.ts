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


import { DetailsComponent } from './../../details/details.component';
import { DialogService } from './../../../services/dialog/dialog.service';
import { NavigatableComponent } from "../../../classes/NavigationComponent.class";
import { NavigationService } from "../../../services/navigation/navigation.service";
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

import { ItemProxy } from '../../../../../common/src/item-proxy';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { ChangeDetectorRef } from "@angular/core";

export class AssignmentCard {

  editable : boolean;
  assignmentProxyStreamSub : Subscription;
  assignmentProxyStream : BehaviorSubject<ItemProxy>;
  assignment : ItemProxy;

  constructor (private itemRepository : ItemRepository,
               private dialogService : DialogService,
               protected changeRef : ChangeDetectorRef) {
    this.changeRef = changeRef
    this.assignmentProxyStream = new BehaviorSubject<ItemProxy>(undefined);
    this.assignmentProxyStreamSub = this.assignmentProxyStream.subscribe((assignment)=>{
      this.assignment = assignment;

    })
  }

  toggleEdit (editable : boolean ) {
    this.editable = !editable
    this.changeRef.markForCheck();
  }

  stateChanged(stateName, value) {
    this.assignment[stateName] = value;
    this.changeRef.markForCheck();
  }

  upsertItem() {
    this.itemRepository.upsertItem(this.assignment.kind, this.assignment.item)
      .then((newAssignment)=>{
        this.assignment = newAssignment;
        this.editable = false;
        this.changeRef.markForCheck();
      })
  }

  destroy() {
    this.assignmentProxyStreamSub.unsubscribe();
  }

  openProxyDetails(proxy: ItemProxy) {
    this.dialogService.openComponentDialog(DetailsComponent, {
      data : {
        itemProxy : proxy
      }
    }).updateSize('80%', '80%')
      .afterClosed().subscribe((results)=>{

      });
  }
}
