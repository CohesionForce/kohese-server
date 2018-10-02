import {
  Component, Optional, Inject, OnInit, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChild, OnDestroy
  } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { BehaviorSubject ,  Subscription } from 'rxjs';
import * as JsDiff from 'diff';

import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ComparisonSideComponent } from './comparison-side.component';

@Component({
  selector: 'compare-items',
  templateUrl: './compare-items.component.html',
  styleUrls: ['./compare-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompareItemsComponent implements OnInit, OnDestroy {
  private _showDifferencesOnlySubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  get showDifferencesOnlySubject() {
    return this._showDifferencesOnlySubject;
  }

  get dialogParameters() {
    return this._dialogParameters;
  }

  @ViewChild('rightComparisonSide')
  private _rightComparisonSide: ComparisonSideComponent;
  @ViewChild('leftComparisonSide')
  private _leftComparisonSide: ComparisonSideComponent;
  
  private _rightSelectionSubscription: Subscription;
  private _leftSelectionSubscription: Subscription;
  
  public constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) private _dialogParameters: any,
    private _changeDetectorRef: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    if (this._dialogParameters) {
      let baseProxy: ItemProxy = this._dialogParameters['baseProxy'];
      if (baseProxy) {
        this._leftComparisonSide.whenSelectedObjectChanges(baseProxy).
          subscribe((baseVersions: Array<any>) => {
          let baseVersion: VersionDesignator = this._dialogParameters[
            'baseVersion'];
          if (baseVersion) {
            let versionId: string;
            if ((baseVersion as VersionDesignator) === VersionDesignator.
              STAGED_VERSION) {
              versionId = baseVersions['Staged'];
            } else if ((baseVersion as VersionDesignator) ===
              VersionDesignator.LAST_COMMITTED_VERSION) {
              let numberOfStates: number = Object.keys(baseProxy.status).
                length;
              if (numberOfStates > 0) {
                versionId = baseVersions[numberOfStates].commit;
              } else if (baseVersions.length > 1) {
                versionId = baseVersions[1].commit;
              }
            } 
            
            if (versionId) {
              this._leftComparisonSide.whenSelectedVersionChanges(baseProxy,
                versionId);
            }
          }
          });
      }
      
      let changeProxy: ItemProxy = this._dialogParameters['changeProxy'];
      if (changeProxy) {
        this._rightComparisonSide.whenSelectedObjectChanges(changeProxy).
          subscribe((changeVersions: Array<any>) => {
          let changeVersion: VersionDesignator = this._dialogParameters[
            'changeVersion'];
          if (changeVersion) {
            let versionId: string;
            if ((changeVersion as VersionDesignator) === VersionDesignator.
              STAGED_VERSION) {
              versionId = changeVersions['Staged'];
            } else if ((changeVersion as VersionDesignator) ===
              VersionDesignator.LAST_COMMITTED_VERSION) {
              let numberOfStates: number = Object.keys(changeProxy.status).
                length;
              if (numberOfStates > 0) {
                versionId = changeVersions[numberOfStates].commit;
              } else if (changeVersions.length > 0) {
                versionId = changeVersions[1].commit;
              }
            } 
            
            if (versionId) {
              this._rightComparisonSide.whenSelectedVersionChanges(changeProxy,
                versionId);
            }
          }
          });
      }
    }
    
    this._rightSelectionSubscription = this._rightComparisonSide.
      selectedObjectSubject.subscribe((object: any) => {
      this.compare();
      });
      
    this._leftSelectionSubscription = this._leftComparisonSide.
      selectedObjectSubject.subscribe((object: any) => {
      this.compare();
      });
  }
  
  public ngOnDestroy(): void {
    this._leftSelectionSubscription.unsubscribe();
    this._rightSelectionSubscription.unsubscribe();
  }

  public swapSides(): void {
    let rightSelectedObject: any = this._rightComparisonSide.
      selectedObjectSubject.getValue();
    let rightSelectedVersion: string = this._rightComparisonSide.
      selectedVersion;
    let leftSelectedObject: any = this._leftComparisonSide.
      selectedObjectSubject.getValue();
    let leftSelectedVersion: string = this._leftComparisonSide.selectedVersion;
    this._rightComparisonSide.whenSelectedVersionChanges(leftSelectedObject,
      leftSelectedVersion);
    this._leftComparisonSide.whenSelectedVersionChanges(rightSelectedObject,
      rightSelectedVersion);
  }

  public toggleShowingDifferencesOnly(): void {
    this._showDifferencesOnlySubject.next(!this._showDifferencesOnlySubject.
      getValue());
    this._rightComparisonSide.refresh();
    this._leftComparisonSide.refresh();
  }
  
  private compare(): void {
    let rightVersion: any = this._rightComparisonSide.selectedObjectSubject.
      getValue();
    let leftVersion: any = this._leftComparisonSide.selectedObjectSubject.
      getValue();
    
    let propertyNames: Array<string> = [];
    let rightProperties: Array<string> = Array.from(this._rightComparisonSide.
      propertyDifferenceMap.keys());
    for (let j: number = 0; j < rightProperties.length; j++) {
      propertyNames.push(rightProperties[j]);
    }
    
    let leftProperties: Array<string> = Array.from(this._leftComparisonSide.
      propertyDifferenceMap.keys());
    for (let j: number = 0; j < leftProperties.length; j++) {
      if (-1 === propertyNames.indexOf(leftProperties[j])) {
        propertyNames.push(leftProperties[j]);
      }
    }
    
    for (let j: number = 0; j < propertyNames.length; j++) {
      let rightPropertyValue: any = this._rightComparisonSide.
        getComparisonValue(propertyNames[j]);
      let leftPropertyValue: any = this._leftComparisonSide.getComparisonValue(
        propertyNames[j]);
      
      if (!rightVersion && leftVersion) {
        rightPropertyValue = leftPropertyValue;
      } else if (rightVersion && !leftVersion) {
        leftPropertyValue = rightPropertyValue;
      }
      
      let comparison: Array<any> = JsDiff.diffWords(leftPropertyValue,
        rightPropertyValue);
        
      let rightDifferenceArray: Array<any> = this._rightComparisonSide.
        propertyDifferenceMap.get(propertyNames[j]);
      if (rightDifferenceArray) {
        rightDifferenceArray.length = 0;
        rightDifferenceArray.push(...comparison);
      }
      
      let leftDifferenceArray: Array<any> = this._leftComparisonSide.
        propertyDifferenceMap.get(propertyNames[j]);
      if (leftDifferenceArray) {
        leftDifferenceArray.length = 0;
        leftDifferenceArray.push(...comparison);
      }
    }
      
    this._rightComparisonSide.refresh();
    this._leftComparisonSide.refresh();
  }
}

export enum VersionDesignator {
  STAGED_VERSION,
  LAST_COMMITTED_VERSION
}
