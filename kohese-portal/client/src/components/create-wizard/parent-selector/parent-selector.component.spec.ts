import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../material.module';

import { ParentSelectorComponent } from './parent-selector.component';
import * as ItemProxy from '../../../../../common/src/item-proxy';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { MockItem } from '../../../../mocks/data/MockItem';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { PipesModule } from '../../../pipes/pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('Component: Parent Selector', ()=>{
  let parentSelectorComponent: ParentSelectorComponent;
  let parentSelectorFixture : ComponentFixture<ParentSelectorComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ParentSelectorComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         PipesModule,
         FormsModule,
         ReactiveFormsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
      ]
    }).compileComponents();

    parentSelectorFixture = TestBed.createComponent(ParentSelectorComponent);
    parentSelectorComponent = parentSelectorFixture.componentInstance;

    parentSelectorFixture.detectChanges();
    
  })

  it('instantiates the parentSelector component', ()=>{
    expect(parentSelectorComponent).toBeTruthy(); 
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
      parentSelectorComponent.onAutoCompleteSelected(selectedProxyEvent);
      expect(parentSelectorComponent.selectedParent).toBe(selectedProxy);
      expect(parentSelectorComponent.proxySearchControl.value).toBe(parentSelectorComponent.selectedParent.item.name);
    })
  })
})




