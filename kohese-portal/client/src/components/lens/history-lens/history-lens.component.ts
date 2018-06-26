import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs';

import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
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
        this._selectedCommit = TreeConfiguration.getItemCache().getCommits()[
          treeConfigurationObject.config.treeId];
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
