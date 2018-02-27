import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module';
import { PipesModule } from '../../../pipes/pipes.module';

import { DetailsFormComponent } from './details-form.component';

import * as ItemProxy from '../../../../../common/models/item-proxy'

import { MockItem } from '../../../../mocks/data/MockItem';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';

describe('Component: Details Form', ()=>{
  let formComponent: DetailsFormComponent;
  let formFixture : ComponentFixture<DetailsFormComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [DetailsFormComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule,
         PipesModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: NavigationService, useClass: MockNavigationService },
        {provide: FormBuilder, useClass: FormBuilder },
        {provide: DynamicTypesService, useClass: MockDynamicTypesService },
        {provide: ItemRepository, useClass: MockItemRepository }
      ]
    }).compileComponents();

    formFixture = TestBed.createComponent(DetailsFormComponent);
    formComponent = formFixture.componentInstance;
    
  })
  describe('item creation', ()=>{
    beforeEach(()=>{
      formComponent.createInfo = {
        parent: 'test-uuid',
        type : TestBed.get(DynamicTypesService).getMockKoheseType()
      }

      formComponent.createInfo.type.dataModelProxy.item = {
        base: 'PersistedModel'
      } 

      formFixture.detectChanges();
    })

    it('creates a stub proxy from the create information', ()=>{
      expect(formComponent.itemProxy).toBeTruthy();
      console.log(formComponent.itemProxy);
    })
  })

  describe('details view', ()=>{
    beforeEach(()=>{
      formComponent.itemProxy = new ItemProxy('Item', MockItem) 
      formComponent.itemProxy.model.item = {
        base: 'PersistedModel'
      }    
    })

    describe ('disabled selected', ()=>{
      
      beforeEach(()=>{
        formComponent.disabled = true;
        formFixture.detectChanges();
      })

      it('disables the form group', ()=>{
        expect(formComponent.formGroup.disabled).toBe(true);
      })

    })

    describe('enabled selected', ()=>{

      beforeEach(()=>{
        formComponent.disabled = false;
      })
    })
    

    it('instantiates the Details Form component', ()=>{
      expect(formComponent).toBeTruthy(); 
    })
  })

})