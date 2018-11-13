import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { PipesModule } from '../../../pipes/pipes.module';
import { StateService } from '../../../services/state/state.service';
import { MockStateService } from '../../../../mocks/services/MockStateService';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockItem } from '../../../../mocks/data/MockItem';
import { KStateEditorComponent } from './k-state-editor.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';

describe('k-state-editor', () => {
  let stateEditor: ComponentFixture<KStateEditorComponent>;
  let component: KStateEditorComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KStateEditorComponent],
      imports: [
        CommonModule,
        MaterialModule,
        PipesModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{
          provide: StateService,
          useClass: MockStateService
        }, {
          provide: DynamicTypesService,
          useClass: MockDynamicTypesService
        }, {
          provide: ItemRepository,
          useClass: MockItemRepository
        }]
    }).compileComponents();

    stateEditor = TestBed.createComponent(KStateEditorComponent);
    component = stateEditor.componentInstance;
    component.itemProxy = new ItemProxy('Item', MockItem());
  });

  it('changes the value of fields of type "StateMachine"', () => {
    component.transition('actionState', 'Assigned');
    expect(component.itemProxy.item['actionState']).toEqual('Assigned');
  });
});
