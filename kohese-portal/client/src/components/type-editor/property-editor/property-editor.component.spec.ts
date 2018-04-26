import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module';

import { DialogService } from '../../../services/dialog/dialog.service';
import { PropertyEditorComponent } from './property-editor.component';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { KoheseType } from '../../../classes/UDT/KoheseType.class'
import { MockDataModel } from '../../../../mocks/data/MockDataModel';
import { MockViewData } from '../../../../mocks/data/MockViewData';
import * as ItemProxy from '../../../../../common/src/item-proxy';
import * as KoheseModel from '../../../../../common/src/KoheseModel';
import { PipesModule } from '../../../pipes/pipes.module';

describe('Component: Property Editor', ()=>{
  let propertyEditorComponent: PropertyEditorComponent;
  let propertyEditorFixture : ComponentFixture<PropertyEditorComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [PropertyEditorComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         ReactiveFormsModule,
         FormsModule,
         PipesModule
         ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: DynamicTypesService, useClass: MockDynamicTypesService},
        {provide: DialogService, useClass: MockDialogService}
      ]
    }).compileComponents();

    propertyEditorFixture = TestBed.createComponent(PropertyEditorComponent);
    propertyEditorComponent = propertyEditorFixture.componentInstance;
    propertyEditorComponent.koheseTypeStream = new BehaviorSubject<KoheseType>(
      new KoheseType(new KoheseModel(MockDataModel()), {
      'Item': new ItemProxy('KoheseView', MockViewData())
    }));
    propertyEditorComponent.selectedPropertyId = 'name';
    propertyEditorFixture.detectChanges();
    
  })

  it('instantiates the Property Editor component', ()=>{
    expect(propertyEditorComponent).toBeTruthy(); 
  });
  
  it('updates properties of types', () => {
    propertyEditorComponent.updateProperty(['views', 'form', 'inputType',
      'type'], 'Kurios Iesous');
    expect(propertyEditorComponent.koheseType.fields[propertyEditorComponent.
      selectedPropertyId].views['form'].inputType.type).toEqual(
      'Kurios Iesous');
  });
  
  it('converts type strings to their multivalued form, if appropriate', () => {
    propertyEditorComponent.multivalued = true;
    expect(propertyEditorComponent.convertTypeString('type')).toEqual(
      '[ type ]');
    
    propertyEditorComponent.multivalued = false;
    expect(propertyEditorComponent.convertTypeString('type')).toEqual('type');
  });
  
  it('determines whether two type strings represent the same type', () => {
    expect(propertyEditorComponent.areTypesSame('type', '[ type ]')).toEqual(
      true);
    
    expect(propertyEditorComponent.areTypesSame('[ type ]', 'type')).toEqual(
      false);
    
    expect(propertyEditorComponent.areTypesSame('type', 'type')).toEqual(
      true);
    
    expect(propertyEditorComponent.areTypesSame('type', 't')).toEqual(false);
  });
  
  it('determines and changes multivalued-ness of properties', () => {
    propertyEditorComponent.multivalued = true;
    expect(propertyEditorComponent.multivalued).toEqual(true);
    
    propertyEditorComponent.multivalued = false;
    expect(propertyEditorComponent.multivalued).toEqual(false);
  });
  
  it('changes whether a property is a relation', () => {
    propertyEditorComponent.changeRelationness(true);
    expect(propertyEditorComponent.koheseType.fields[propertyEditorComponent.
      selectedPropertyId].relation).toBeDefined();
    
    propertyEditorComponent.changeRelationness(false);
    expect(propertyEditorComponent.koheseType.fields[propertyEditorComponent.
      selectedPropertyId].relation).not.toBeDefined();
  });
  
  it('determines if two relations are equal', () => {
    let firstRelation: any = {
      kind: 'Kurios Iesous',
      foreignKey: 'Kurios Iesous'
    };
    
    let secondRelation: any = {
      kind: 'Anything else',
      foreignKey: 'Any other thing'
    };
    
    expect(propertyEditorComponent.areRelationsEqual(secondRelation,
      firstRelation)).toEqual(false);
  });
})