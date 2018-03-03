import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CreateWizardComponent } from './create-wizard.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ServicesModule } from '../../services/services.module';
import { MatDialogModule, MatAutocompleteSelectedEvent } from '@angular/material';
import { MatDialogRef } from '@angular/material';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'

import { MatStepper } from '@angular/material';


/* Mocks */
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockDynamicTypesService } from '../../../mocks/services/MockDynamicTypesService';
import { MockItem } from '../../../mocks/data/MockItem';

import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import * as ItemProxy from '../../../../common/src/item-proxy';

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
        {provide: MatDialogRef, useValue : {close: ()=>{console.log('close')}}}
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
      createWizardComponent.onTypeSelected(createWizardComponent.types[1], stepper);
      expect(createWizardComponent.selectedType).toBe(createWizardComponent.types[1]);
      expect(nextSpy).not.toHaveBeenCalled();
    })

    it('moves to the next step if a type is double clicked', ()=>{
      createWizardComponent.onTypeSelected(createWizardComponent.types[1], stepper);
      createWizardComponent.onTypeSelected(createWizardComponent.types[1], stepper);
      expect(createWizardComponent.selectedType).toBe(createWizardComponent.types[1]);
      expect(nextSpy).toHaveBeenCalled();            
    })
  })

  describe('parent selection', ()=>{
    let selectedProxyEvent;
    let selectedProxy;

    beforeEach(()=>{
      selectedProxy = new ItemProxy('Item', MockItem);
      selectedProxyEvent = <MatAutocompleteSelectedEvent> {
        option : {
          value : selectedProxy
        }
      }
    })
    it('should set the parent when a proxy is selected by autocomplete', ()=>{
      createWizardComponent.onProxySelected(selectedProxyEvent);
      expect(createWizardComponent.selectedParent).toBe(selectedProxy);
      expect(createWizardComponent.proxySearchControl.value).toBe(createWizardComponent.selectedParent.item.name);
    })
  })

  describe('item creation', ()=>{
    let closeSpy;

    beforeEach(()=>{
      createWizardComponent.selectedType = new ItemProxy('Item', MockItem)
      createWizardComponent.createFormGroup = <FormGroup> {
        value : ItemProxy
      }
      
      closeSpy = spyOn(TestBed.get(MatDialogRef), 'close');
      
    })

    it('closes the window when an item is built', async(()=>{
      let buildSpy = spyOn(TestBed.get(ItemRepository), 'buildItem').and.returnValue(Promise.resolve());    
      createWizardComponent.createItem();
      createWizardFixture.whenStable().then(()=>{
        expect(buildSpy).toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalled();
      })
    }))

    it('displays an error when a build fails', async(()=>{
      let buildSpy = spyOn(TestBed.get(ItemRepository), 'buildItem').and.returnValue(Promise.reject('Incorrect Fields'));    
      createWizardComponent.createItem();
      createWizardFixture.whenStable().then(()=>{
        expect(buildSpy).toHaveBeenCalled();
        expect(createWizardComponent.errorMessage).toBe('Incorrect Fields');
      })
    }))
  })

  afterEach(()=>{
  })
})