import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef, OnInit, OnDestroy, EventEmitter,
  Output } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository,
  TreeConfigType } from '../../../services/item-repository/item-repository.service';
import { LensService, ApplicationLens } from '../../../services/lens-service/lens.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row/tree-row.class';
import { Image, Action } from '../tree-row/tree-row.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { ItemCache, KoheseCommit } from '../../../../../common/src/item-cache';
import { Comparison, ChangeType } from '../../compare-items/comparison.class';
import { ItemProxyComparison } from '../../compare-items/item-proxy-comparison.class';
import { Compare } from '../../compare-items/compare.class';
import { CommitComparisonComponent } from '../../compare-items/commit-comparison/commit-comparison.component';
import { CompareItemsComponent } from '../../compare-items/item-comparison/compare-items.component';

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
    new Image(Comparison.getChangeIconString(ChangeType.CONTENT_CHANGED),
      ChangeType.CONTENT_CHANGED, true, (object: any) => {
      return ((object instanceof Comparison) && (-1 !== (<Comparison> object).
        changeTypes.indexOf(ChangeType.CONTENT_CHANGED)));
      }),
    new Image(Comparison.getChangeIconString(ChangeType.TYPE_CHANGED),
      ChangeType.TYPE_CHANGED, true, (object: any) => {
      return ((object instanceof Comparison) && (-1 !== (<Comparison> object).
        changeTypes.indexOf(ChangeType.TYPE_CHANGED)));
      }),
    new Image(Comparison.getChangeIconString(ChangeType.PARENT_CHANGED),
      ChangeType.PARENT_CHANGED, true, (object: any) => {
      return ((object instanceof Comparison) && (-1 !== (<Comparison> object).
        changeTypes.indexOf(ChangeType.PARENT_CHANGED)));
      }),
    new Image(Comparison.getChangeIconString(ChangeType.CHILD_ADDED),
      ChangeType.CHILD_ADDED, true, (object: any) => {
      return ((object instanceof Comparison) && (-1 !== (<Comparison> object).
        changeTypes.indexOf(ChangeType.CHILD_ADDED)));
      }),
    new Image(Comparison.getChangeIconString(ChangeType.CHILD_MODIFIED),
      ChangeType.CHILD_MODIFIED, true, (object: any) => {
      return ((object instanceof Comparison) && (-1 !== (<Comparison> object).
        changeTypes.indexOf(ChangeType.CHILD_MODIFIED)));
      }),
    new Image(Comparison.getChangeIconString(ChangeType.CHILD_REMOVED),
      ChangeType.CHILD_REMOVED, true, (object: any) => {
      return ((object instanceof Comparison) && (-1 !== (<Comparison> object).
        changeTypes.indexOf(ChangeType.CHILD_REMOVED)));
      }),
    new Image(Comparison.getChangeIconString(ChangeType.CHILDREN_REORDERED),
      ChangeType.CHILDREN_REORDERED, true, (object: any) => {
      return ((object instanceof Comparison) && (-1 !== (<Comparison> object).
        changeTypes.indexOf(ChangeType.CHILDREN_REORDERED)));
      })
    ];
  get images() {
    return this._images;
  }

  private _itemRepositorySubscription: Subscription;

  public constructor(route: ActivatedRoute, dialogService: DialogService,
    private _changeDetectorRef: ChangeDetectorRef, private _itemRepository:
    ItemRepository, private _lensService: LensService,
    private _navigationService: NavigationService,
    private _dynamicTypesService: DynamicTypesService) {
    super(route, dialogService);
  }

  public ngOnInit(): void {
    this.rowActions.push(new Action('Use As History Lens', 'Uses this ' +
      'commit as the history lens', 'fa fa-eye', (object: any) => {
      return (object instanceof Commit);
      }, (object: any) => {
      this._lensService.setLens(ApplicationLens.HISTORY);
      this._itemRepository.setTreeConfig((object as Commit).id,
        TreeConfigType.HISTORICAL);
    }));

    this.menuActions.push(new Action('Compare Against...', '',
      'fa fa-exchange', (object: any) => {
      return true;
      }, (object: any) => {
      this.openComparisonDialog(object);
    }));

    this._itemRepositorySubscription = this._itemRepository.getTreeConfig()
      .subscribe((treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        this._repositoryProxy = treeConfigurationObject.config.getRootProxy();
        let thisRef = this;
        this.buildRows().then(() => {
          console.log('^^^ buildRows complete');
          thisRef._route.params.subscribe((parameters: Params) => {
            thisRef.showFocus();
          });

          thisRef.initialize();

          thisRef.showFocus();
        });
      }
    });
  }

  public ngOnDestroy(): void {
    this._itemRepositorySubscription.unsubscribe();
  }

  private async buildRows(): Promise<void> {
    this.clear();

    let cache: ItemCache = ItemCache.getItemCache();
    let commitMap: any = cache.getCommits();
    let sortedCommitArray: Array<any> = [];
    for (let oid of Array.from(commitMap.keys())) {
      sortedCommitArray.push({
        oid: oid,
        commit: commitMap.get(oid)
      });
    }
    sortedCommitArray.sort((oneCommitObject: any, anotherCommitObject:
      any) => {
      return anotherCommitObject.commit.time - oneCommitObject.commit.time;
    });
    let commits: Array<Commit> = [];
    let rootRow: TreeRow = this.buildRow(new Repository(this._repositoryProxy,
      commits));
    let beforeTime = Date.now();
    for (let j: number = 0; j < sortedCommitArray.length; j++) {
      let commitObject: any = sortedCommitArray[j];
      let comparisons: Array<Comparison> = [];
      let commitRow: TreeRow = this.buildRow(new Commit(commitObject.oid,
        commitObject.commit, comparisons));
      commits.push(commitRow.object);
      if (commitObject.commit.parents && commitObject.commit.parents[0]) {
        comparisons.push(...await Compare.compareCommits(commitObject.commit.parents[
          0], commitObject.oid, this._dynamicTypesService));
      }

      for (let j: number = 0; j < comparisons.length; j++) {
        this.buildRow(comparisons[j]);
      }
    }
    let afterTime = Date.now();
    console.log('$$$ Time to build commit rows:  ' + (afterTime-beforeTime)/1000);

    this.rootSubject.next(rootRow.object);
  }

  protected getId(object: any): any {
    let id: string = '';
    if (object instanceof Repository) {
      id = (object as Repository).proxy.item.id;
    } else if (object instanceof Commit) {
      id = (object as Commit).id;
    } else if (object instanceof Comparison) {
      let comparison: ItemProxyComparison = (object as ItemProxyComparison);
      let repository: Repository = (<Repository> this.getRow(this.
        _repositoryProxy.item.id).object);
      for (let j: number = 0; j < repository.commits.length; j++) {
        if (-1 !== repository.commits[j].comparisons.indexOf(comparison)) {
          id = repository.commits[j].id + '_' + comparison.changeObject.id;
          break;
        }
      }
    }

    return id;
  }

  protected getParent(object: any): any {
    if (object instanceof Commit) {
      return this.getRow(this._repositoryProxy.item.id).object;
    } else if (object instanceof Comparison) {
      let repository: Repository = (<Repository> this.getRow(this.
        _repositoryProxy.item.id).object);
      for (let j: number = 0; j < repository.commits.length; j++) {
        if (-1 !== repository.commits[j].comparisons.indexOf(
          object as Comparison)) {
          return this.getRow(this.getId(repository.commits[j])).object;
        }
      }
    }

    return undefined;
  }

  protected getChildren(object: any): Array<any> {
    let children: Array<any> = [];
    if (object instanceof Repository) {
      let commits: Array<Commit> = (object as Repository).commits;
      for (let j: number = 0; j < commits.length; j++) {
        children.push(commits[j]);
      }
    } else if (object instanceof Commit) {
      let comparisons: Array<Comparison> = (object as Commit).comparisons;
      for (let j: number = 0; j < comparisons.length; j++) {
        children.push(comparisons[j]);
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
    } else if (object instanceof Comparison) {
      text = (object as Comparison).changeObject.name;
    }

    return text;
  }

  protected getIcon(object: any): string {
    let iconString: string = '';
    if (object instanceof Repository) {
      iconString = 'fa fa-database';
    } else if (object instanceof Commit) {
      iconString = 'fa fa-stamp';
    }

    return iconString;
  }

  protected rowFocused(row: TreeRow): void {
    this.rowSelectedEmitter.emit(row.object);
    this._navigationService.navigate('Versions', {
      id: this.getId(row.object)
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
      let compareParameters: any = {
        editable: false
      };

      if (baseObject instanceof Repository) {
        compareParameters['baseProxy'] = (baseObject as Repository).proxy;
      } else if (baseObject instanceof Comparison) {
        let comparison: Comparison = (baseObject as Comparison);
        //compareParameters['baseProxy'] = comparison.baseObject;
        //compareParameters['changeProxy'] = comparison.changeObject;
      }

      this._dialogService.openComponentDialog(CompareItemsComponent, {
        data: compareParameters
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

  get comparisons() {
    return this._comparisons;
  }

  public constructor(private _id: string, private _koheseCommit: KoheseCommit,
    private _comparisons: Array<Comparison>) {
  }
}
