import { TestBed, ComponentFixture} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MarkdownModule } from 'ngx-markdown';
import { ToastrModule } from 'ngx-toastr';

import { MaterialModule } from '../../material.module'
import { TreeViewModule } from '../tree/tree.module';
import { ImportComponent } from './import.component';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MAT_DIALOG_DATA } from '@angular/material';

describe('Component: ', ()=>{
  let importComponent: ImportComponent;
  let importFixture : ComponentFixture<ImportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportComponent],
      imports: [
        BrowserAnimationsModule,
        MarkdownModule,
        ToastrModule.forRoot(),
        MaterialModule,
        TreeViewModule
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: MAT_DIALOG_DATA, useValue: {}},
      ]
    }).compileComponents();

    importFixture = TestBed.createComponent(ImportComponent);
    importComponent = importFixture.componentInstance;

    importFixture.detectChanges();

  })

  it('instantiates the Import component', ()=>{
    //pending();
    expect(importComponent).toBeTruthy();
  })
})
