import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { VirtualScrollComponent } from 'angular2-virtual-scroll';

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
  
  get DifferenceTypeOperations() {
    return DifferenceTypeOperations;
  }
  
  @ViewChild(VirtualScrollComponent)
  private _virtualScrollComponent: VirtualScrollComponent;
  
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
      sortedCommitArray.sort((oneCommitObject: any, anotherCommitObject:
        any) => {
        return anotherCommitObject.commit.time - oneCommitObject.commit.time;
      });
      for (let j: number = 0; j < sortedCommitArray.length; j++) {
        this._commitMap[sortedCommitArray[j].oid] = sortedCommitArray[j].
          commit;
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
    this._differences.push(...CommitComparisonComponent.compareCommits(this.
      _baseCommitId, this._changeCommitId));
      
    if (this._virtualScrollComponent) {
      this._virtualScrollComponent.refresh(true);
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
  
  public static compareCommits(baseCommitId: string, changeCommitId: string):
    Array<Difference> {
    let differences: Array<Difference> = [];
    let cache: ItemCache = TreeConfiguration.getItemCache();
    let comparison: any = TreeHashMap.diff(cache.getTreeHashMap(baseCommitId),
      cache.getTreeHashMap(changeCommitId));
    if (!comparison.match) {
      for (let id in comparison.details) {
        let comparisonEntry: TreeHashEntryDifference = comparison.details[id];
        let oid: string = comparisonEntry.treeHashChanged.toTreeId;
        let commitId: string = changeCommitId;
        if (!oid) {
          oid = comparisonEntry.treeHashChanged.fromTreeId;
          commitId = baseCommitId;
        }
        let difference: Difference = new Difference(cache.getBlob(cache.
          getTree(oid).oid), commitId);
        
        if (comparisonEntry.contentChanged) {
          difference.differenceTypes.push(DifferenceType.CONTENT_CHANGED);
        }
        
        if (comparisonEntry.kindChanged) {
          difference.differenceTypes.push(DifferenceType.TYPE_CHANGED);
        }
        
        if (comparisonEntry.parentChanged) {
          difference.differenceTypes.push(DifferenceType.PARENT_CHANGED);
        }
        
        if (comparisonEntry.childrenAdded) {
          difference.differenceTypes.push(DifferenceType.CHILD_ADDED);
        }
        
        if (comparisonEntry.childrenModified) {
          difference.differenceTypes.push(DifferenceType.CHILD_MODIFIED);
        }
        
        if (comparisonEntry.childrenDeleted) {
          difference.differenceTypes.push(DifferenceType.CHILD_REMOVED);
        }
        
        if (comparisonEntry.childrenReordered) {
          difference.differenceTypes.push(DifferenceType.CHILDREN_REORDERED);
        }
        
        differences.push(difference);
      }
    }
    
    for (let j: number = 0; j < differences.length; j++) {
      let difference: Difference = differences[j];
      let path: Array<string> = [];
      let parentId: string = difference.item.parentId;
      while (parentId) {
        let k: number = 0;
        while (k < differences.length) {
          let commitDifference: Difference = differences[k];
          if (commitDifference.item.id === parentId) {
            path.push(commitDifference.item.name);
            parentId = commitDifference.item.parentId;
            break;
          }
          k++;
        }
        
        if (k === differences.length) {
          break;
        }
      }
      
      path.reverse();
      difference.path = path.join(' \u2192 ');
    }
    
    differences.sort((oneDifference: Difference, anotherDifference:
      Difference) => {
      return oneDifference.item.name - anotherDifference.item.name;
    });
      
    return differences;
  }
}

export class Difference {
  get item() {
    return this._item;
  }
  
  get commitId() {
    return this._commitId;
  }
  
  private _path: string;
  get path() {
    return this._path;
  }
  set path(path: string) {
    this._path = path;
  }
  
  private _differenceTypes: Array<DifferenceType> = [];
  get differenceTypes() {
    return this._differenceTypes;
  }
  
  public constructor(private _item: any, private _commitId: string) {
    if (!this._item) {
      this._item = {
        id: 'Jesus Christ is LORD!',
        name: 'Jesus Christ is LORD!'
      };
    }
  }
}

export enum DifferenceType {
  CONTENT_CHANGED, TYPE_CHANGED, PARENT_CHANGED, CHILD_ADDED, CHILD_MODIFIED,
    CHILD_REMOVED, CHILDREN_REORDERED
}

export class DifferenceTypeOperations {
  public static toString(differenceType: DifferenceType): string {
    let stringRepresentation: string = '';
    switch (differenceType) {
      case DifferenceType.CONTENT_CHANGED:
        stringRepresentation = 'Content Changed';
        break;
      case DifferenceType.TYPE_CHANGED:
        stringRepresentation = 'Type Changed';
        break;
      case DifferenceType.PARENT_CHANGED:
        stringRepresentation = 'Parent Changed';
        break;
      case DifferenceType.CHILD_ADDED:
        stringRepresentation = 'Child Added';
        break;
      case DifferenceType.CHILD_MODIFIED:
        stringRepresentation = 'Child Modified';
        break;
      case DifferenceType.CHILD_REMOVED:
        stringRepresentation = 'Child Removed';
        break;
      case DifferenceType.CHILDREN_REORDERED:
        stringRepresentation = 'Children Reordered';
        break;
    }
    
    return stringRepresentation;
  }
  
  public static getIconClass(differenceType: DifferenceType): string {
    let iconClass: string = '';
    switch (differenceType) {
      case DifferenceType.CONTENT_CHANGED:
        iconClass = 'fa fa-pencil';
        break;
      case DifferenceType.TYPE_CHANGED:
        iconClass = 'fa fa-sitemap';
        break;
      case DifferenceType.PARENT_CHANGED:
        iconClass = 'fa fa-arrow-up';
        break;
      case DifferenceType.CHILD_ADDED:
        iconClass = 'fa fa-plus';
        break;
      case DifferenceType.CHILD_MODIFIED:
        iconClass = 'fa fa-arrow-down';
        break;
      case DifferenceType.CHILD_REMOVED:
        iconClass = 'fa fa-minus';
        break;
      case DifferenceType.CHILDREN_REORDERED:
        iconClass = 'fa fa-exchange';
        break;
    }
    
    return iconClass;
  }
}