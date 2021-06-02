import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../../material.module';

import { ProxySelectorComponent } from './proxy-selector.component';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { MockItem } from '../../../../../mocks/data/MockItem';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';
import { PipesModule } from '../../../../pipes/pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('Component: Parent Selector', ()=>{
  let proxySelectorComponent: ProxySelectorComponent;
  let proxySelectorFixture : ComponentFixture<ProxySelectorComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ProxySelectorComponent],
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

    proxySelectorFixture = TestBed.createComponent(ProxySelectorComponent);
    proxySelectorComponent = proxySelectorFixture.componentInstance;

    proxySelectorFixture.detectChanges();

  })

  afterEach(() => {
    proxySelectorFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the proxySelector component', ()=>{
    expect(proxySelectorComponent).toBeTruthy();
  })

  describe('proxy selection', ()=>{
    let selectedProxyEvent;
    let selectedProxy;

    beforeEach(()=>{
      selectedProxy = new ItemProxy('Item', MockItem());
      selectedProxyEvent = <MatAutocompleteSelectedEvent> {
        option : {
          value : selectedProxy
        }
      }
    })

    it('should set the proxy when a proxy is selected by autocomplete', ()=>{
      proxySelectorComponent.onAutoCompleteSelected(selectedProxyEvent);
      expect(proxySelectorComponent.selected).toBe(selectedProxy);
      expect(proxySelectorComponent.proxySearchControl.value).toBe(proxySelectorComponent.selected.item.name);
    })
  })
})




