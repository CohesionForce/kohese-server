import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { Observable ,  Subscription } from 'rxjs';
import * as Uuid from 'uuid/v1';

import { IconSelectorComponent } from '../icon-selector/icon-selector.component';
import { LocalTypeEditorComponent } from '../local-type-editor/local-type-editor.component';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { TableDefinition } from '../TableDefinition.interface';

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
  
  get Object() {
    return Object;
  }
  
  constructor(private dialogService: DialogService,
    private typeService: DynamicTypesService,
    private _changeDetectorRef: ChangeDetectorRef) {
  }
  
  ngOnInit(): void {
    this._koheseTypeStreamSubscription = this._koheseTypeStream.subscribe(
      (koheseType: KoheseType) => {
      this._koheseType = koheseType;
      
      if (this._koheseType) {
        this.filteredTypes = {};
        let types: any = this.typeService.getKoheseTypes();
        for (let typeName in types) {
          if (this._koheseType.dataModelProxy.item.name !== typeName) {
            this.filteredTypes[typeName] = types[typeName];
          }
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
        this.typeService.localTypeMap.get(this._koheseType.dataModelProxy.item.
          name).push(localType.name);
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
        let localTypeNames: Array<string> = this.typeService.localTypeMap.get(
          this._koheseType.dataModelProxy.item.name);
        localTypeNames.splice(localTypeNames.indexOf(localType.name), 1);
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public addTableDefinition(): void {
    this.dialogService.openInputDialog('Add Table Definition', '',
      DialogComponent.INPUT_TYPES.TEXT, 'Name', '', (input: any) => {
      return !!input;
    }).afterClosed().subscribe((name: any) => {
      if (name) {
        let id: string = (<any> Uuid).default();
        this._koheseType.viewModelProxy.item.tableDefinitions[id] = {
          id: id,
          name: name,
          columns: [],
          expandedFormat: {
            column1: [],
            column2: [],
            column3: [],
            column4: []
          }
        };
        
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public renameTableDefinition(tableDefinitionId: string): void {
    let tableDefinition: TableDefinition = this._koheseType.viewModelProxy.
      item.tableDefinitions[tableDefinitionId];
    this.dialogService.openInputDialog('Rename ' + tableDefinition.name, '',
      DialogComponent.INPUT_TYPES.TEXT, 'Name', tableDefinition.name, (input:
      any) => {
      return !!input;
    }).afterClosed().subscribe((name: any) => {
      if (name) {
        tableDefinition.name = name;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public removeTableDefinition(tableDefinitionId: string): void {
    delete this._koheseType.viewModelProxy.item.tableDefinitions[
      tableDefinitionId];
    this._changeDetectorRef.markForCheck();
  }
}