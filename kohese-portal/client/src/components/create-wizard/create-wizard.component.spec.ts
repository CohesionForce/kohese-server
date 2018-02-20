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
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'

import { MatStepper } from '@angular/material';


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
         MatDialogModule,
         BrowserAnimationsModule
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

    // Set off the init life cycle
    createWizardFixture.detectChanges();
  })

  describe('initialization', ()=>{
    it('instantiates the createWizard component', ()=>{
      expect(createWizardComponent).toBeTruthy(); 
    })
    
    it('requests the required data from the server', ()=>{
      expect(createWizardComponent.rootProxy).toBeDefined;
      expect(createWizardComponent.models).toBeDefined;
      expect(createWizardComponent.filteredProxies).toBeDefined;
      expect(createWizardComponent.recentProxies).toBeDefined;
      expect(createWizardComponent.types).toBeDefined;
    })
  
    it('starts with the root proxy selected when no parent is provided', ()=>{
      expect(createWizardComponent.selectedParent).toBe(createWizardComponent.rootProxy)
    })
  
  })

  describe('type selection', ()=>{
    let stepper : MatStepper;
    let nextSpy;
    beforeEach(()=>{
      stepper = <MatStepper> {
        next : ()=>{
  
        }
      }

      nextSpy = spyOn(stepper, 'next');
    })

    it('updates the selected type when selected for the first time', ()=>{
      createWizardComponent.onTypeSelected(createWizardComponent.types[0], stepper );
      expect(createWizardComponent.selectedType).toBe(createWizardComponent.types[0]);
      expect(nextSpy).not.toHaveBeenCalled();
    })

    it('moves to the next step if a type is double clicked', ()=>{
      createWizardComponent.onTypeSelected(createWizardComponent.types[0], stepper );
      createWizardComponent.onTypeSelected(createWizardComponent.types[0], stepper );
      expect(createWizardComponent.selectedType).toBe(createWizardComponent.types[0]);
      expect(nextSpy).toHaveBeenCalled();            
    })
  })

  
  afterEach(()=>{
    createWizardComponent = null;
    createWizardFixture = null;
  })
})