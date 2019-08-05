import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, OnInit, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

export enum VersionSelection {
  LOCAL = 'Local', REMOTE = 'Remote'
}

export class Difference {
  get element() {
    return this._element;
  }
  
  private _versionSelection: VersionSelection;
  get versionSelection() {
    return this._versionSelection;
  }
  set versionSelection(versionSelection: VersionSelection) {
    this._versionSelection = versionSelection;
  }

  get localValue() {
    return this._localValue;
  }
  
  get remoteValue() {
    return this._remoteValue;
  }
  
  get subDifferences() {
    return this._subDifferences;
  }
  
  public constructor(private _element: any, private _localValue: string,
    private _remoteValue: string, private _subDifferences: Array<Difference>) {
  }
}

@Component({
  selector: 'merge',
  templateUrl: './merge.component.html',
  styleUrls: ['./merge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MergeComponent implements OnInit {
  private _differences: Array<Difference>;
  get differences() {
    return this._differences;
  }
  @Input('differences')
  set differences(differences: Array<Difference>) {
    this._differences = differences;
  }
  
  private _getChildren: (element: any) => Array<any> = (element: any) => {
    let children: Array<any>;
    if (element === this._differences) {
      children = this._differences;
    } else {
      children = (element as Difference).subDifferences;
    }
    
    return children;
  };
  get getChildren() {
    return this._getChildren;
  }
  
  private _getText: (element: any) => string = (element: any) => {
    let difference: Difference = (element as Difference);
    return difference.element.toString() + (difference.versionSelection ?
      (' ' + difference.versionSelection) : '');
  };
  get getText() {
    return this._getText;
  }
  
  private _selectedDifference: Difference;
  get selectedDifference() {
    return this._selectedDifference;
  }
  
  get VersionSelection() {
    return VersionSelection;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<MergeComponent>) {
  }
  
  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._differences = this._data['differences'];
    }
  }
  
  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }
  
  public differenceSelected(difference: Difference): void {
    this._selectedDifference = difference;
    this._changeDetectorRef.markForCheck();
  }
  
  public canMerge(): boolean {
    let differenceStack: Array<Difference> = [...this._differences];
    while (differenceStack.length > 0) {
      let difference: Difference = differenceStack.pop();
      if (!difference.versionSelection) {
        return false;
      }
      
      differenceStack.push(...difference.subDifferences);
    }
    
    return true;
  }
}
