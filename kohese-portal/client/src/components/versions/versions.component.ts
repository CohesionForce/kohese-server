import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';

import { Commit } from '../tree/commit-tree/commit-tree.component';
import { Difference } from '../compare-items/commit-comparison/commit-comparison.component';

@Component({
  selector: 'versions',
  templateUrl: './versions.component.html',
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class VersionsComponent {
  private _selectedVersionObject: any;
  get selectedVersionObject() {
    return this._selectedVersionObject;
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
    } else if (this._selectedVersionObject instanceof Difference) {
      type = 'Difference';
    }
    
    return type;
  }
}