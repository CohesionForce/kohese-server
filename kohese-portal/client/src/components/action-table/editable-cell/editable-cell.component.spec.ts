import { TestBed, ComponentFixture, async} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChanges, SimpleChange } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'
import { EditableCellComponent } from './editable-cell.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as ItemProxy from '../../../../../common/src/item-proxy';
import * as KoheseModel from '../../../../../common/src/KoheseModel';
import { MockItem } from '../../../../mocks/data/MockItem';
import { MockDataModel } from '../../../../mocks/data/MockDataModel';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

describe('Component: Editable Cell ', ()=>{
  let editableCellComponent: EditableCellComponent;
  let editableCellFixture : ComponentFixture<EditableCellComponent>;

  beforeEach(async(()=>{
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
    editableCellComponent.action.proxy.model = new KoheseModel(MockDataModel());
    editableCellComponent.editableStream = new BehaviorSubject<boolean>(true);
    editableCellComponent.rowActionStream = new Subject<any>();    

    editableCellFixture.detectChanges();
    
  }))

  it('instantiates the editableCell component', ()=>{
    expect(editableCellComponent).toBeTruthy(); 
  })

  it('updates when a new action is provided', async(()=>{
    let newProxy = new ItemProxy('Item', MockItem());
    newProxy.item.name = 'New Action';
    newProxy.item.model = new ItemProxy('KoheseModel', MockDataModel());
    editableCellComponent.action = {
      depth : 0,
      proxy : newProxy
    }
    editableCellComponent.ngOnChanges({
      name: new SimpleChange(null, newProxy, true)
    })
  }))

  afterEach(()=>{
    ItemProxy.getWorkingTree().reset();
  })
})