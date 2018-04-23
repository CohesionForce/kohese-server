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
  
  public selectedPropertyId: string;

  get isMultivalued() {
    return this._koheseType.fields[this.selectedPropertyId].type.
      startsWith('[');
  }
  set isMultivalued(isMultivalued: boolean) {
    let type: string = this._koheseType.fields[this.selectedPropertyId].type;
    if (isMultivalued) {
      type = '[ ' + type + ' ]';
    } else {
      type = type.substring(2, type.length - 2);
    }

    this._koheseType.fields[this.selectedPropertyId].type = type;
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
  
  private _koheseTypeStreamSubscription: Subscription;
  
  constructor(private typeService: DynamicTypesService,
    private dialogService: DialogService,
    private _changeDetectorRef: ChangeDetectorRef) {
  }
  
  ngOnInit(): void {
    for (let type in this.typeService.getKoheseTypes()) {
      this._types[type] = type;
    }
    this.userInputs = this.typeService.getUserInputTypes();
    this._koheseTypeStreamSubscription = this._koheseTypeStream.subscribe(
      (koheseType: KoheseType) => {
      this._koheseType = koheseType;
      this._changeDetectorRef.markForCheck();
    });
  }
  
  public ngOnDestroy(): void {
    this._koheseTypeStreamSubscription.unsubscribe();
  }
  
  add(): void {
    this.dialogService.openInputDialog('Add Property', '', this.dialogService.
      INPUT_TYPES.TEXT, 'Name').afterClosed().subscribe((name: string) => {
      if (name) {
        this._koheseType.fields[name] = {
          type: 'boolean',
          required: false,
          relation: false,
          views: {
            'form': {
              displayName: name,
              inputType: {
                type: '',
                options: {}
              }
            }
          }
        };
        this._koheseType.synchronizeModels();
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  delete(propertyId: string): void {
    this.dialogService.openYesNoDialog('Delete ' + propertyId,
      'Are you sure that you want to delete ' + propertyId + '?').
      subscribe((choiceValue: any) => {
      if (choiceValue) {
        delete this._koheseType.fields[propertyId];
        this._koheseType.synchronizeModels();
        this._changeDetectorRef.markForCheck();
      }
    });
  }
}