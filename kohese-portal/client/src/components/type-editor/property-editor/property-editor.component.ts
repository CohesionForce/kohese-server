import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DialogService } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';

@Component({
  selector: 'property-editor',
  templateUrl: './property-editor.component.html',
  styleUrls: ['./property-editor.component.scss']
})
export class PropertyEditorComponent implements OnInit, OnChanges {
  @Input()
  public type: KoheseType;
  public selectedPropertyId: string;
  public selectedInputType: string;
  public inputOptions: any = {
    type: '',
    allowMultiSelect: false
  };
  private initialized: boolean = false;
  
  constructor(private typeService: DynamicTypesService,
    private dialogService: DialogService) {
  }
  
  ngOnInit(): void {
    this.initialized = true;
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
      this.type.properties[name] = {
        displayName: name,
        inputType: ':{}',
        required: false,
        defaultValue: ''
      };
    });
  }
  
  delete(propertyId: string): void {
    this.dialogService.openYesNoDialog('Delete ' + propertyId,
      'Are you sure that you want to delete ' + propertyId + '?').
      subscribe((choiceValue: any) => {
      if (choiceValue) {
        delete this.type.properties[propertyId];
      }
    });
  }
}