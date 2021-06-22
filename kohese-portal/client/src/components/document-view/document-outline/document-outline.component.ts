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


import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { ActivatedRoute } from '@angular/router';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Component, OnInit, Output } from '@angular/core';

@Component({
  selector: 'document-outline',
  templateUrl: './document-outline.component.html',
  styleUrls: ['./document-outline.component.scss']
})
export class DocumentOutlineComponent implements OnInit {
  proxyStream : BehaviorSubject<ItemProxy> = new BehaviorSubject<ItemProxy>(undefined)
  selectedProxyStream : BehaviorSubject<ItemProxy> = new BehaviorSubject<ItemProxy>(undefined)
  documentProxyStream : BehaviorSubject<ItemProxy> = new BehaviorSubject<ItemProxy>(undefined)
  paramSubscription : Subscription;
  treeConfigSubscription : Subscription;
  documentRootId : string;
  documentRoot

  @Output() outlineView: boolean = true;

  constructor(private router : ActivatedRoute, private itemRepository: ItemRepository) { }

  ngOnInit() {
    this.paramSubscription = this.router.params.subscribe(params => {
      if (params['id']) {
       this.documentRootId = params['id'];
      }
    });

    this.treeConfigSubscription = this.itemRepository.getTreeConfig().subscribe((newConfig) => {
      if (newConfig) {
        this.documentRoot = newConfig.config.getProxyFor(this.documentRootId);
        this.proxyStream.next(this.documentRoot);
      }
    })
  }

  setRoot(newRoot: ItemProxy) {
    this.proxyStream.next(newRoot)
  }

}
