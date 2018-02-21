import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { IconSelectorComponent } from './icon-selector.component';

import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { SessionService } from '../../../services/user/session.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';

describe('Component: Icon Selector', ()=>{
  let selectorComponent: IconSelectorComponent;
  let selectorFixture : ComponentFixture<IconSelectorComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [IconSelectorComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: DynamicTypesService, useClass: MockDynamicTypesService}
      ]
    }).compileComponents();

    selectorFixture = TestBed.createComponent(IconSelectorComponent);
    selectorComponent = selectorFixture.componentInstance;

    selectorFixture.detectChanges();
    
  })

  it('instantiates the Icon Selector component', ()=>{
    expect(selectorComponent).toBeTruthy(); 
  })
})