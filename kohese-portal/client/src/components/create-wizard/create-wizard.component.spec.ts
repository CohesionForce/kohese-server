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
import { ItemProxy } from '../../../../common/src/item-proxy';

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
         BrowserAnimationsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers : [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: NavigationService, useClass: MockNavigationService},
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: SessionService, useClass: MockSessionService },
      ]
    }).compileComponents();

    createWizardFixture = TestBed.createComponent(CreateWizardComponent);
    createWizardComponent = createWizardFixture.componentInstance;

    // TODO: Need to remove when syncMock is removed
    MockItemRepository.singleton.syncFull();

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
      closeSpy = spyOn(TestBed.get(MatDialogRef), 'close');

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
