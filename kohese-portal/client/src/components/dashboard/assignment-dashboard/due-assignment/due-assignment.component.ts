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


import { DialogService } from './../../../../services/dialog/dialog.service';
import { Component, Input, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { AssignmentCard } from '../AssignmentCard.class';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';

@Component({
  selector : 'due-assignment',
  templateUrl: 'due-assignment.component.html',
  styleUrls : ['../AssignmentCard.class.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DueAssignmentComponent extends AssignmentCard implements OnDestroy, OnInit {

  /* Data */
  @Input()
  itemProxy : ItemProxy

  constructor (dialogService : DialogService,
               itemRepository : ItemRepository,
               changeRef : ChangeDetectorRef) {
    super (itemRepository,dialogService, changeRef);

  }

  ngOnInit () {
    this.assignmentProxyStream.next(this.itemProxy);
  }

  ngOnDestroy() {
    this.destroy();
  }
}
