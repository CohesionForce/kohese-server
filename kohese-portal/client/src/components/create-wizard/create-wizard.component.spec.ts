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


// Angular
import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SecurityContext } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

// Other External Dependencies
import { MarkdownModule, MarkdownService, MarkedOptions } from 'ngx-markdown';

// Kohese
import { CreateWizardComponent } from './create-wizard.component';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { SessionService } from '../../services/user/session.service';
import { ObjectEditorModule } from '../object-editor/object-editor.module';
import { ServicesModule } from '../../services/services.module';
import { PipesModule } from '../../pipes/pipes.module';

// Mocks
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockSessionService } from '../../../mocks/services/MockSessionService';
import { ItemProxy } from '../../../../common/src/item-proxy';


describe('Component: Create Wizard', ()=>{
  let createWizardComponent: CreateWizardComponent;
  let createWizardFixture : ComponentFixture<CreateWizardComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [CreateWizardComponent],
      imports : [
        CommonModule,
        PipesModule,
        ServicesModule,
        MatDialogModule,
        MarkdownModule.forRoot({
          sanitize: SecurityContext.NONE
        }),
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

    it('closes the window when an item is built', waitForAsync(()=>{
      let value: Promise<ItemProxy>;
      let buildSpy = spyOn(TestBed.inject(ItemRepository), 'upsertItem').and.returnValue(Promise.resolve(value));
      createWizardComponent.createItem();
      createWizardFixture.whenStable().then(()=>{
        expect(buildSpy).toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalled();
      })
    }))

    it('displays an error when a build fails', waitForAsync(()=>{
      let buildSpy = spyOn(TestBed.inject(ItemRepository), 'upsertItem').and.returnValue(Promise.reject('Incorrect Fields'));
      createWizardComponent.createItem();
      createWizardFixture.whenStable().then(()=>{
        expect(buildSpy).toHaveBeenCalled();
        expect(createWizardComponent.errorMessage).toBe('Incorrect Fields');
      })
    }))
  })

})
