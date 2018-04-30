import { Component, Input, OnInit, OnDestroy, EventEmitter } from "@angular/core";
import { Subscription } from 'rxjs';

import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ItemRepository, RepoStates, TreeConfigType } from "../../../services/item-repository/item-repository.service";
import { MatDialogRef } from "@angular/material";
import { DialogService } from "../../../services/dialog/dialog.service";
import { CommitBrowserComponent } from "../commit-browser/commit-browser.component";

@Component({
  selector: 'history-lens',
  templateUrl : './history-lens.component.html',
  styleUrls : ['./history-lens.component.scss']
})
export class HistoryLensComponent implements OnInit, OnDestroy {

  repoStatusSubscription : Subscription;
  commitList : Array<any>;
  selectedCommit : any;
  commitSelected : EventEmitter<any> = new EventEmitter<any>();

  constructor (private itemRepository : ItemRepository,
               private dialogService : DialogService) {
  }

  ngOnInit () {
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
      .subscribe((update)=>{
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
          this.commitList = TreeConfiguration.getItemCache().getCommits();
        }
    })
  }

  openCommitBrowser () {
    this.dialogService.openComponentDialog(CommitBrowserComponent, {})
      .updateSize('70%', '70%').afterClosed().subscribe((newRecord)=>{
        if (newRecord) {
          this.selectedCommit = newRecord.commit;
          console.log(newRecord);
          this.itemRepository.setTreeConfig(newRecord.commitId, TreeConfigType.HISTORICAL);
        }
      })
  }

  ngOnDestroy () {
    this.repoStatusSubscription.unsubscribe();
  }
}
