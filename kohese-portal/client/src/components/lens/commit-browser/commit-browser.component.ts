import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs';

import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ItemRepository, RepoStates } from "../../../services/item-repository/item-repository.service";
import { MatDialogRef } from "@angular/material";

@Component({
  selector: 'commit-browser',
  templateUrl: './commit-browser.component.html',
  styleUrls: ['./commit-browser.component.scss']
})
export class CommitBrowserComponent implements OnInit, OnDestroy {
  private _selectedCommit: any;
  get selectedCommit() {
    return this._selectedCommit;
  }
  
  repoStatusSubscription: Subscription;

  constructor(private itemRepository: ItemRepository,
    private matDialogRef: MatDialogRef<CommitBrowserComponent>) {
  }

  ngOnInit() {
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
      .subscribe((update) => {
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
        }
      });
  }

  public rowSelected(object: any) {
    if (object.id) {
      this._selectedCommit = TreeConfiguration.getItemCache().getCommits()[
        object.id];
    }
  }

  ngOnDestroy() {
    this.repoStatusSubscription.unsubscribe();
  }

  cancel() {
    this.matDialogRef.close(undefined);
  }

  confirm() {
    this.matDialogRef.close(this.selectedCommit)
  }


}

