import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    propertyEditorComponent.type = new KoheseType(
      new ItemProxy('KoheseModel', MockDataModel),
      new ItemProxy('KoheseView', MockViewData))
    propertyEditorFixture.detectChanges();
    
  })

  it('instantiates the Property Editor component', ()=>{
    expect(propertyEditorComponent).toBeTruthy(); 
  })
})