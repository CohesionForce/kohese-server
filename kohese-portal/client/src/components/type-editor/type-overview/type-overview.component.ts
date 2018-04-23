import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { IconSelectorComponent } from '../icon-selector/icon-selector.component';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';

@Component({
  selector: 'type-overview',
  templateUrl: './type-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypeOverviewComponent implements OnInit, OnDestroy {
  private _koheseTypeStream: Observable<KoheseType>;
  @Input('koheseTypeStream')
  set koheseTypeStream(koheseTypeStream: Observable<KoheseType>) {
    this._koheseTypeStream = koheseTypeStream;
  }
  
  private _koheseType: KoheseType;
  get koheseType() {
    return this._koheseType;
  }
  
  public filteredTypes: any;
  
  private _koheseTypeStreamSubscription: Subscription;
  
  constructor(private dialogService: DialogService,
    private typeService: DynamicTypesService,
    private _changeDetectorRef: ChangeDetectorRef) {
  }
  
  ngOnInit(): void {
    this._koheseTypeStreamSubscription = this._koheseTypeStream.subscribe(
      (koheseType: KoheseType) => {
      this._koheseType = koheseType;
      this.filteredTypes = {};
      let types: any = this.typeService.getKoheseTypes();
      for (let typeName in types) {
        if (this._koheseType.dataModelProxy.item.name !== typeName) {
          this.filteredTypes[typeName] = types[typeName];
        }
      }
      
      this._changeDetectorRef.markForCheck();
    });
  }
  
  public ngOnDestroy(): void {
    this._koheseTypeStreamSubscription.unsubscribe();
  }
  
  openIconSelectionDialog(): void {
    this.dialogService.openComponentDialog(IconSelectorComponent, {}).
      afterClosed().subscribe((result: string) => {
      if ('\0' !== result) {
        this._koheseType.viewModelProxy.item.icon = result;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
}