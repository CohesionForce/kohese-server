import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Commit } from '../tree/commit-tree/commit-tree.component';
import { Comparison } from '../compare-items/comparison.class';

@Component({
  selector: 'versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class VersionsComponent {
  private _selectedVersionObject: any;
  get selectedVersionObject() {
    return this._selectedVersionObject;
  }
  
  private _comparisonsSubject: BehaviorSubject<Array<Comparison>> =
    new BehaviorSubject<Array<Comparison>>([]);
  get comparisonsSubject() {
    return this._comparisonsSubject;
  }
  
  get showDifferencesOnly() {
    return true;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }
  
  public commitTreeRowSelected(object: any): void {
    this._selectedVersionObject = object;
  }
  
  public getSelectionType(): string {
    let type: string = '';
    if (this._selectedVersionObject instanceof Commit) {
      type = 'Commit';
      this._comparisonsSubject.next(this._selectedVersionObject.comparisons);
    } else if (this._selectedVersionObject instanceof Comparison) {
      type = 'Comparison';
    }
    
    return type;
  }
}