import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../../material.module'
import { PipesModule } from '../../../../pipes/pipes.module';

import { ChildrenTableComponent } from './children-table.component';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';

import { NavigationService } from '../../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../../mocks/services/MockNavigationService';
import { BehaviorSubject } from 'rxjs';

describe('Component: Children Table', ()=>{
  let childrenTableComponent: ChildrenTableComponent;
  let childrenTableFixture : ComponentFixture<ChildrenTableComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ChildrenTableComponent],
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

    childrenTableFixture = TestBed.createComponent(ChildrenTableComponent);
    childrenTableComponent = childrenTableFixture.componentInstance;

    childrenTableComponent.itemProxy = new MockItemRepository().getRootProxy();
    childrenTableComponent.filterSubject = new BehaviorSubject<string>('');

    childrenTableFixture.detectChanges();
    
  })

  it('instantiates the ChildrenTable component', ()=>{
    expect(childrenTableComponent).toBeTruthy(); 
  })
})