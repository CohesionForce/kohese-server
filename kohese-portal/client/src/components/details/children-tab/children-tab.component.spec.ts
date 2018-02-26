import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { SessionService } from '../../../services/user/session.service';
import { ChildrenTabComponent } from './children-tab.component';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockItem } from '../../../../mocks/data/MockItem';
import * as ItemProxy from '../../../../../common/models/item-proxy';

describe('Component: Children Tab', ()=>{
  let childrenTabComponent: ChildrenTabComponent;
  let childrenTabFixture : ComponentFixture<ChildrenTabComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ChildrenTabComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: DialogService, useClass: MockDialogService},
        {provide: NavigationService, useClass: MockNavigationService}
      ]
    }).compileComponents();

    childrenTabFixture = TestBed.createComponent(ChildrenTabComponent);
    childrenTabComponent = childrenTabFixture.componentInstance;
    childrenTabComponent.itemProxy = new ItemProxy('Item', MockItem)

    childrenTabFixture.detectChanges();
    
  })

  it('instantiates the childrenTab component', ()=>{
    expect(childrenTabComponent).toBeTruthy(); 
  })
})