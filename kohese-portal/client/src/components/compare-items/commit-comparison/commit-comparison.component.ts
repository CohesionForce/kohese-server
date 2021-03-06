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
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

// Other External Dependencies

// Kohese
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { Comparison } from '../comparison.class';
import { Compare } from '../compare.class';
import { ItemCache } from '../../../../../common/src/item-cache';

@Component({
  selector: 'commit-comparison',
  templateUrl: './commit-comparison.component.html',
  styleUrls: ['./commit-comparison.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommitComparisonComponent {
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

  private _comparisonsSubject: BehaviorSubject<Array<Comparison>> =
    new BehaviorSubject<Array<Comparison>>([]);
  get comparisonsSubject() {
    return this._comparisonsSubject;
  }

  get data() {
    return this._data;
  }

  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dynamicTypesService: DynamicTypesService) {
  }

  public ngOnInit(): void {
    if (this._data) {
      let commitMap = ItemCache.getItemCache().getCommits();
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

    this.compareCommits().then(() => {
      console.log('^^^ Compare commits is finished');
    });
  }

  public async compareCommits() : Promise<void> {
    let comparisons: Array<Comparison> = this._comparisonsSubject.getValue();
    comparisons.length = 0;

    console.log('^^^ Comparison compareCommits called...')

    comparisons.push(...await Compare.compareCommits(this._baseCommitId, this.
      _changeCommitId, this._dynamicTypesService));
    this._comparisonsSubject.next(comparisons);
  }
}
