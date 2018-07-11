import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef, OnInit, OnDestroy, EventEmitter,
  Output } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository,
  TreeConfigType } from '../../../services/item-repository/item-repository.service';
import { LensService, ApplicationLens } from '../../../services/lens-service/lens.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row.class';
import { Image, RowAction, MenuAction } from '../tree-row.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ItemCache, KoheseCommit } from '../../../../../common/src/item-cache';
import { TreeHashMap, TreeHashEntry,
  TreeHashEntryDifference } from '../../../../../common/src/tree-hash';
import { CommitComparisonComponent, Difference, DifferenceType,
  DifferenceTypeOperations } from '../../compare-items/commit-comparison/commit-comparison.component';
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
  
  private _images: Array<Image> = [
    new Image(DifferenceTypeOperations.getIconClass(DifferenceType.
      CONTENT_CHANGED), DifferenceTypeOperations.toString(DifferenceType.
      CONTENT_CHANGED), true, (row: TreeRow) => {
      return ((row.object instanceof Difference) && (-1 !== (<Difference> row.
        object).differenceTypes.indexOf(DifferenceType.CONTENT_CHANGED)));
    }),
    new Image(DifferenceTypeOperations.getIconClass(DifferenceType.
      TYPE_CHANGED), DifferenceTypeOperations.toString(DifferenceType.
      TYPE_CHANGED), true, (row: TreeRow) => {
      return ((row.object instanceof Difference) && (-1 !== (<Difference> row.
        object).differenceTypes.indexOf(DifferenceType.TYPE_CHANGED)));
    }),
    new Image(DifferenceTypeOperations.getIconClass(DifferenceType.
      PARENT_CHANGED), DifferenceTypeOperations.toString(DifferenceType.
      PARENT_CHANGED), true, (row: TreeRow) => {
      return ((row.object instanceof Difference) && (-1 !== (<Difference> row.
        object).differenceTypes.indexOf(DifferenceType.PARENT_CHANGED)));
    }),
    new Image(DifferenceTypeOperations.getIconClass(DifferenceType.
      CHILD_ADDED), DifferenceTypeOperations.toString(DifferenceType.
      CHILD_ADDED), true, (row: TreeRow) => {
      return ((row.object instanceof Difference) && (-1 !== (<Difference> row.
        object).differenceTypes.indexOf(DifferenceType.CHILD_ADDED)));
    }),
    new Image(DifferenceTypeOperations.getIconClass(DifferenceType.
      CHILD_MODIFIED), DifferenceTypeOperations.toString(DifferenceType.
      CHILD_MODIFIED), true, (row: TreeRow) => {
      return ((row.object instanceof Difference) && (-1 !== (<Difference> row.
        object).differenceTypes.indexOf(DifferenceType.CHILD_MODIFIED)));
    }),
    new Image(DifferenceTypeOperations.getIconClass(DifferenceType.
      CHILD_REMOVED), DifferenceTypeOperations.toString(DifferenceType.
      CHILD_REMOVED), true, (row: TreeRow) => {
      return ((row.object instanceof Difference) && (-1 !== (<Difference> row.
        object).differenceTypes.indexOf(DifferenceType.CHILD_REMOVED)));
    }),
    new Image(DifferenceTypeOperations.getIconClass(DifferenceType.
      CHILDREN_REORDERED), DifferenceTypeOperations.toString(DifferenceType.
      CHILDREN_REORDERED), true, (row: TreeRow) => {
      return ((row.object instanceof Difference) && (-1 !== (<Difference> row.
        object).differenceTypes.indexOf(DifferenceType.CHILDREN_REORDERED)));
    })
  ];
  get images() {
    return this._images;
  }
  
  private _itemRepositorySubscription: Subscription;
  
  public constructor(route: ActivatedRoute, dialogService: DialogService,
    private _changeDetectorRef: ChangeDetectorRef, private _itemRepository:
    ItemRepository, private _lensService: LensService,
    private _navigationService: NavigationService) {
    super(route, dialogService);
  }
  
  public ngOnInit(): void {
    this.rowActions.push(new RowAction('Use As History Lens', 'Uses this ' +
      'commit as the history lens', 'fa fa-eye', (row: TreeRow) => {
      return (row.object instanceof Commit); 
      }, (row: TreeRow) => {
      this._lensService.setLens(ApplicationLens.HISTORY);
      this._itemRepository.setTreeConfig((row.object as Commit).id,
        TreeConfigType.HISTORICAL);
    }));
    
    this.menuActions.push(new MenuAction('Compare Against...', '',
      'fa fa-exchange', (row: TreeRow) => {
      return true;
      }, (row: TreeRow) => {
      this.openComparisonDialog(row.object);
    }));
    
    this._itemRepositorySubscription = this._itemRepository.getTreeConfig()
      .subscribe((treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        this._repositoryProxy = treeConfigurationObject.config.getRootProxy();
        this.buildRows();
        
        this._route.params.subscribe((parameters: Params) => {
          this.showSelection();
        });
        
        this.showSelection();
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
    sortedCommitArray.sort((oneCommitObject: any, anotherCommitObject:
      any) => {
      return anotherCommitObject.commit.time - oneCommitObject.commit.time;
    });
    let commits: Array<Commit> = [];
    let rootRow: TreeRow = this.buildRow(new Repository(this._repositoryProxy,
      commits));
    for (let j: number = 0; j < sortedCommitArray.length; j++) {
      let commitObject: any = sortedCommitArray[j];
      let differences: Array<Difference> = [];
      let commitRow: TreeRow = this.buildRow(new Commit(commitObject.oid,
        commitObject.commit, differences));
      commits.push(commitRow.object);
      if (commitObject.commit.parents && commitObject.commit.parents[0]) {
        differences.push(...CommitComparisonComponent.compareCommits(
          commitObject.commit.parents[0], commitObject.oid));
      }
      
      for (let j: number = 0; j < differences.length; j++) {
        this.buildRow(differences[j]);
      }
    }
    
    this.rootSubject.next(rootRow);
  }
  
  protected getId(row: TreeRow): string {
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
  
  protected getParent(row: TreeRow): TreeRow {
    if (row.object instanceof Commit) {
      return this.getRow(this._repositoryProxy.item.id);
    } else if (row.object instanceof Difference) {
      return this.getRow((row.object as Difference).commitId);
    }
  }
  
  protected getChildren(row: TreeRow): Array<TreeRow> {
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
  
  protected getText(object: any): string {
    let text: string = '';
    if (object instanceof Repository) {
      text = (object as Repository).proxy.item.name;
    } else if (object instanceof Commit) {
      text = (object as Commit).koheseCommit.message;
    } else if (object instanceof Difference) {
      text = (object as Difference).item.name;
    }
    
    return text;
  }
  
  protected getIcon(object: any): string {
    let iconString: string = '';
    if (object instanceof Repository) {
      iconString = 'fa fa-database';
    } else if (object instanceof Commit) {
      iconString = 'fa fa-stamp';
    } else if (object instanceof Difference) {
    }
    
    return iconString;
  }
  
  protected rowSelected(row: TreeRow): void {
    this.rowSelectedEmitter.emit(row.object);
    this._navigationService.navigate('Versions', {
      id: this.getId(row)
    });
  }
  
  protected postTreeTraversalActivity(): void {
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
          baseCommitId: previousCommitId,
          changeCommitId: (baseObject as Commit).id
        }
      }).updateSize('50%', '80%');
    } else {
      let baseProxy: ItemProxy;
      if (baseObject instanceof Repository) {
        baseProxy = (baseObject as Repository).proxy;
      } else if (baseObject instanceof Difference) {
        //baseProxy = (baseObject instanceof Difference).item;
      }
      
      this._dialogService.openComponentDialog(CompareItemsComponent, {
        data: {
          //baseProxy: ,
          changeProxy: baseProxy,
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

export class Commit {
  get id() {
    return this._id;
  }
  
  get koheseCommit() {
    return this._koheseCommit;
  }
  
  get differences() {
    return this._differences;
  }
  
  public constructor(private _id: string, private _koheseCommit: KoheseCommit,
    private _differences: Array<Difference>) {
  }
}
