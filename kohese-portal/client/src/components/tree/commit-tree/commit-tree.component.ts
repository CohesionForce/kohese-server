import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row.class';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ItemCache } from '../../../../../common/src/item-cache';
import { TreeHashMap, TreeHashEntry } from '../../../../../common/src/tree-hash';

@Component({
  selector: 'commit-tree',
  templateUrl: './commit-tree.component.html',
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommitTreeComponent extends Tree implements OnInit {
  private _itemRepositorySubscription: Subscription;
  
  public constructor(route: ActivatedRoute, dialogService: DialogService,
    private _changeDetectorRef: ChangeDetectorRef, private _itemRepository:
    ItemRepository) {
    super(route, dialogService);
  }
  
  public ngOnInit(): void {
    this._itemRepositorySubscription = this._itemRepository.getTreeConfig()
      .subscribe((treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
      }
    });
  }
  
  private buildRows(repositoryProxy: ItemProxy): void {
    this.clear();
    
    let cache: ItemCache = TreeConfiguration.getItemCache();
    let commitMap: any = cache.getCommits();
    /*let rootRow: TreeRow = this.buildRow(repositoryProxy);
    rootRow.getRowParentProxy = () => {
      return repositoryProxy.getRepositoryProxy();
    };
    rootRow.getRowChildrenProxies = () => {
      let rowChildrenProxies: Array<ItemProxy> = [];
      for (let oid in commitMap) {
        rowChildrenProxies.push(this.getRow(oid).itemProxy);
      }
      
      return rowChildrenProxies;
    };
    for (let oid in commitMap) {
      let commitRow: TreeRow = new TreeRow(new ItemProxy('Internal', {
        id: oid,
        name: commitMap[oid].message
      }));
      commitRow.getRowParentProxy = () => {
        return repositoryProxy;
      };
      if (commitMap[oid].parents && commitMap[oid].parents[0]) {
        let comparison: any = TreeHashMap.compare(cache.getTreeHashMap(
          commitMap[oid].parents[0]), cache.getTreeHashMap(oid));
        if (!comparison.match) {
          for (let j: number = 0; j < comparison.addedItems.length; j++) {
            let proxyRow: TreeRow = new TreeRow();
            proxyRow.getRowParentProxy = () => {
              return commitRow.itemProxy;
            };
            proxyRow.getRowChildrenProxies = () => {
              return [];
            };
          }
          
          for (let j: number = 0; j < comparison.changedItems.length; j++) {
            let proxyRow: TreeRow = new TreeRow();
            proxyRow.getRowParentProxy = () => {
              return commitRow.itemProxy;
            };
            proxyRow.getRowChildrenProxies = () => {
              return [];
            };
          }
          
          for (let j: number = 0; j < comparison.deletedItems.length; j++) {
            let proxyRow: TreeRow = new TreeRow();
            proxyRow.getRowParentProxy = () => {
              return commitRow.itemProxy;
            };
            proxyRow.getRowChildrenProxies = () => {
              return [];
            };
          }
        }
      }
      commitRow.getRowChildrenProxies = () => {
        let rowChildrenProxies: Array<ItemProxy> = [];
        
        return rowChildrenProxies;
      };
    }*/
  }
  
  public getId(row: TreeRow): string {
    return (row.object as TreeHashEntry).oid;
  }
  
  public getParent(row: TreeRow): TreeRow {
    return undefined;
  }
  
  public getChildren(row: TreeRow): Array<TreeRow> {
    return [];
  }
  
  public getText(object: any): string {
    return '';
  }
  
  public getIcon(object: any): string {
    return '';
  }
}