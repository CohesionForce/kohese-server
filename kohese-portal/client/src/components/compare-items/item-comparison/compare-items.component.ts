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
import { Component, Optional, Inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

// Other External Dependencies

// Kohese
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TreeService } from '../../../services/tree/tree.service';
import { TreeComponent } from '../../tree/tree.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ItemCache } from '../../../../../common/src/item-cache';
import { Compare } from '../compare.class';
import { Comparison } from '../comparison.class';

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
  set selectedBaseVersion(selectedBaseVersion: string) {
    this._selectedBaseVersion = selectedBaseVersion;
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
  set selectedChangeVersion(selectedChangeVersion: string) {
    this._selectedChangeVersion = selectedChangeVersion;
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

  get navigationService() {
    return this._navigationService;
  }

  public constructor(
                      @Optional() @Inject(MAT_DIALOG_DATA) private _dialogParameters: any,
                      private _changeDetectorRef: ChangeDetectorRef,
                      private _itemRepository: ItemRepository,
                      private _dynamicTypesService: DynamicTypesService,
                      private _dialogService: DialogService,
                      private _navigationService: NavigationService,
                      private treeService: TreeService
  ) {}

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
          await this.compare();
        })();
      }
    }
  }

  public openProxySelectionDialog(proxySubject: BehaviorSubject<ItemProxy>):
    void {
    this._dialogService.openComponentDialog(TreeComponent, {
      data: {
        root: TreeConfiguration.getWorkingTree().getRootProxy(),
        getTitle: {
          action: 'Choose an Item to Compare Against',
          name: ''
        },
        getChildren: (element: any) => {
          return (element as ItemProxy).children;
        },
        getParent: (element: any) => {
          return (element as ItemProxy).parentProxy;
        },
        getText: (element: any) => {
          return (element as ItemProxy).item.name;
        },
        getIcon: (element: any) => {
          return (element as ItemProxy).model.view.item.icon;
        },
        isFavorite: (element: any) => {
          return (
            (element as ItemProxy).item.favorite ? (element as ItemProxy).item.favorite : false);
        },
        selection: [proxySubject.getValue()],
        quickSelectElements: this.treeService.getRecentProxies()
      }
    }).updateSize('90%', '90%').afterClosed().subscribe((selection:
      Array<any>) => {
      if (selection) {
        this.proxySelectionChanged(proxySubject, selection[0]);
      }
    });
  }

  public proxySelectionChanged(proxySubject: BehaviorSubject<ItemProxy>,
    proxy: ItemProxy): Promise<Array<any>> {
    return new Promise<Array<any>>(async (resolve: (history:
      Array<any>) => void, reject: () => void) => {
      let history: Array<any> = await this._itemRepository.getHistoryFor(proxy);
      if (0 === proxy.vcStatus.statusArray.filter((status: string) => {
        return status.startsWith('WT');
      }).length && (history.length > 0)) {
        /* If there are no unstaged changes to the selected Item, change the
        commit ID of the most recent commit that included that Item to
        'Unstaged' to operate on the working tree version of that Item. */
        history[0].commit = 'Unstaged';
      }

      if (proxySubject === this._baseProxySubject) {
        this._selectedBaseVersion = '';
      } else {
        this._selectedChangeVersion = '';
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

        if (proxySubject === this._baseProxySubject) {
          this._selectedBaseVersion = 'Staged';
        } else {
          this._selectedChangeVersion = 'Staged';
        }
      }
      history.splice(0, 0, ...uncommittedVersions);

      if (proxySubject === this._baseProxySubject) {
        if (!this._selectedBaseVersion) {
          this._selectedBaseVersion = history[0].commit;
          this._baseVersions = history;
        }
      } else {
        if (!this._selectedChangeVersion) {
          this._selectedChangeVersion = history[0].commit;
          this._changeVersions = history;
        }
      }

      proxySubject.next(proxy);
      await this.compare();

      resolve(history);
    });
  }

  public compare(): Promise<void> {
    if (this._selectedBaseVersion && this._selectedChangeVersion) {
      return new Promise<void>(async (resolve: () => void, reject: () => void) => {
        let itemCache: ItemCache = ItemCache.getItemCache();
        let baseProxy = this._baseProxySubject.getValue();
        let baseItemId = baseProxy.item.id;
        let baseBlob;
        let baseBlobKind;
        // TODO: Add support for staged
        if (this._selectedBaseVersion === 'Unstaged') {
          baseBlob = baseProxy.cloneItemAndStripDerived();
          baseBlobKind = baseProxy.kind;
        } else {
          let baseTreeHashMap = await itemCache.getTreeHashMap(this._selectedBaseVersion);
          if (baseTreeHashMap) {
            let baseBlobOID = baseTreeHashMap[baseItemId].oid;
            baseBlob = await itemCache.getBlob(baseBlobOID);
            baseBlobKind = baseTreeHashMap[baseItemId].kind;
          }
        }

        let changeProxy = this._changeProxySubject.getValue();
        let changeItemId = changeProxy.item.id;
        let changeBlob;
        let changeBlobKind;
        // TODO: Add support for staged
        if (this._selectedChangeVersion === 'Unstaged') {
          changeBlob = changeProxy.cloneItemAndStripDerived();
          changeBlobKind = changeProxy.kind;
        } else {
          let changeTreeHashMap = await itemCache.getTreeHashMap(this._selectedChangeVersion);
          if (changeTreeHashMap){
            let changeBlobOID = changeTreeHashMap[changeItemId].oid;
            changeBlob = await itemCache.getBlob(changeBlobOID);
            changeBlobKind = changeTreeHashMap[changeItemId].kind;
          }
        }

        this._comparison = await Compare.compareItems(
          baseItemId,
          baseBlobKind,
          baseBlob,
          changeItemId,
          changeBlobKind,
          changeBlob,
          this._dynamicTypesService);
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
