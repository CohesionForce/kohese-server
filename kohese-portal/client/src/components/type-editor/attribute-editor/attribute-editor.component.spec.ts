import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module';

import { DialogService } from '../../../services/dialog/dialog.service';
import { AttributeEditorComponent } from './attribute-editor.component';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { KoheseType } from '../../../classes/UDT/KoheseType.class'
import { MockDataModel } from '../../../../mocks/data/MockDataModel';
import { MockViewData } from '../../../../mocks/data/MockViewData';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../../common/src/KoheseModel';
import { PipesModule } from '../../../pipes/pipes.module';

describe('Component: attribute-editor', ()=>{
  let component: AttributeEditorComponent;
  let fixture : ComponentFixture<AttributeEditorComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [AttributeEditorComponent],
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

    fixture = TestBed.createComponent(AttributeEditorComponent);
    component = fixture.componentInstance;
    component.attributeName = 'name';
    fixture.detectChanges();
  });
  
  it('determines whether two type strings represent the same type', () => {
    expect(component.areTypesSame('type', ['type'])).toEqual(
      true);
    
    expect(component.areTypesSame(['type'], 'type')).toEqual(
      false);
    
    expect(component.areTypesSame('type', 'type')).toEqual(
      true);
    
    expect(component.areTypesSame('type', 't')).toEqual(false);
  });
  
  it('determines and changes multivalued-ness of properties', () => {
    component.multivalued = true;
    expect(component.multivalued).toEqual(true);
    
    component.multivalued = false;
    expect(component.multivalued).toEqual(false);
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
    
    expect(component.areRelationsEqual(secondRelation, firstRelation)).toEqual(
      false);
  });
});
