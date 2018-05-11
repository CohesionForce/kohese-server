import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row.class';

@Component({
  selector: 'default-tree',
  templateUrl: './default-tree.component.html',
  styleUrls: ['../tree.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultTreeComponent extends Tree implements OnInit, OnDestroy {
  private _absoluteRoot: ItemProxy;
  
  private _itemRepositorySubscription: Subscription;
  private _treeConfigurationSubscription: Subscription;
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    route: ActivatedRoute, private _itemRepository: ItemRepository) {
    super(route);
  }
  
  public ngOnInit(): void {
    this._itemRepositorySubscription = this._itemRepository.getTreeConfig()
      .subscribe((treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        this._absoluteRoot = treeConfigurationObject.config.getRootProxy();
        this._absoluteRoot.visitTree({ includeOrigin: true }, (proxy:
          ItemProxy) => {
          this.buildRow(proxy);
        });
        
        let lostAndFoundProxy: ItemProxy = treeConfigurationObject.config.
          getLostAndFoundProxy();
        if (!this.getRow(lostAndFoundProxy.item.id)) {
          this.buildRow(lostAndFoundProxy);
        }
        
        if (this._treeConfigurationSubscription) {
          this._treeConfigurationSubscription.unsubscribe();
        }
        this._treeConfigurationSubscription = treeConfigurationObject.config.
          getChangeSubject().subscribe((notification: any) => {
          this.calculateRows(notification);
        });

        this.rootSubject.next(this._absoluteRoot);
        this.showSelection();
      }
    });
  }
  
  public ngOnDestroy(): void {
    this.prepareForDismantling();
    this._treeConfigurationSubscription.unsubscribe();
    this._itemRepositorySubscription.unsubscribe();
  }
  
  private calculateRows(notification: any): void {
    switch (notification.type) {
      case 'create': {
          this.insertRow(notification.proxy);
          this.showRows();
        }
        break;
      case 'delete': {
          this.deleteRow(notification.id);
          this.showRows();
        }
        break;
      case 'loaded': {
          this._absoluteRoot.visitTree({ includeOrigin: true }, (proxy:
            ItemProxy) => {
            this.buildRow(proxy);
          });
          this.showRows();
          this.showSelection();
        }
        break;
    }
  }
  
  public postTreeTraversalActivity(): void {
    this._changeDetectorRef.markForCheck();
  }
}