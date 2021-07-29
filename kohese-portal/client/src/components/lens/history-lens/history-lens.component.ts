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
import { ItemCache } from "../../../../../common/src/item-cache";
import { ItemRepository } from "../../../services/item-repository/item-repository.service";
import { DialogService } from "../../../services/dialog/dialog.service";
import { CommitBrowserComponent } from "../commit-browser/commit-browser.component";

@Component({
  selector: 'history-lens',
  templateUrl : './history-lens.component.html',
  styleUrls : ['./history-lens.component.scss']
})
export class HistoryLensComponent implements OnInit, OnDestroy {
  private _selectedCommit: any;
  get selectedCommit() {
    return this._selectedCommit;
  }

  private _treeConfigurationSubscription: Subscription;

  constructor (private itemRepository : ItemRepository,
               private dialogService : DialogService) {
  }

  ngOnInit () {
    this._treeConfigurationSubscription = this.itemRepository.
      getTreeConfig().subscribe((treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        this._selectedCommit = ItemCache.getItemCache().getCommits()
          .get(treeConfigurationObject.config.treeId);
      } else {
        this._selectedCommit = undefined;
      }
    });
  }

  public ngOnDestroy(): void {
    this._treeConfigurationSubscription.unsubscribe();
  }

  openCommitBrowser () {
    this.dialogService.openComponentDialog(CommitBrowserComponent, {
      data: {}
    }).updateSize('70%', '70%');
  }
}
