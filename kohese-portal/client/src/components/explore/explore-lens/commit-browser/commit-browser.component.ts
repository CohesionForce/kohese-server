import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs';

import * as ItemProxy from '../../../../../../common/src/item-proxy';
import { ItemRepository, RepoStates } from "../../../../services/item-repository/item-repository.service";
import { MatDialogRef } from "@angular/material";

@Component({
  selector: 'commit-browser',
  templateUrl : './commit-browser.component.html',
  styleUrls : ['./commit-browser.component.scss']
})
export class CommitBrowserComponent implements OnInit, OnDestroy {

  repoStatusSubscription : Subscription;
  commitList : Array<any>;
  selectedCommit : any;
  
  constructor (private itemRepository : ItemRepository,
              private matDialogRef : MatDialogRef<CommitBrowserComponent>) {
  }

  ngOnInit () {
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
      .subscribe((update)=>{
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
          this.commitList = ItemProxy.TreeConfiguration.getItemCache().getCommits();
        }
    })


  }

  onCommitSelected (newCommit) {
    this.selectedCommit = newCommit;
  }

  ngOnDestroy () {
    this.repoStatusSubscription.unsubscribe();
  }

  cancel() {
    this.matDialogRef.close(undefined);
  }

  confirm() {
    this.matDialogRef.close(this.selectedCommit)
  }
}