import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChild, OnInit, OnDestroy,
  Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { ToastrService } from 'ngx-toastr';

import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row.class';
import { RowAction, MenuAction } from '../tree-row.component';

@Component({
  selector: 'default-tree',
  templateUrl: './default-tree.component.html',
  styleUrls: ['../tree.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultTreeComponent extends Tree implements OnInit, OnDestroy {
  private _absoluteRoot: ItemProxy;
  get absoluteRoot() {
    return this._absoluteRoot;
  }
  
  private _versionControlRowActions: Array<RowAction> = [
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
          this._toastrService.success('Unstage Succeeded', 'Version Control');
        }
      });
    })
  ];
  get rowActions() {
    if ('Version Control' === this._selectedViewSubject.getValue()) {
      return this._versionControlRowActions;
    } else {
      return [];
    }
  }
  
  private _rootRowActions: Array<RowAction> = [
    new RowAction('Set Parent As Root', 'Set this row\'s parent as the root',
      'fa fa-level-up', (row: TreeRow) => {
      return (this._rootSubject.getValue() && (this._rootSubject.getValue() !==
        this._absoluteRoot));
      }, (row: TreeRow) => {
      this._rootSubject.next(this.getRow(row.getRowParentProxy().item.id).
        itemProxy);
    })
  ];
  private _rootVersionControlRowActions: Array<RowAction> = this.
    _rootRowActions.slice(0);
  get rootRowActions() {
    if ('Default' === this._selectedViewSubject.getValue()) {
      return this._rootRowActions;
    } else {
      return this._rootVersionControlRowActions;
    }
  }
  
  private _synchronizeWithSelection: boolean = true;
  get synchronizeWithSelection() {
    return this._synchronizeWithSelection;
  }
  
  private _selectedViewSubject: BehaviorSubject<string>;
  @Input('selectedViewSubject')
  set selectedViewSubject(selectedViewSubject: BehaviorSubject<string>) {
    this._selectedViewSubject = selectedViewSubject;
  }
  
  private _itemRepositorySubscription: Subscription;
  private _treeConfigurationSubscription: Subscription;
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    route: ActivatedRoute, private _itemRepository: ItemRepository,
    private _dialogService: DialogService,
    private _versionControlService: VersionControlService,
    private _toastrService: ToastrService) {
    super(route);
  }
  
  public ngOnInit(): void {
    this._rootVersionControlRowActions.push(...this._versionControlRowActions);
    this.menuActions.push(new MenuAction('Delete', 'Deletes this Item',
      'fa fa-times delete-button', (row: TreeRow) => {
      return !row.itemProxy.internal;
      }, (row: TreeRow) => {
      this._dialogService.openCustomTextDialog('Confirm Deletion',
        'Are you sure you want to delete ' + row.itemProxy.item.name + '?', [
        'Cancel', 'Delete', 'Delete Recursively']).subscribe((result: any) => {
        if (result) {
          if (row.itemProxy === this._rootSubject.getValue()) {
            this._rootSubject.next(row.getRowParentProxy());
          }
          
          this._itemRepository.deleteItem(row.itemProxy, (2 === result));
        }
      });
    }));
    
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
        });
        
        this._rootSubject.next(this._absoluteRoot);
        
        this._route.params.subscribe((parameters: Params) => {
          if (this._synchronizeWithSelection) {
            this.showSelection();
          }
        });
        
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
  
  public toggleSelectionSynchronization(): void {
    this._synchronizeWithSelection = !this._synchronizeWithSelection;
    if (this._synchronizeWithSelection) {
      this.showSelection();
    }
  }
  
  public postTreeTraversalActivity(): void {
    this._changeDetectorRef.markForCheck();
  }
}