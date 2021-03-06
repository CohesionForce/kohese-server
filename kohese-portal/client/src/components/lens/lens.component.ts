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
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs';

// Other External Dependencies

// Kohese
import { LensService, ApplicationLens } from "../../services/lens-service/lens.service";
import { ItemRepository, RepoStates } from "../../services/item-repository/item-repository.service";

@Component({
  selector: 'lens',
  templateUrl : './lens.component.html',
  styleUrls : ['./lens.component.scss']
})
export class LensComponent implements OnInit, OnDestroy {

  currentLens : ApplicationLens;
  lensSubscription : Subscription;
  repoStatusSubscription : Subscription;
  selectedCommit : any;

  /* Const data */
  LENSES : any;

  constructor (private lensService : LensService,
               private itemRepository : ItemRepository) {
    this.LENSES = ApplicationLens;
  }

  ngOnInit () {
    this.lensSubscription = this.lensService.getLensSubject().subscribe((newLens)=>{
      this.currentLens = newLens;
    })
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
      .subscribe((update)=>{
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
        }
    })


  }

  ngOnDestroy () {
    this.lensSubscription.unsubscribe();
    this.repoStatusSubscription.unsubscribe();
  }
}
