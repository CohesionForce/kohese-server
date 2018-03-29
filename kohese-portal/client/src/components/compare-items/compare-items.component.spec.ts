import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';

import { MaterialModule } from '../../material.module';
import { ServicesModule } from '../../services/services.module';
import { CompareItemsComponent } from './compare-items.component';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockItem } from '../../../mocks/data/MockItem';
import * as ItemProxy from '../../../../common/src/item-proxy';

describe('Component: compare-items', () => {
  let component: CompareItemsComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompareItemsComponent],
      imports : [
        CommonModule,
        FormsModule,
        MaterialModule,
        ServicesModule,
        AngularSplitModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository}
      ]
    }).compileComponents();
    let compareItemsFixture: ComponentFixture<CompareItemsComponent> = TestBed.
      createComponent(CompareItemsComponent);
    component = compareItemsFixture.componentInstance;
    let proxy: ItemProxy = new ItemProxy('Item', MockItem());
    component.baseProxyStream.next(proxy);
    component.changeProxyStream.next(proxy);
    
    compareItemsFixture.detectChanges();
  });
  
  it('resets the ItemProxy that was being edited when editing is canceled',
    fakeAsync(() => {
    let name: string = 'Kurios Iesous';
    
    component.toggleEditability(component.baseItemEditableStream);
    tick();
    component.baseProxyStream.getValue().item.name = name;
    component.toggleEditability(component.baseItemEditableStream);
    tick();
    expect(component.baseProxyStream.getValue().item.name).not.toEqual(name);
    
    component.toggleEditability(component.changeItemEditableStream);
    tick();
    component.changeProxyStream.getValue().item.name = name;
    component.toggleEditability(component.changeItemEditableStream);
    tick();
    expect(component.changeProxyStream.getValue().item.name).not.toEqual(name);
  }));
});