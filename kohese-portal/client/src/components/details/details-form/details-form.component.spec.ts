import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module';
import { PipesModule } from '../../../pipes/pipes.module';

import { DetailsFormComponent } from './details-form.component';

import { ItemProxy } from '../../../../../common/src/item-proxy'
import { KoheseModel } from '../../../../../common/src/KoheseModel';

import { MockDataModel } from '../../../../mocks/data/MockDataModel';
import { MockItem } from '../../../../mocks/data/MockItem';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { StateService } from '../../../services/state/state.service';
import { MockStateService } from '../../../../mocks/services/MockStateService';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

describe('Component: Details Form', ()=>{
  let formComponent: DetailsFormComponent;
  let formFixture : ComponentFixture<DetailsFormComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [DetailsFormComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule,
         MarkdownModule,
         PipesModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: NavigationService, useClass: MockNavigationService },
        {provide: FormBuilder, useClass: FormBuilder },
        { provide: DialogService, useClass: MockDialogService },
        {provide: DynamicTypesService, useClass: MockDynamicTypesService },
        {provide: ItemRepository, useClass: MockItemRepository },
        { provide: StateService, useClass: MockStateService }
      ]
    }).compileComponents();

    formFixture = TestBed.createComponent(DetailsFormComponent);
    formComponent = formFixture.componentInstance;
    new KoheseModel(MockDataModel());
    KoheseModel.modelDefinitionLoadingComplete();
    let proxy: ItemProxy = new ItemProxy('Item', MockItem());
    proxy.model.item = {
      base: 'PersistedModel'
    };
    formComponent.proxyStream = new BehaviorSubject<ItemProxy>(proxy);
    formComponent.editableStream = new BehaviorSubject<boolean>(false);

    formFixture.detectChanges();
  });

  it('builds a DetailsFormComponent', () => {
    expect(formComponent).toBeTruthy();
  });

  it('enables editing', fakeAsync(() => {
    formComponent.editableStream.next(true);
    tick();
    expect(formComponent.formGroup.disabled).toBe(false);
  }));
})
