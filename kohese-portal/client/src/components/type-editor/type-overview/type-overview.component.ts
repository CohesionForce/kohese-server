import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { Observable ,  Subscription } from 'rxjs';

import { IconSelectorComponent } from '../icon-selector/icon-selector.component';
import { LocalTypeEditorComponent } from '../local-type-editor/local-type-editor.component';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';

@Component({
  selector: 'type-overview',
  templateUrl: './type-overview.component.html',
  styleUrls: ['./type-overview.component.scss'],
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
    this.dialogService.openComponentDialog(IconSelectorComponent, {
      data: {}
    }).afterClosed().subscribe((result: string) => {
      if ('\0' !== result) {
        this._koheseType.viewModelProxy.item.icon = result;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public changeParentType(type: string): void {
    this._koheseType.dataModelProxy.item.base = type;
    this._koheseType.dataModelProxy.item.parentId = type;
  }
  
  public addLocalType(): void {
    this.dialogService.openComponentDialog(LocalTypeEditorComponent, {
      data: {
        containingType: this._koheseType.dataModelProxy.item,
        view: this._koheseType.viewModelProxy.item
      },
      disableClose: true
    }).updateSize('90%', '90%').afterClosed().subscribe((localType: any) => {
      if (localType) {
        // Migration code
        let localTypes: Array<any> = this._koheseType.dataModelProxy.item.
          localTypes;
        if (!localTypes) {
          localTypes = this._koheseType.dataModelProxy.item.localTypes = [];
        }
        
        localTypes.push(localType);
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public editLocalType(localType: any): void {
    this.dialogService.openComponentDialog(LocalTypeEditorComponent, {
      data: {
        type: localType,
        containingType: this._koheseType.dataModelProxy.item,
        view: this._koheseType.viewModelProxy.item
      },
      disableClose: true
    }).updateSize('90%', '90%').afterClosed().subscribe((returnedLocalType:
      any) => {
      this._changeDetectorRef.markForCheck();
    });
  }
  
  public removeLocalType(localType: any): void {
    this.dialogService.openYesNoDialog('Remove ' + localType.name,
      'Are you sure that you want to remove ' + localType.name + '?').
      subscribe((selection: any) => {
      if (selection) {
        let localTypes: Array<any> = this._koheseType.dataModelProxy.item.
          localTypes;
        localTypes.splice(localTypes.indexOf(localType), 1);
        this._changeDetectorRef.markForCheck();
      }
    });
  }
}