import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { MaterialModule } from '../../../material.module';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { ReferenceTreeComponent } from './reference-tree.component';

describe('Component: reference-tree', () => {
  let component: ReferenceTreeComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReferenceTreeComponent],
      imports: [
        VirtualScrollModule,
        MaterialModule
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: ActivatedRoute, useValue: { params: Observable.of('') } },
        { provide: DialogService, useClass: MockDialogService },
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: DynamicTypesService, useClass: MockDynamicTypesService }
      ]
    }).compileComponents();
    
    let fixture: ComponentFixture<ReferenceTreeComponent> = TestBed.
      createComponent(ReferenceTreeComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });
  
  it('initializes', () => {
    expect(component.getRow('ROOT')).toBeDefined();
    expect(component.getRow('references')).toBeDefined();
    expect(component.getRow('referencedBy')).toBeDefined();
  });
});