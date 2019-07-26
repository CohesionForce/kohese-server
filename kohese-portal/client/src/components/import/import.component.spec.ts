import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MarkdownModule } from 'ngx-markdown';
import { ToastrModule } from 'ngx-toastr';

import { MaterialModule } from '../../material.module'
import { TreeViewModule } from '../tree/tree.module';
import { ImportComponent } from './import.component';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';

describe('Component: ', ()=>{
  let importComponent: ImportComponent;
  let importFixture : ComponentFixture<ImportComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ImportComponent],
      imports: [
        BrowserAnimationsModule,
        MarkdownModule,
        ToastrModule.forRoot(),
        MaterialModule,
        TreeViewModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository}
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