import { Component, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';

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
    return typeof this._selectedVersionObject;
  }
}