import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { UserInput } from '../../user-input/user-input.class';

@Component({
  selector: 'property-editor',
  templateUrl: './property-editor.component.html',
  styleUrls: ['./property-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyEditorComponent implements OnInit, OnDestroy {
  private _koheseTypeStream: Observable<KoheseType>;
  @Input('koheseTypeStream')
  set koheseTypeStream(koheseTypeStream: Observable<KoheseType>) {
    this._koheseTypeStream = koheseTypeStream;
  }
  
  private _koheseType: KoheseType;
  get koheseType() {
    return this._koheseType;
  }
  
  private _idProperties: any = {};
  get idProperties() {
    return this._idProperties;
  }
  
  public selectedPropertyId: string;

  get multivalued() {
    return this._koheseType.fields[this.selectedPropertyId].type.
      startsWith('[');
  }
  set multivalued(multivalued: boolean) {
    let property: any = this._koheseType.fields[this.selectedPropertyId];
    let type: string = property.type;
    if (multivalued) {
      type = '[ ' + type + ' ]';
    } else {
      type = type.substring(2, type.length - 2);
    }

    property.type = type;
    this._koheseType.updateProperty(this.selectedPropertyId, property);
    this._changeDetectorRef.markForCheck();
  }

  public inputOptions: any = {
    type: ''
  };
  userInputs : Array<UserInput>;
  private _types: any = {
    'Boolean': 'boolean',
    'Number': 'number',
    'String': 'string',
    'Object': 'object',
    'State': 'StateMachine'
  };
  get types() {
    return this._types;
  }
  
  private _showSplitPanes: boolean = false;
  get showSplitPanes() {
    return this._showSplitPanes;
  }
  
  private _koheseTypeStreamSubscription: Subscription;
  
  constructor(private typeService: DynamicTypesService,
    private dialogService: DialogService,
    private _changeDetectorRef: ChangeDetectorRef) {
  }
  
  ngOnInit(): void {
    let koheseTypes: any = this.typeService.getKoheseTypes();
    for (let type in koheseTypes) {
      this._types[type] = type;
      for (let propertyName in koheseTypes[type].dataModelProxy.item.properties) {
        if (koheseTypes[type].dataModelProxy.item.properties[propertyName].id) {
          if (!this._idProperties[type]) {
            this._idProperties[type] = [];
          }
          
          this._idProperties[type].push(propertyName);
        }
      }
    }
    this.userInputs = this.typeService.getUserInputTypes();
    this._koheseTypeStreamSubscription = this._koheseTypeStream.subscribe(
      (koheseType: KoheseType) => {
      this._koheseType = koheseType;
      this._changeDetectorRef.markForCheck();
    });
    
    setTimeout(() => {
      this._showSplitPanes = true;
      this._changeDetectorRef.markForCheck();
    }, 1500);
  }
  
  public ngOnDestroy(): void {
    this._koheseTypeStreamSubscription.unsubscribe();
  }
  
  add(): void {
    this.dialogService.openInputDialog('Add Property', '', this.dialogService.
      INPUT_TYPES.TEXT, 'Name').afterClosed().subscribe((name: string) => {
      if (name) {
        this._koheseType.addProperty(name);
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  delete(propertyId: string): void {
    this.dialogService.openYesNoDialog('Delete ' + propertyId,
      'Are you sure that you want to delete ' + propertyId + '?').
      subscribe((choiceValue: any) => {
      if (choiceValue) {
        this._koheseType.deleteProperty(propertyId);
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public updateProperty(propertyIdSequence: Array<string>, value: any): void {
    let property: any = this._koheseType.fields[this.selectedPropertyId];
    let subProperty: any = property;
    for (let j: number = 0; j < propertyIdSequence.length - 1; j++) {
      subProperty = subProperty[propertyIdSequence[j]];
    }
    subProperty[propertyIdSequence[propertyIdSequence.length - 1]] = value;
    this._koheseType.updateProperty(this.selectedPropertyId, property);
    this._changeDetectorRef.markForCheck();
  }
  
  public convertTypeString(type: string): string {
    if (this._koheseType.fields[this.selectedPropertyId].type.startsWith(
      '[')) {
      type = '[ ' + type + ' ]';
    }
    
    return type;
  }
  
  public areTypesSame(option: any, selection: any): boolean {
    let selectionType: string;
    if (selection.startsWith('[')) {
      selectionType = selection.substring(2, selection.length - 2);
    } else {
      selectionType = selection;
    }
    
    return (option === selectionType);
  }
  
  public changeRelationness(checked: boolean): void {
    let property: any = this._koheseType.fields[this.selectedPropertyId];
    if (checked) {
      property.relation = {
        kind: 'Item',
        foreignKey: 'id'
      };
    } else {
      delete property.relation;
    }
    this._koheseType.updateProperty(this.selectedPropertyId, property);
    this._changeDetectorRef.markForCheck();
  }
  
  public areRelationsEqual(option: any, selection: any): boolean {
    return ((option.kind === selection.kind) && (option.foreignKey ===
      selection.foreignKey));
  }
}