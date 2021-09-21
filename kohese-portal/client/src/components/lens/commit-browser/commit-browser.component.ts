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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

// Other External Dependencies

// Kohese
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemCache } from "../../../../../common/src/item-cache";
import { ItemRepository, RepoStates, TreeConfigType } from "../../../services/item-repository/item-repository.service";

interface CommitViewItem {
  commitId: string
  commit: {
    author: string,
    message: string,
    parents: Array<string>,
    repoTreeRoots: {},
    time: number
  }
  parents: Array<any>;
}

@Component({
  selector: 'commit-browser',
  templateUrl: './commit-browser.component.html',
  styleUrls: ['./commit-browser.component.scss']
})
export class CommitBrowserComponent implements OnInit, OnDestroy {
  repoStatusSubscription: Subscription;
  commitList: Array<CommitViewItem> = [];
  selectedCommit: CommitViewItem;
  commitMap: any;

  constructor(private itemRepository: ItemRepository,
    private matDialogRef: MatDialogRef<CommitBrowserComponent>,
    private _navigationService: NavigationService) {
  }

  ngOnInit() {
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
      .subscribe(async (update) => {
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
          this.commitMap = ItemCache.getItemCache().getCommits();

          // Convert to array for sorting in the view
          for (let commitId of <Array<string>>Array.from(this.commitMap.keys())) {
            let commit = await this.commitMap.get(commitId)
            let commitView = {
              commitId: commitId,
              commit: commit,
              parents: []
            }
            commitView.parents = []
            for (let parent in commit.parents) {
              commitView.parents.push(this.commitMap.get(parent))
            }

            this.commitList.push(commitView)
          }
          // Sort into reverse chronological order
          this.commitList.sort((a, b) => {
            if (a.commit.time > b.commit.time) {
              return -1;
            } else if (a.commit.time === b.commit.time) {
              return 0;
            } else {
              return 1;
            }
          })
        }
      })


  }

  onCommitSelected(newCommit, commitIdx) {
    let newCommitView: CommitViewItem = {
      commit: newCommit,
      commitId: commitIdx,
      parents: []
    }
    for (let parent of this.commitMap.get(commitIdx).parents) {
      newCommitView.parents.push(this.commitMap.get(parent))
    }
    this.selectedCommit = newCommitView;
  }

  ngOnDestroy() {
    this.repoStatusSubscription.unsubscribe();
  }

  cancel() {
    this.matDialogRef.close(undefined);
  }

  confirm() {
    this.itemRepository.setTreeConfig(this.selectedCommit.commitId,
      TreeConfigType.HISTORICAL);
    this.matDialogRef.close(this.selectedCommit);
  }

  public navigateToSelectedCommit(): void {
    this._navigationService.navigate('Versions', {
      id: this.selectedCommit.commitId
    });
    this.cancel();
  }
}

