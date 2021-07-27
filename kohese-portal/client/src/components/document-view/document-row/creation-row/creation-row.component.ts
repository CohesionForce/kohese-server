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
import { Component, OnInit, Input, EventEmitter } from '@angular/core';

// NPM

// Kohese
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../../../common/src/item-proxy';

@Component({
  selector: 'creation-row',
  templateUrl: './creation-row.component.html',
  styleUrls: ['./creation-row.component.scss']
})
export class CreationRowComponent implements OnInit {
  @Input()
  referenceProxy : ItemProxy;
  @Input()
  relation : string;

  name = '';
  description = '';
  itemCreated : EventEmitter<ItemProxy> = new EventEmitter<ItemProxy>();

  constructor(private itemRepository : ItemRepository) { }

  ngOnInit() {
  }

  createItem () {
    let parentId = ''
    if (this.relation === 'sibling') {
      parentId = this.referenceProxy.item.parentId
    } else if (this.relation === 'child') {
      parentId = this.referenceProxy.item.id
    }
    this.itemRepository.upsertItem('Item', {
      name : this.name,
      description : this.description,
      parentId : parentId
    }).then((newItem)=> {
      if (newItem) {
        this.itemCreated.emit(newItem)
      }
    })
  }

}
