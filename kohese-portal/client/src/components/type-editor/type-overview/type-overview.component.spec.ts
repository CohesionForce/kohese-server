import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module';

import { DialogService } from '../../../services/dialog/dialog.service';
import { TypeOverviewComponent } from './type-overview.component';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { KoheseType } from '../../../classes/UDT/KoheseType.class'
import { MockDataModel } from '../../../../mocks/data/MockDataModel';
import { MockViewData } from '../../../../mocks/data/MockViewData';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseModel } from '../../../../../common/src/KoheseModel';
import { PipesModule } from '../../../pipes/pipes.module';

describe('Component: Type Overview', ()=>{
  let typeOverviewComponent: TypeOverviewComponent;
  let typeOverviewFixture : ComponentFixture<TypeOverviewComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [TypeOverviewComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         ReactiveFormsModule,
         FormsModule,
         PipesModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: DynamicTypesService, useClass: MockDynamicTypesService},
        {provide: DialogService, useClass: MockDialogService}
      ]
    }).compileComponents();

    typeOverviewFixture = TestBed.createComponent(TypeOverviewComponent);
    typeOverviewComponent = typeOverviewFixture.componentInstance;
    typeOverviewComponent.koheseTypeStream = new BehaviorSubject<KoheseType>(
      new KoheseType(new KoheseModel(MockDataModel()), {
      'KoheseView': new ItemProxy('KoheseView', MockViewData())
    }));
    typeOverviewFixture.detectChanges();

  })

  it('instantiates the typeOverview component', ()=>{
    expect(typeOverviewComponent).toBeTruthy(); 
  });
  
  it('changes the parent type of types', () => {
    typeOverviewComponent.changeParentType('Kurios Iesous');
    expect(typeOverviewComponent.koheseType.dataModelProxy.item.base).toEqual(
      'Kurios Iesous');
    expect(typeOverviewComponent.koheseType.dataModelProxy.item.parentId).
      toEqual('Kurios Iesous');
  });
});
