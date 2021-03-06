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
import { Injectable } from '@angular/core';
import { BehaviorSubject ,  Subscription } from 'rxjs';

// Other External Dependencies

// Kohese
import { ItemRepository } from './../item-repository/item-repository.service';
import { ItemProxy } from '../../../../common/src/item-proxy';


@Injectable()
export class ReportService {
  treeConfigSubscription : Subscription;
  reportDefinitions : Array<ItemProxy>;
  reportDefSubject : BehaviorSubject<Array<ItemProxy>> = new BehaviorSubject<Array<ItemProxy>>([]);

  constructor(private itemRepository : ItemRepository) {
    this.initReports()
  }

  initReports(){
    this.treeConfigSubscription =
      this.itemRepository.getTreeConfig().subscribe((newConfig) => {
        if (newConfig) {
          // Generate Project Info
          this.reportDefinitions = newConfig.config.getAllItemProxies()
            .filter((proxy) => {
              if (proxy.kind === 'ReportDefinition') {
                return true;
              }
            })
          this.reportDefSubject.next(this.reportDefinitions);

          console.log(this.reportDefinitions);
        }
      })
    }

    generateReportDefinitions() : Array<ItemProxy> {
      let reportDefs = [];
      return reportDefs;
    }

    getReportSubscription() : BehaviorSubject<Array<ItemProxy>> {
      return this.reportDefSubject;
    }
}
