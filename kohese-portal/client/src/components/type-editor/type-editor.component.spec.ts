import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../material.module'

import { TypeEditorComponent } from './type-editor.component';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockDialogService } from '../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { PipesModule } from '../../pipes/pipes.module';
import { TreeViewModule } from '../tree/tree.module';

describe('Component: Type Editor', ()=>{
  let typeEditorComponent: TypeEditorComponent;
  let typeEditorFixture : ComponentFixture<TypeEditorComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [TypeEditorComponent],
      imports: [
        CommonModule,
        MaterialModule,
        BrowserAnimationsModule,
        PipesModule,
        TreeViewModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        DynamicTypesService,
        {provide: DialogService, useClass: MockDialogService},
        {provide: ItemRepository, useClass: MockItemRepository}
      ]
    }).compileComponents();

    typeEditorFixture = TestBed.createComponent(TypeEditorComponent);
    typeEditorComponent = typeEditorFixture.componentInstance;
    typeEditorFixture.detectChanges();
  });

  it('instantiates the Type Editor component', ()=>{
    expect(typeEditorComponent).toBeTruthy(); 
  });
});
