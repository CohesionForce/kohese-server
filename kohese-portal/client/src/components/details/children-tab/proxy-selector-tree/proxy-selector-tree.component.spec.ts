import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../../material.module'

import { SessionService } from '../../../../services/user/session.service';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../../mocks/services/MockNavigationService';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';

import { ProxySelectorTreeComponent } from './proxy-selector-tree.component';
import { PipesModule } from '../../../../pipes/pipes.module';

describe('Component: ', ()=>{
  let proxySelectorTreeComponent: ProxySelectorTreeComponent;
  let proxySelectorTreeFixture : ComponentFixture<ProxySelectorTreeComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ProxySelectorTreeComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         PipesModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: NavigationService, useClass: MockNavigationService}
      ]
    }).compileComponents();

    proxySelectorTreeFixture = TestBed.createComponent(ProxySelectorTreeComponent);
    proxySelectorTreeComponent = proxySelectorTreeFixture.componentInstance;

    proxySelectorTreeComponent.itemProxy = new MockItemRepository().getRootProxy();

    proxySelectorTreeFixture.detectChanges();
    
  })

  it('instantiates the ProxySelectorTree component', ()=>{
    expect(proxySelectorTreeComponent).toBeTruthy(); 
  })
})