import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { Observable ,  Subscription } from 'rxjs';

import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { StateMachineEditorComponent } from '../../state-machine-editor/state-machine-editor.component';
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
    return Array.isArray(this._koheseType.fields[this.selectedPropertyId].type);
  }
  set multivalued(multivalued: boolean) {
    let property: any = this._koheseType.fields[this.selectedPropertyId];
    let type: any = property.type;
    if (multivalued) {
      type = [type];
    } else {
      type = type[0];
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

  // Work-around for angular-split defect
  private _showSplitPanes: boolean = false;
  get showSplitPanes() {
    return this._showSplitPanes;
  }
  set showSplitPanes(showSplitPanes: boolean) {
    setTimeout(() => {
      this._showSplitPanes = true;
      this._changeDetectorRef.markForCheck();
    });
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
      if (koheseType) {
        let localTypes: Array<any>;
        if (this._koheseType) {
          localTypes = this._koheseType.dataModelProxy.item.
            localTypes;
          for (let j: number = 0; j < localTypes.length; j++) {
            delete this._types[localTypes[j].name];
          }
        }
        
        this._koheseType = koheseType;
        localTypes = this._koheseType.dataModelProxy.item.
          localTypes;
        for (let j: number = 0; j < localTypes.length; j++) {
          this._types[localTypes[j].name] = localTypes[j].name;
        }
        
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  public ngOnDestroy(): void {
    this._koheseTypeStreamSubscription.unsubscribe();
  }

  add(): void {
    this.dialogService.openInputDialog('Add Property', '', DialogComponent.
      INPUT_TYPES.TEXT, 'Name', '').afterClosed().subscribe((name: string) => {
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

  public convertTypeString(type: any): string {
    if (Array.isArray(this._koheseType.fields[this.selectedPropertyId].type)){
      type = [type];
    }

    return type;
  }

  public openStateMachineEditor(): void {
    let stateMachine: any = this._koheseType.fields[this.selectedPropertyId].
      properties;
    if (stateMachine) {
      stateMachine = JSON.parse(JSON.stringify(stateMachine));
    } else {
      stateMachine = {
        state: {},
        transition: {}
      };
    }

    this.dialogService.openComponentDialog(StateMachineEditorComponent, {
      data: {
        stateMachine: stateMachine,
        defaultState: this._koheseType.fields[this.selectedPropertyId].default
      },
      disableClose: true
    }).updateSize('70%', '70%').afterClosed().subscribe((data: any) => {
      if (data) {
        this.updateProperty(['properties'], data.stateMachine);
        this.updateProperty(['default'], data.defaultState);
      }
    });
  }

  public areTypesSame(option: any, selection: any): boolean {
    let selectionType: any;
    if (Array.isArray(selection)) {
      selectionType = selection[0];
    } else {
      selectionType = selection;
    }

    return (option === selectionType);
  }

  public changeRelationness(checked: boolean): void {
    const property: any = this._koheseType.fields[this.selectedPropertyId];
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
