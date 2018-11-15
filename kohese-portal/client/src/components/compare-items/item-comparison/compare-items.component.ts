import {
  Component, Optional, Inject, OnInit, ChangeDetectionStrategy,
  ChangeDetectorRef
  } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ItemCache } from '../../../../../common/src/item-cache';
import { Compare } from '../compare.class';
import { Comparison } from '../comparison.class';
import { ProxySelectorDialogComponent } from '../../user-input/k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';

@Component({
  selector: 'compare-items',
  templateUrl: './compare-items.component.html',
  styleUrls: ['./compare-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompareItemsComponent implements OnInit {
  private _baseProxySubject: BehaviorSubject<ItemProxy> =
    new BehaviorSubject<ItemProxy>(undefined);
  get baseProxySubject() {
    return this._baseProxySubject;
  }
  
  private _selectedBaseVersion: string;
  get selectedBaseVersion() {
    return this._selectedBaseVersion;
  }
  
  private _baseVersions: Array<any> = [];
  get baseVersions() {
    return this._baseVersions;
  }
  
  private _changeProxySubject: BehaviorSubject<ItemProxy> =
    new BehaviorSubject<ItemProxy>(undefined);
  get changeProxySubject() {
    return this._changeProxySubject;
  }
  
  private _selectedChangeVersion: string;
  get selectedChangeVersion() {
    return this._selectedChangeVersion;
  }
  
  private _changeVersions: Array<any> = [];
  get changeVersions() {
    return this._changeVersions;
  }
  
  private _comparison: Comparison;
  get comparison() {
    return this._comparison;
  }
  
  private _showDifferencesOnlySubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);
  get showDifferencesOnlySubject() {
    return this._showDifferencesOnlySubject;
  }

  get dialogParameters() {
    return this._dialogParameters;
  }

  public constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) private _dialogParameters: any,
    private _changeDetectorRef: ChangeDetectorRef, private _itemRepository:
    ItemRepository, private _dynamicTypesService: DynamicTypesService,
    private _dialogService: DialogService) {
  }

  public ngOnInit(): void {
    if (this._dialogParameters) {
      let baseProxyProcessingPromise: Promise<void>;
      let baseProxy: ItemProxy = this._dialogParameters['baseProxy'];
      if (baseProxy) {
        baseProxyProcessingPromise = new Promise<void>(async (resolve:
          () => void, reject: () => void) => {
          let baseVersions: Array<any> = await this.proxySelectionChanged(this.
            _baseProxySubject, baseProxy);
          let baseVersion: VersionDesignator = this._dialogParameters[
            'baseVersion'];
          if (baseVersion) {
            if ((baseVersion as VersionDesignator) === VersionDesignator.
              STAGED_VERSION) {
              this._selectedBaseVersion = baseVersions['Staged'];
            } else if ((baseVersion as VersionDesignator) ===
              VersionDesignator.LAST_COMMITTED_VERSION) {
              let numberOfStates: number = baseProxy.vcStatus.statusArray.length;
              if (numberOfStates > 0) {
                this._selectedBaseVersion = baseVersions[numberOfStates].commit;
              } else if (baseVersions.length > 1) {
                this._selectedBaseVersion = baseVersions[1].commit;
              }
            }
          }
          
          resolve();
        });
      }
      
      let changeProxyProcessingPromise: Promise<void>;
      let changeProxy: ItemProxy = this._dialogParameters['changeProxy'];
      if (changeProxy) {
        changeProxyProcessingPromise = new Promise<void>(async (resolve:
          () => void, reject: () => void) => {
          let changeVersions: Array<any> = await this.proxySelectionChanged(
            this._changeProxySubject, changeProxy);
          let changeVersion: VersionDesignator = this._dialogParameters[
            'changeVersion'];
          if (changeVersion) {
            if ((changeVersion as VersionDesignator) === VersionDesignator.
              STAGED_VERSION) {
              this._selectedChangeVersion = changeVersions['Staged'];
            } else if ((changeVersion as VersionDesignator) ===
              VersionDesignator.LAST_COMMITTED_VERSION) {
              let numberOfStates: number = changeProxy.vcStatus.statusArray.length;
              if (numberOfStates > 0) {
                this._selectedChangeVersion = changeVersions[numberOfStates].commit;
              } else if (changeVersions.length > 0) {
                this._selectedChangeVersion = changeVersions[1].commit;
              }
            }
          }
          
          resolve();
        });
      }
      
      if (baseProxyProcessingPromise && changeProxyProcessingPromise) {
        (async () => {
          await Promise.all([baseProxyProcessingPromise,
            changeProxyProcessingPromise]);
          this.compare(this._selectedBaseVersion, this._selectedChangeVersion);
        })();
      }
    }
  }
  
  public openProxySelectionDialog(proxySubject: BehaviorSubject<ItemProxy>):
    void {
    this._dialogService.openComponentDialog(ProxySelectorDialogComponent, {
      data: {
        selected: proxySubject.getValue(),
        allowMultiSelect : false
      }
    }).updateSize('70%', '70%').afterClosed().subscribe((selection: any) => {
      if (selection) {
        this.proxySelectionChanged(proxySubject, selection);
      }
    });
  }
  
  public proxySelectionChanged(proxySubject: BehaviorSubject<ItemProxy>,
    proxy: ItemProxy): Promise<Array<any>> {
    return new Promise<Array<any>>(async (resolve: (history:
      Array<any>) => void, reject: () => void) => {
      let history: Array<any> = await this._itemRepository.getHistoryFor(proxy).
        toPromise();
      if (0 === proxy.vcStatus.statusArray.filter((status: string) => {
        return status.startsWith('WT');
      }).length && (history.length > 0)) {
        /* If there are no unstaged changes to the selected Item, change the
        commit ID of the most recent commit that included that Item to
        'Unstaged' to operate on the working tree version of that Item. */
        history[0].commit = 'Unstaged';
      }
      let uncommittedVersions: Array<any> = [];
      if (proxy.vcStatus.statusArray.filter((status: string) => {
        return status.startsWith('WT');
      }).length > 0) {
        uncommittedVersions.push({
          commit: 'Unstaged',
          message: 'Unstaged'
        });
      }
  
      if (proxy.vcStatus.statusArray.filter((status: string) => {
        return status.startsWith('INDEX');
      }).length > 0) {
        uncommittedVersions.push({
          commit: 'Staged',
          message: 'Staged'
        });
      }
      history.splice(0, 0, ...uncommittedVersions);
      
      if (proxySubject === this._baseProxySubject) {
        this._selectedBaseVersion = 'Unstaged';
        this._baseVersions = history;
      } else {
        this._selectedChangeVersion = 'Unstaged';
        this._changeVersions = history;
      }
      
      proxySubject.next(proxy);
      await this.compare(this._selectedBaseVersion, this._selectedChangeVersion);
      
      resolve(history);
    });
  }
  
  public compare(baseCommitId: string, changeCommitId: string): Promise<void> {
    if (baseCommitId && changeCommitId) {
      return new Promise<void>(async (resolve: () => void, reject:
        () => void) => {
        let itemCache: ItemCache = TreeConfiguration.getItemCache();
        this._comparison = await Compare.compareItems(this.
          _baseProxySubject.getValue().item.id, await itemCache.getTreeHashMap(
          baseCommitId), this._changeProxySubject.getValue().item.id,
          await itemCache.getTreeHashMap(changeCommitId), this.
          _dynamicTypesService);
        this._changeDetectorRef.markForCheck();
        
        resolve();
      });
    } else {
      return Promise.resolve();
    }
  }

  public toggleShowingDifferencesOnly(): void {
    this._showDifferencesOnlySubject.next(!this._showDifferencesOnlySubject.
      getValue());
    this._changeDetectorRef.markForCheck();
  }
}

export enum VersionDesignator {
  STAGED_VERSION,
  LAST_COMMITTED_VERSION
}
