import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'
import { EditableCellComponent } from './editable-cell.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as ItemProxy from '../../../../../common/src/item-proxy';
import { MockItem } from '../../../../mocks/data/MockItem';
import { BehaviorSubject, Observable } from 'rxjs';

describe('Component: Editable Cell ', ()=>{
  let editableCellComponent: EditableCellComponent;
  let editableCellFixture : ComponentFixture<EditableCellComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [EditableCellComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
      ]
    }).compileComponents();

    editableCellFixture = TestBed.createComponent(EditableCellComponent);
    editableCellComponent = editableCellFixture.componentInstance;
    editableCellComponent.column = 'estimatedHoursEffort';
    editableCellComponent.action = {
      depth : 0,
      proxy : new ItemProxy('Item', MockItem())
    };
    editableCellComponent.action.proxy.model = {
        internal : true     
    }
    editableCellComponent.editableStream = new BehaviorSubject<boolean>(true);
    editableCellComponent.rowActionStream = new Observable<any>();    

    editableCellFixture.detectChanges();
    
  })

  it('instantiates the editableCell component', ()=>{
    expect(editableCellComponent).toBeTruthy(); 
  })

  afterEach(()=>{
    ItemProxy.getWorkingTree().reset();
  })
})