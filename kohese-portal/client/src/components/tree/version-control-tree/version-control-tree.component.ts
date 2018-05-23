import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
  OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ToastrService } from 'ngx-toastr';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row.class';
import { RowAction, MenuAction } from '../tree-row.component';

@Component({
  selector: 'version-control-tree',
  templateUrl: './version-control-tree.component.html',
  styleUrls: ['../tree.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class VersionControlTreeComponent extends Tree implements OnInit,
  OnDestroy {
  private _absoluteRoot: ItemProxy;
  get absoluteRoot() {
    return this._absoluteRoot;
  }
  
  private _itemRepositorySubscription: Subscription;
  private _treeConfigurationSubscription: Subscription;
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef, route:
    ActivatedRoute, private _itemRepository: ItemRepository, dialogService:
    DialogService, private _versionControlService: VersionControlService,
    private _toastrService: ToastrService) {
    super(route, dialogService);
  }
  
  public ngOnInit(): void {
    let versionControlRowActions: Array<RowAction> = [
      new RowAction('Revert', 'Undoes all uncommitted changes to this Item',
        'fa fa-undo', (row: TreeRow) => {
        return (Object.keys(row.itemProxy.status).length > 0);
        }, (row: TreeRow) => {
        this._dialogService.openYesNoDialog('Undo Changes', 'Are you sure ' +
          'that you want to undo all changes to this Item since the last ' +
          'commit?').subscribe((result: any) => {
          if (result) {
            this._versionControlService.revertItems([row.itemProxy]).
              subscribe((statusMap: any) => {
              if (statusMap.error) {
                this._toastrService.error('Revert Failed', 'Version Control');
              } else {
                this._toastrService.success('Revert Succeeded',
                  'Version Control');
              }
            });
          }
        });
      }),
      new RowAction('Stage', 'Stages changes to this Item', 'fa fa-plus',
        (row: TreeRow) => {
        return row.itemProxy.status['Unstaged'];
        }, (row: TreeRow) => {
        this._versionControlService.stageItems([row.itemProxy]).subscribe(
          (statusMap: any) => {
          if (statusMap.error) {
            this._toastrService.error('Stage Failed', 'Version Control');
          } else {
            this._toastrService.success('Stage Succeeded', 'Version Control');
          }
        });
      }),
      new RowAction('Unstage', 'Un-stages changes to this Item', 'fa fa-minus',
        (row: TreeRow) => {
        return row.itemProxy.status['Staged'];
        }, (row: TreeRow) => {
        this._versionControlService.unstageItems([row.itemProxy]).
          subscribe((statusMap: any) => {
          if (statusMap.error) {
            this._toastrService.error('Unstage Failed', 'Version Control');
          } else {
            this._toastrService.success('Unstage Succeeded',
              'Version Control');
          }
        });
      })
    ];
    this.rootRowActions.splice(0, 0, ...versionControlRowActions);
    this.rootRowActions.push(new RowAction('Set Parent As Root',
      'Set this row\'s parent as the root', 'fa fa-level-up', (row:
      TreeRow) => {
      return (this._rootSubject.getValue() && (this._rootSubject.getValue() !==
        this._absoluteRoot));
      }, (row: TreeRow) => {
      this._rootSubject.next(row.itemProxy.parentProxy);
    }));
    this.rowActions.splice(0, 0, ...versionControlRowActions);
    
    this._itemRepositorySubscription = this._itemRepository.getTreeConfig()
      .subscribe((treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        this._absoluteRoot = treeConfigurationObject.config.getRootProxy();
        
        if (this._treeConfigurationSubscription) {
          this._treeConfigurationSubscription.unsubscribe();
        }
        this._treeConfigurationSubscription = treeConfigurationObject.config.
          getChangeSubject().subscribe((notification: any) => {
          this.buildRows(this._rootSubject.getValue());
        });
        
        this._rootSubject.next(this._absoluteRoot);
        this.showSelection();
      }
    });
  }
  
  public ngOnDestroy(): void {
    this.prepareForDismantling();
    if (this._treeConfigurationSubscription) {
      this._treeConfigurationSubscription.unsubscribe();
    }
    this._itemRepositorySubscription.unsubscribe();
  }
  
  private buildRows(root: ItemProxy): void {
    this.clear();
    
    let rootRow: TreeRow = this.buildRow(root);
    rootRow.getRowChildrenProxies = () => {
      let rowChildrenProxies: Array<ItemProxy> = [];
      for (let j: number = 0; j < root.children.length; j++) {
        if (this.getRow(root.children[j].item.id)) {
          rowChildrenProxies.push(root.children[j]);
        }
      }
      
      return rowChildrenProxies;
    };
    root.visitTree({ includeOrigin: false }, undefined, (proxy: ItemProxy) => {
      let build: boolean = (Object.keys(proxy.status).length > 0);
      if (!build) {
        for (let j: number = 0; j < proxy.children.length; j++) {
          if (this.getRow(proxy.children[j].item.id)) {
            build = true;
            break;
          }
        }
      }
      
      if (build) {
        let row: TreeRow = this.buildRow(proxy);
        row.getRowChildrenProxies = () => {
          let rowChildrenProxies: Array<ItemProxy> = [];
          for (let j: number = 0; j < proxy.children.length; j++) {
            if (this.getRow(proxy.children[j].item.id)) {
              rowChildrenProxies.push(proxy.children[j]);
            }
          }
      
          return rowChildrenProxies;
        };
      }
    });
  }
  
  public postTreeTraversalActivity(): void {
    this._changeDetectorRef.markForCheck();
  }
  
  public rootChanged(): void {
    this.buildRows(this._rootSubject.getValue());
  }
}