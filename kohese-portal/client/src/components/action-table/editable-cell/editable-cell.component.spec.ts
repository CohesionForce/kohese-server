import { TestBed, ComponentFixture, async} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChanges, SimpleChange } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'
import { EditableCellComponent } from './editable-cell.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../../common/src/KoheseModel';
import { MockItem } from '../../../../mocks/data/MockItem';
import { MockDataModel } from '../../../../mocks/data/MockDataModel';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';

describe('Component: Editable Cell ', ()=>{
  let editableCellComponent: EditableCellComponent;
  let editableCellFixture : ComponentFixture<EditableCellComponent>;
  let editableStream = new BehaviorSubject<boolean>(true);
  let rowActionStream = new Subject<any>();

  let actionProxy = new ItemProxy('Action', MockItem())

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
      proxy : actionProxy
    }

    editableCellComponent.editableStream = editableStream;
    editableCellComponent.rowActionStream = rowActionStream;

    editableCellFixture.detectChanges();

  }))

  afterEach(()=>{
    ItemProxy.getWorkingTree().reset();
    editableCellFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the editableCell component', ()=>{
    expect(editableCellComponent).toBeTruthy();
  })

  it('updates when a new action is provided', async(()=>{
    let newProxy = new ItemProxy('Item', MockItem());
    newProxy.item.name = 'New Action';
    editableCellComponent.action = {
      depth : 0,
      proxy : newProxy
    }
    editableCellComponent.ngOnChanges({
      name: new SimpleChange(null, newProxy, true)
    })
  }))
  it('disables when details editability changes', ()=>{
    editableStream.next(false);
    expect(editableCellComponent.editable).toBeFalsy();
  })
  it('enables when row specific editability changes', ()=>{
    rowActionStream.next({
      type: 'Edit',
      rowProxy : actionProxy,
      })
    expect(editableCellComponent.editable).toBeTruthy();
  })

})
