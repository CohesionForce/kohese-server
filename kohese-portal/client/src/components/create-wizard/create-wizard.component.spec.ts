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
import { MockItem } from '../../../mocks/data/MockItem';

import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../common/src/item-proxy';

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
  })

  describe('item creation', ()=>{
    let closeSpy;

    beforeEach(()=>{
      createWizardComponent.createFormGroup = <FormGroup> {
        value : ItemProxy
      }

      closeSpy = spyOn(TestBed.get(MatDialogRef), 'close');

    })

    it('closes the window when an item is built', async(()=>{
      let fieldName: string = 'modifiedOn';
      let fieldValue: any = new Date().getTime();
      createWizardComponent.whenNonFormFieldChanges({
        fieldName: fieldName,
        fieldValue: fieldValue
      });
      let buildSpy = spyOn(TestBed.get(ItemRepository), 'upsertItem').and.returnValue(Promise.resolve());
      createWizardComponent.createItem();
      createWizardFixture.whenStable().then(()=>{
        expect(buildSpy).toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalled();
        expect(createWizardComponent.createFormGroup.value[fieldName]).
          toEqual(fieldValue);
      })
    }))

    it('displays an error when a build fails', async(()=>{
      let buildSpy = spyOn(TestBed.get(ItemRepository), 'upsertItem').and.returnValue(Promise.reject('Incorrect Fields'));
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
