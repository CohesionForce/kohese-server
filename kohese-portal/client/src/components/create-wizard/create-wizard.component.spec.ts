/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CreateWizardComponent } from './create-wizard.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ServicesModule } from '../../services/services.module';
import { MatDialogModule } from '@angular/material';
import { MatDialogRef } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { MatStepper } from '@angular/material';


/* Mocks */
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockSessionService } from '../../../mocks/services/MockSessionService';
import { MockItem } from '../../../mocks/data/MockItem';

import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { SessionService } from '../../services/user/session.service';
import { ObjectEditorModule } from '../object-editor/object-editor.module';
import { MarkdownService, MarkedOptions } from 'ngx-markdown';


describe('Component: Create Wizard', ()=>{
  let createWizardComponent: CreateWizardComponent;
  let createWizardFixture : ComponentFixture<CreateWizardComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [CreateWizardComponent],
      imports : [CommonModule,
         MaterialModule,
         PipesModule,
         ServicesModule,
         MatDialogModule,
         BrowserAnimationsModule,
         ObjectEditorModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers : [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: NavigationService, useClass: MockNavigationService},
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: SessionService, useClass: MockSessionService },
        MarkdownService,
        MarkedOptions
      ]
    }).compileComponents();

    createWizardFixture = TestBed.createComponent(CreateWizardComponent);
    createWizardComponent = createWizardFixture.componentInstance;

    // Set off the init life cycle
    createWizardFixture.detectChanges();
  })

  afterEach(() => {
    createWizardFixture.destroy();
    TestBed.resetTestingModule();
  })

  describe('initialization', ()=>{
    it('instantiates the createWizard component', ()=>{
      expect(createWizardComponent).toBeTruthy();
    })
  })

  describe('item creation', ()=>{
    let closeSpy;

    beforeEach(()=>{
      closeSpy = spyOn(TestBed.inject(MatDialogRef), 'close');

    })

    it('closes the window when an item is built', async(()=>{
      let buildSpy = spyOn(TestBed.get(ItemRepository), 'upsertItem').and.returnValue(Promise.resolve());
      createWizardComponent.createItem();
      createWizardFixture.whenStable().then(()=>{
        expect(buildSpy).toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalled();
      })
    }))

    it('displays an error when a build fails', async(()=>{
      let buildSpy = spyOn(TestBed.inject(ItemRepository), 'upsertItem').and.returnValue(Promise.reject('Incorrect Fields'));
      createWizardComponent.createItem();
      createWizardFixture.whenStable().then(()=>{
        expect(buildSpy).toHaveBeenCalled();
        expect(createWizardComponent.errorMessage).toBe('Incorrect Fields');
      })
    }))
  })

})
