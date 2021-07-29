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
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChildren,
  QueryList, Input, OnInit, OnDestroy } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { BehaviorSubject, Subscription } from 'rxjs';

// Other External Dependencies

// Kohese
import { DialogService } from '../../../services/dialog/dialog.service';
import { CompareItemsComponent } from '../item-comparison/compare-items.component';
import { Comparison, Property } from '../comparison.class';

@Component({
  selector: 'change-summary',
  templateUrl: './change-summary.component.html',
  styleUrls: ['./change-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeSummaryComponent implements OnInit, OnDestroy {
  private _comparisonsSubject: BehaviorSubject<Array<Comparison>>;
  get comparisonsSubject() {
    return this._comparisonsSubject;
  }
  @Input('comparisonsSubject')
  set comparisonsSubject(comparisonsSubject:
    BehaviorSubject<Array<Comparison>>) {
    this._comparisonsSubject = comparisonsSubject;
  }

  private _expanded: boolean = false;
  get expanded() {
    return this._expanded;
  }
  @Input('expanded')
  set expanded(expanded: boolean) {
    this._expanded = expanded;
  }

  private _showDifferencesOnlySubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);
  get showDifferencesOnlySubject() {
    return this._showDifferencesOnlySubject;
  }
  @Input('showDifferencesOnlySubject')
  set showDifferencesOnlySubject(showDifferencesOnlySubject:
    BehaviorSubject<boolean>) {
    this._showDifferencesOnlySubject = showDifferencesOnlySubject;
  }

  @ViewChildren(MatExpansionPanel)
  private _differencePanels: QueryList<MatExpansionPanel>;

  get Comparison() {
    return Comparison;
  }

  private _comparisonsSubscription: Subscription;

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService) {
  }

  public ngOnInit(): void {
    this._comparisonsSubscription = this._comparisonsSubject.subscribe((
      comparisons: Array<Comparison>) => {
      this._changeDetectorRef.markForCheck();
    });
  }

  public ngOnDestroy(): void {
    this._comparisonsSubscription.unsubscribe();
  }

  public expandAll(): void {
    let differencePanels: Array<MatExpansionPanel> = this._differencePanels.
      toArray();
    for (let j: number = 0; j < differencePanels.length; j++) {
      differencePanels[j].open();
    }
  }

  public collapseAll(): void {
    let differencePanels: Array<MatExpansionPanel> = this._differencePanels.
      toArray();
    for (let j: number = 0; j < differencePanels.length; j++) {
      differencePanels[j].close();
    }
  }

  public openComparisonDialog(comparison: Comparison): void {
    this._dialogService.openComponentDialog(CompareItemsComponent, {
      data: {
        //baseProxy: comparison.baseObject,
        //changeProxy: comparison.changeObject,
        editable: false
      }
    }).updateSize('90%', '90%');
  }

  public hasChanges(comparison: Comparison): boolean {
    let hasChanges: boolean = false;
    if (comparison.propertyDiffPending) {
      // Since this detection may occur more than once, only request the detail diff
      // if it is not already in progess
      if(!comparison.propertyDiffInProgress){
        // console.log('^^^ Getting change detaila...');
        comparison.compareProperties().then(() => {
          // console.log('^^^ Got change detaila...');
          this._changeDetectorRef.detectChanges();
        });
      }
      return false;
    }
    let properties: Array<Property> = Array.from(comparison.
      propertyComparisonMap.keys());
    for (let j: number = 0; j < properties.length; j++) {
      let changes: Array<any> = comparison.propertyComparisonMap.get(
        properties[j]);
      if ((changes.length > 1) || changes[0].added || changes[0].removed) {
        hasChanges = true;
        break;
      }
    }

    return hasChanges;
  }
}
