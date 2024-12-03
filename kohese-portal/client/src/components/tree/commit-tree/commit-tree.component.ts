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
import { Component, ChangeDetectorRef, OnInit, OnDestroy, EventEmitter, Output, ViewRef} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

// Other External Dependencies

// Kohese
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository, TreeConfigType } from '../../../services/item-repository/item-repository.service';
import { LensService, ApplicationLens } from '../../../services/lens-service/lens.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row/tree-row.class';
import { Image, Action } from '../tree-row/tree-row.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { ItemCache } from '../../../../../common/src/item-cache';
import { KoheseCommit } from '../../../../../common/src/kohese-commit';
import { Comparison, ChangeType } from '../../compare-items/comparison.class';
import { ItemProxyComparison } from '../../compare-items/item-proxy-comparison.class';
import { Compare } from '../../compare-items/compare.class';
import { CommitComparisonComponent } from '../../compare-items/commit-comparison/commit-comparison.component';
import { CompareItemsComponent } from '../../compare-items/item-comparison/compare-items.component';

@Component({
  selector: 'commit-tree',
  templateUrl: './commit-tree.component.html',
  styleUrls: ['../tree.component.scss',
              './commit-tree.component.scss'
             ],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommitTreeComponent extends Tree implements OnInit, OnDestroy {
  private _repositoryProxy: ItemProxy;
  processingComplete: boolean = false;

  @Output('rowSelected')
  public rowSelectedEmitter: EventEmitter<any> = new EventEmitter<any>();

  private createImage(changeType: ChangeType): Image {
    return new Image(Comparison.getChangeIconString(changeType),
    (object: any) => {
    return changeType;
  }, true, (object: any) => {
    return ((object instanceof Comparison) && (-1 !== (<Comparison> object).
      changeTypes.indexOf(changeType)));
    })
  }

  private _images: Array<Image> = [
    this.createImage(ChangeType.ITEM_ADDED),
    this.createImage(ChangeType.ITEM_REMOVED),
    this.createImage(ChangeType.PARENT_CHANGED),
    this.createImage(ChangeType.CHILD_ADDED),
    this.createImage(ChangeType.CHILD_REMOVED),
    this.createImage(ChangeType.CHILDREN_REORDERED),
    this.createImage(ChangeType.CHILD_MODIFIED),
    this.createImage(ChangeType.TYPE_CHANGED),
    this.createImage(ChangeType.CONTENT_CHANGED)
  ];
  get images() {
    return this._images;
  }

  private _itemRepositorySubscription: Subscription;

  public constructor(
                      route: ActivatedRoute,
                      dialogService: DialogService,
                      private changeDetectorRef: ChangeDetectorRef,
                      private _itemRepository: ItemRepository,
                      private _lensService: LensService,
                      private _navigationService: NavigationService,
                      private _dynamicTypesService: DynamicTypesService
  ) {
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
          thisRef._route.params.subscribe((parameters: Params) => {
            thisRef.showFocus();
          });
        });

        thisRef.initialize();
        thisRef.showFocus();
      }
    });
  }

  public ngOnDestroy(): void {
    this._itemRepositorySubscription.unsubscribe();
  }

  private async buildRowsForCommit(commitObject : any, commits : Array<Commit>): Promise<void> {
    const deferPropertyDiffs = true;
    let comparisons: Array<Comparison> = [];
    let commitRow: TreeRow = this.buildRow(new Commit(commitObject.oid,
      commitObject.commit, comparisons));
    commits.push(commitRow.object);
    if (commitObject.commit.parents && commitObject.commit.parents[0]) {
      comparisons.push(...await Compare.compareCommits(commitObject.commit.parents[
        0], commitObject.oid, this._dynamicTypesService, deferPropertyDiffs));
    }

    for (let j: number = 0; j < comparisons.length; j++) {
      this.buildRow(comparisons[j]);
    }
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
    this.absoluteRoot = new Repository(this._repositoryProxy, commits)
    let rootRow: TreeRow = this.buildRow(this.absoluteRoot);

    this.rootSubject.next(rootRow.object);

    let beforeTime = Date.now();

    sortedCommitArray.reverse();

    let commitIteration = 0;
    const yieldWithNoDelay = 0;

    let thisComponent = this;
    async function processCommit () : Promise<void> {
      if (sortedCommitArray.length > 0) {
        // console.log('^^^ Building rows for commit: ' + commitIteration);

        let commitObject: any = sortedCommitArray.pop();
        await thisComponent.buildRowsForCommit(commitObject, commits);

        thisComponent.rootSubject.next(rootRow.object);

        if (thisComponent.changeDetectorRef && !(thisComponent.changeDetectorRef as ViewRef).destroyed) {
          // The view still exists, so detectChanges and keep processing the commits
          thisComponent.changeDetectorRef.detectChanges();
          commitIteration++;

          if (sortedCommitArray.length) {
            setTimeout(processCommit, yieldWithNoDelay);
          } else {
            let afterTime = Date.now();
            thisComponent.processingComplete = true;

            console.log('$$$ Time to build commit rows:  ' + (afterTime-beforeTime)/1000);
          }
        }
      }
    }

    await processCommit();
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
        let itemId = comparison.changeObject ? comparison.changeObject.id : comparison.baseObject.id;
        if (-1 !== repository.commits[j].comparisons.indexOf(comparison)) {
          id = repository.commits[j].id + '_' + itemId;
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
      let repository: Repository = (<Repository> this.getRow(this._repositoryProxy.item.id).object);
      let comparisonObject: ItemProxyComparison = object as ItemProxyComparison;
      let commitObject: Comparison;

      // Find the Commit that contains the comparison object
      for (let j: number = 0; j < repository.commits.length; j++) {
        if (-1 !== repository.commits[j].comparisons.indexOf(comparisonObject)) {
          commitObject = this.getRow(this.getId(repository.commits[j])).object;
          break;
        }
      }

      // Finds the parent of the commit object
      if (commitObject) {
        if (comparisonObject.parent) {
          return comparisonObject.parent;
        } else {
          return commitObject;
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
        // Push top level comparisons (those without a parent)
        if (!comparisons[j].parent) {
          children.push(comparisons[j]);
        }
      }
    } else if (object instanceof Comparison) {
      children = (object as Comparison).children;
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
      let comparison = object as Comparison;
      text = comparison.changeObject ? comparison.changeObject.name : comparison.baseObject.name;
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
    this.changeDetectorRef.markForCheck();
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
      }).updateSize('60%', '80%');
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
