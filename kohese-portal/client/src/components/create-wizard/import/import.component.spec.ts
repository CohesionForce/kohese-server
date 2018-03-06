import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { ImportComponent } from './import.component';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockImportService } from '../../../../mocks/services/MockImportService';
import { ImportService } from '../../../services/import/import.service';

describe('Component: ', ()=>{
  let importComponent: ImportComponent;
  let importFixture : ComponentFixture<ImportComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ImportComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository}, 
        {provide: ImportService, useClass: MockImportService}
      ]
    }).compileComponents();

    importFixture = TestBed.createComponent(ImportComponent);
    importComponent = importFixture.componentInstance;

    importFixture.detectChanges();
    
  })

  it('instantiates the Import component', ()=>{
    expect(importComponent).toBeTruthy(); 
  })
})