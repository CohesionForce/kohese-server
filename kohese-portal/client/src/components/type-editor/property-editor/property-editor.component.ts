import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DialogService } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { UserInput } from '../../user-input/user-input.class';

@Component({
  selector: 'property-editor',
  templateUrl: './property-editor.component.html',
  styleUrls: ['./property-editor.component.scss']
})
export class PropertyEditorComponent implements OnInit, OnChanges {
  @Input()
  public type: KoheseType;
  public selectedPropertyId: string;

  get isMultivalued() {
    return this.type.fields[this.selectedPropertyId].type.
      startsWith('[');
  }
  set isMultivalued(isMultivalued: boolean) {
    let type: string = this.type.fields[this.selectedPropertyId].type;
    if (isMultivalued) {
      type = '[ ' + type + ' ]';
    } else {
      type = type.substring(2, type.length - 2);
    }

    this.type.fields[this.selectedPropertyId].type = type;
  }

  public inputOptions: any = {
    type: ''
  };
  private initialized: boolean = false;
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
  
  constructor(private typeService: DynamicTypesService,
    private dialogService: DialogService) {
  }
  
  ngOnInit(): void {
    this.initialized = true;
    for (let type in this.typeService.getKoheseTypes()) {
      this._types[type] = type;
    }
    this.userInputs = this.typeService.getUserInputTypes();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized) {
      if (changes['type']) {
        this.type = changes['type'].currentValue;
      }
    }
  }
  
  add(): void {
    this.dialogService.openInputDialog('Add Property', '', this.dialogService.
      INPUT_TYPES.TEXT, 'Name').afterClosed().subscribe((name: string) => {
      if (name) {
        this.type.fields[name] = {
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
      }
    });
  }
  
  delete(propertyId: string): void {
    this.dialogService.openYesNoDialog('Delete ' + propertyId,
      'Are you sure that you want to delete ' + propertyId + '?').
      subscribe((choiceValue: any) => {
      if (choiceValue) {
        delete this.type.fields[propertyId];
      }
    });
  }
}