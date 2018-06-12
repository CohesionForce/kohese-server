import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ItemCache } from '../../../../../common/src/item-cache';
import { TreeHashMap,
  TreeHashEntryDifference } from '../../../../../common/src/tree-hash';
import { CompareItemsComponent } from '../compare-items.component';

@Component({
  selector: 'commit-comparison',
  templateUrl: './commit-comparison.component.html',
  styleUrls: ['./commit-comparison.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommitComparisonComponent {
  private _repositoryProxy: ItemProxy;
  
  private _commitMap: any = {};
  get commitMap() {
    return this._commitMap;
  }
  
  private _baseCommitId: string;
  get baseCommitId() {
    return this._baseCommitId;
  }
  set baseCommitId(baseCommitId: string) {
    this._baseCommitId = baseCommitId;
  }
  
  private _changeCommitId: string;
  get changeCommitId() {
    return this._changeCommitId;
  }
  set changeCommitId(changeCommitId: string) {
    this._changeCommitId = changeCommitId;
  }
  
  private _differences: Array<any> = [];
  get differences() {
    return this._differences;
  }
  
  get data() {
    return this._data;
  }
  
  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    private _changeDetectorRef: ChangeDetectorRef, private _dialogService:
    DialogService) {
  }
  
  public ngOnInit(): void {
    if (this._data) {
      this._repositoryProxy = this._data['repositoryProxy'];
      let commitMap = TreeConfiguration.getItemCache().getCommits();
      let sortedCommitArray: Array<any> = [];
      for (let oid in commitMap) {
        sortedCommitArray.push({
          oid: oid,
          commit: commitMap[oid]
        });
      }
      sortedCommitArray.sort((oneCommitObject: any, anotherCommitObject: any) => {
        return anotherCommitObject.commit.time - oneCommitObject.commit.time;
      });
      for (let j: number = 0; j < sortedCommitArray.length; j++) {
        this._commitMap[sortedCommitArray[j].oid] = sortedCommitArray[j].commit;
      }
      
      if (this._data['baseCommitId']) {
        this._baseCommitId = this._data['baseCommitId'];
      }
      
      if (this._data['changeCommitId']) {
        this._changeCommitId = this._data['changeCommitId'];
      }
    }
    
    this.compareCommits();
  }
  
  public compareCommits(): void {
    this._differences.length = 0;
    let cache: ItemCache = TreeConfiguration.getItemCache();
    let comparison: any = TreeHashMap.diff(cache.getTreeHashMap(
      this._baseCommitId), cache.getTreeHashMap(this._changeCommitId));
    if (!comparison.match) {
      for (let id in comparison.details) {
        let difference: TreeHashEntryDifference = comparison.details[id];
        if (difference.childrenAdded) {
          for (let j: number = 0; j < difference.childrenAdded.length;
            j++) {
            let treeId: string = difference.childrenAdded[j].treeId;
            /* TODO Remove this condition once the appropriate cache changes
            have been made */
            if (('Repository-Mount' !== treeId) && ('Internal' !== treeId)) {
              this._differences.push({
                item: cache.getBlob(cache.getTree(treeId).oid),
                iconString: 'fa fa-plus'
              });
            }
          }
        }
            
        if (difference.childrenModified) {
          for (let j: number = 0; j < difference.childrenModified.length;
            j++) {
            let treeId: string = difference.childrenModified[j].toTreeId;
            /* TODO Remove this condition once the appropriate cache
            changes have been made */
            if (('Repository-Mount' !== treeId) && ('Internal' !== treeId)) {
              this._differences.push({
                item: cache.getBlob(cache.getTree(treeId).oid),
                iconString: 'fa fa-pencil'
              });
            }
          }
        }
          
        if (difference.childrenDeleted) {
          for (let j: number = 0; j < difference.childrenDeleted.length;
            j++) {
            let treeId: string = difference.childrenDeleted[j].treeId;
            /* TODO Remove this condition once the appropriate cache
            changes have been made */
            if (('Repository-Mount' !== treeId) && ('Internal' !== treeId)) {
              this._differences.push({
                item: cache.getBlob(cache.getTree(treeId).oid),
                iconString: 'fa fa-minus'
              });
            }
          }
        }
      }
    }
  }
  
  public openComparisonDialog(difference: any): void {
    this._dialogService.openComponentDialog(CompareItemsComponent, {
      data: {
        //baseProxy: ,
        //changeProxy: ,
        editable: false
      }
    }).updateSize('90%', '90%');
  }
}