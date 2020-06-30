import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module';

import { DialogService } from '../../../services/dialog/dialog.service';
import { AttributeEditorComponent } from './attribute-editor.component';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { KoheseType } from '../../../classes/UDT/KoheseType.class'
import { MockDataModel } from '../../../../mocks/data/MockDataModel';
import { MockViewData } from '../../../../mocks/data/MockViewData';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../../common/src/KoheseModel';
import { PipesModule } from '../../../pipes/pipes.module';

describe('Component: attribute-editor', ()=>{
  let component: AttributeEditorComponent;
  let fixture : ComponentFixture<AttributeEditorComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [AttributeEditorComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         ReactiveFormsModule,
         FormsModule,
         PipesModule
         ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
        DynamicTypesService,
        {provide: DialogService, useClass: MockDialogService}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AttributeEditorComponent);
    component = fixture.componentInstance;
    component.contextualGlobalType = TestBed.get(ItemRepository).
      getTreeConfig().getValue().config.getProxyFor('KoheseModel').item;

    fixture.detectChanges();
  });
  
  it('determines whether two type strings represent the same type', () => {
    expect(component.areTypesSame('type', ['type'])).toEqual(
      true);
    
    expect(component.areTypesSame(['type'], 'type')).toEqual(
      false);
    
    expect(component.areTypesSame('type', 'type')).toEqual(
      true);
    
    expect(component.areTypesSame('type', 't')).toEqual(false);
  });
  
  it('determines and changes multivalued-ness of properties', () => {
    component.toggleMultivaluedness();
    expect(Array.isArray(component.attribute.type)).toEqual(true);
    
    component.toggleMultivaluedness();
    expect(Array.isArray(component.attribute.type)).toEqual(false);
  });
  
  it('determines if two relations are equal', () => {
    let firstRelation: any = {
      kind: 'FirstTestKind',
      foreignKey: 'FirstTestKey'
    };
    
    let secondRelation: any = {
      kind: 'SecondTestKind',
      foreignKey: 'SecondTestKey'
    };
    
    let thirdRelation : any = {
      kind: 'FirstTestKind',
      foreignKey: 'FirstTestKey'
    };

    expect(component.areRelationsEqual(secondRelation, firstRelation)).toEqual(false);
    expect(component.areRelationsEqual(thirdRelation, firstRelation)).toEqual(true);
  });

  it('retrieves appropriate display options', () => {
    component.attribute.type = 'Enumeration';
    expect(component.getTypes()).toEqual(['Dropdown']);
    component.attribute.type = 'PropertyType';
    expect(component.getTypes()).toEqual(['Reference']);
    component.attribute.type = 'Item';
    expect(component.getTypes()).toEqual(['Reference']);
    component.attribute.type = ['string'];
    expect(component.getTypes()).toEqual(['Text', 'Markdown',
      'Masked String']);
    component.attribute.relation = {
      kind: 'KoheseUser',
      foreignKey: 'username'
    };
    expect(component.getTypes()).toEqual(['Username']);
  });

  it('retrieves the display option representation for the given display ' +
    'option', () => {
    expect(component.getTypeValue('Dropdown')).toBe('');
    expect(component.getTypeValue('Reference')).toBe('');
    component.attribute.type = ['string'];
    expect(component.getTypeValue('Masked String')).toBe('maskedString');
    component.attribute.relation = {
      kind: 'KoheseUser',
      foreignKey: 'username'
    };
    expect(component.getTypeValue('Username')).toBe('user-selector');
  });
});
