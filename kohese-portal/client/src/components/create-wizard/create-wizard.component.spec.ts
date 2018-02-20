import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CreateWizardComponent } from './create-wizard.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ServicesModule } from '../../services/services.module';
import { MatDialogModule } from '@angular/material';
import { MatDialogRef } from '@angular/material';

/* Mocks */
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockDynamicTypesService } from '../../../mocks/services/MockDynamicTypesService';

import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';


describe('Component: Create Wizard', ()=>{
  let createWizardComponent: CreateWizardComponent;
  let createWizardFixture : ComponentFixture<CreateWizardComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [CreateWizardComponent],
      imports : [CommonModule,
         FormsModule,
         ReactiveFormsModule, 
         MaterialModule,
         PipesModule,
         ServicesModule,
         MatDialogModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers : [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: NavigationService, useClass: MockNavigationService},
        {provide: DynamicTypesService, useClass: MockDynamicTypesService},
        {provide: MatDialogRef, useValue : {}}
      ]
    })

    createWizardFixture = TestBed.createComponent(CreateWizardComponent);
    createWizardComponent = createWizardFixture.componentInstance;
  })

  it('instantiates the createWizard component', ()=>{
    expect(createWizardComponent).toBeTruthy(); 
  })
})