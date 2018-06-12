import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef, OnInit, OnDestroy, EventEmitter,
  Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row.class';
import { MenuAction } from '../tree-row.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ItemCache } from '../../../../../common/src/item-cache';
import { TreeHashMap, TreeHashEntry,
  TreeHashEntryDifference } from '../../../../../common/src/tree-hash';
import { CommitComparisonComponent } from '../../compare-items/commit-comparison/commit-comparison.component';
import { CompareItemsComponent } from '../../compare-items/compare-items.component';

@Component({
  selector: 'commit-tree',
  templateUrl: './commit-tree.component.html',
  styleUrls: ['../tree.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommitTreeComponent extends Tree implements OnInit, OnDestroy {
  private _repositoryProxy: ItemProxy;
  @Output('rowSelected')
  public rowSelectedEmitter: EventEmitter<any> = new EventEmitter<any>();
  private _itemRepositorySubscription: Subscription;
  
  public constructor(route: ActivatedRoute, dialogService: DialogService,
    private _changeDetectorRef: ChangeDetectorRef, private _itemRepository:
    ItemRepository) {
    super(route, dialogService);
  }
  
  public ngOnInit(): void {
    this.menuActions.push(new MenuAction('Compare Against...', '',
      'fa fa-exchange', (row: TreeRow) => {
      if (row.object instanceof Difference) {
        if (DifferenceType.CHANGE !== (row.object as Difference).differenceType) {
          return false;
        }
      }
      
      return true;
      }, (row: TreeRow) => {
      this.openComparisonDialog(row.object);
    }));
    
    this._itemRepositorySubscription = this._itemRepository.getTreeConfig()
      .subscribe((treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        this._repositoryProxy = treeConfigurationObject.config.getRootProxy();
        this.buildRows();
      }
    });
  }
  
  public ngOnDestroy(): void {
    this._itemRepositorySubscription.unsubscribe();
  }
  
  private buildRows(): void {
    this.clear();
    
    let cache: ItemCache = TreeConfiguration.getItemCache();
    let commitMap: any = cache.getCommits();
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
    let commits: Array<Commit> = [];
    let rootRow: TreeRow = this.buildRow(new Repository(this._repositoryProxy,
      commits));
    for (let j: number = 0; j < sortedCommitArray.length; j++) {
      let commitObject: any = sortedCommitArray[j];
      let differences: Array<Difference> = [];
      let commitRow: TreeRow = this.buildRow(new Commit(commitObject.oid, commitObject.commit.
        message, differences));
      if (commitObject.commit.parents && commitObject.commit.parents[0]) {
        let comparison: any = TreeHashMap.diff(cache.getTreeHashMap(
          commitObject.commit.parents[0]), cache.getTreeHashMap(commitObject.oid));
        if (!comparison.match) {
          for (let id in comparison.details) {
            let difference: TreeHashEntryDifference = comparison.details[id];
            if (difference.childrenAdded) {
              for (let j: number = 0; j < difference.childrenAdded.length;
                j++) {
                let treeId: string = difference.childrenAdded[j].treeId;
                /* TODO Remove this condition once the appropriate cache
                changes have been made */
                if (('Repository-Mount' !== treeId) && ('Internal' !==
                  treeId)) {
                  differences.push(new Difference(cache.getBlob(cache.getTree(
                    treeId).oid), commitObject.oid, DifferenceType.ADDITION));
                }
              }
            }
            
            if (difference.childrenModified) {
              for (let j: number = 0; j < difference.childrenModified.length;
                j++) {
                let treeId: string = difference.childrenModified[j].toTreeId;
                /* TODO Remove this condition once the appropriate cache
                changes have been made */
                if (('Repository-Mount' !== treeId) && ('Internal' !==
                  treeId)) {
                  differences.push(new Difference(cache.getBlob(cache.getTree(
                    treeId).oid), commitObject.oid, DifferenceType.CHANGE));
                }
              }
            }
          
            if (difference.childrenDeleted) {
              for (let j: number = 0; j < difference.childrenDeleted.length;
                j++) {
                let treeId: string = difference.childrenDeleted[j].treeId;
                /* TODO Remove this condition once the appropriate cache
                changes have been made */
                if (('Repository-Mount' !== treeId) && ('Internal' !==
                  treeId)) {
                  differences.push(new Difference(cache.getBlob(cache.getTree(
                    treeId).oid), commitObject.oid, DifferenceType.REMOVAL));
                }
              }
            }
          }
        }
      }
      
      differences.sort((oneDifference: Difference, anotherDifference:
        Difference) => {
        return oneDifference.differenceType - anotherDifference.differenceType;
      });
      for (let j: number = 0; j < differences.length; j++) {
        this.buildRow(differences[j]);
      }
      
      commits.push(commitRow.object);
    }
    
    this._rootSubject.next(rootRow);
  }
  
  public getId(row: TreeRow): string {
    let id: string = '';
    if (row.object instanceof Repository) {
      id = (row.object as Repository).proxy.item.id;
    } else if (row.object instanceof Commit) {
      id = (row.object as Commit).id;
    } else if (row.object instanceof Difference) {
      let difference: Difference = (row.object as Difference);
      id = difference.commitId + '_' + difference.item.id;
    }
    
    return id;
  }
  
  public getParent(row: TreeRow): TreeRow {
    if (row.object instanceof Commit) {
      return this.getRow(this._repositoryProxy.item.id);
    } else if (row.object instanceof Difference) {
      return this.getRow((row.object as Difference).commitId);
    }
  }
  
  public getChildren(row: TreeRow): Array<TreeRow> {
    let children: Array<TreeRow> = [];
    if (row.object instanceof Repository) {
      let commits: Array<Commit> = (row.object as Repository).commits;
      for (let j: number = 0; j < commits.length; j++) {
        children.push(this.getRow(commits[j].id));
      }
    } else if (row.object instanceof Commit) {
      let differences: Array<Difference> = (row.object as Commit).differences;
      for (let j: number = 0; j < differences.length; j++) {
        children.push(this.getRow(differences[j].commitId + '_' + differences[
          j].item.id));
      }
    }
    
    return children;
  }
  
  public getText(object: any): string {
    let text: string = '';
    if (object instanceof Repository) {
      text = (object as Repository).proxy.item.name;
    } else if (object instanceof Commit) {
      text = (object as Commit).message;
    } else if (object instanceof Difference) {
      let path: Array<string> = [];
      //let parent: ItemProxy = (object as Difference).item.parentId;
      //while (parent) {
      //  path.push(parent.item.name);
      //  parent = parent.parentProxy;
      //}
      path.reverse();
      text = (object as Difference).item.name + ' (' + path.join(' \u2192 ') + ')';
    }
    
    return text;
  }
  
  public getIcon(object: any): string {
    let iconString: string = '';
    if (object instanceof Repository) {
      iconString = 'fa fa-database';
    } else if (object instanceof Commit) {
      iconString = 'fa fa-stamp';
    } else if (object instanceof Difference) {
      let difference: Difference = (object as Difference);
      switch (difference.differenceType) {
        case DifferenceType.ADDITION:
          iconString = 'fa fa-plus';
          break;
        case DifferenceType.REMOVAL:
          iconString = 'fa fa-minus';
          break;
        case DifferenceType.CHANGE:
          iconString = 'fa fa-pencil';
          break;
      }
    }
    
    return iconString;
  }
  
  public rowSelected(row: TreeRow): void {
    this.rowSelectedEmitter.emit(row.object);
  }
  
  public postTreeTraversalActivity(): void {
    this._changeDetectorRef.markForCheck();
  }
  
  private openComparisonDialog(baseObject: any): void {
    if (baseObject instanceof Commit) {
      let previousCommitId: string;
      let commits: Array<Commit> = (<Repository> this.getRow(this.
        _repositoryProxy.item.id).object).commits;
      for (let j: number = 0; j < commits.length; j++) {
        if ((commits[j].id === (baseObject as Commit).id) && ((j + 1) <
          commits.length)) {
          previousCommitId = commits[j + 1].id;
          break;
        }
      }
      
      this._dialogService.openComponentDialog(CommitComparisonComponent, {
        data: {
          repositoryProxy: this._repositoryProxy,
          baseCommitId: (baseObject as Commit).id,
          changeCommitId: previousCommitId
        }
      }).updateSize('70%', '70%');
    } else {
      let baseProxy: ItemProxy;
      if (baseObject instanceof Repository) {
        baseProxy = (baseObject as Repository).proxy;
      } else if (baseObject instanceof Difference) {
        //baseProxy = (baseObject instanceof Difference).item;
      }
      
      this._dialogService.openComponentDialog(CompareItemsComponent, {
        data: {
          baseProxy: baseProxy,
          //changeProxy:,
          editable: false
        }
      });
    }
  }
}

class Repository {
  get proxy() {
    return this._proxy;
  }
  
  get commits() {
    return this._commits;
  }
  
  public constructor(private _proxy: ItemProxy, private _commits:
    Array<Commit>) {
  }
}

class Commit {
  get id() {
    return this._id;
  }
  
  get message() {
    return this._message;
  }
  
  get differences() {
    return this._differences;
  }
  
  public constructor(private _id: string, private _message: string,
    private _differences: Array<Difference>) {
  }
}

class Difference {
  get item() {
    return this._item;
  }
  
  get commitId() {
    return this._commitId;
  }
  
  get differenceType() {
    return this._differenceType;
  }
  
  public constructor(private _item: any, private _commitId: string,
    private _differenceType: DifferenceType) {
    if (!this._item) {
      this._item = {
        id: 'Jesus Christ is LORD!',
        name: 'Jesus Christ is LORD!'
      };
    }
  }
}

enum DifferenceType {
  ADDITION, REMOVAL, CHANGE
}