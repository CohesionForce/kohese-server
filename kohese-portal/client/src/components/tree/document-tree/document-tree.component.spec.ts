import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MaterialModule } from '../../../material.module';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DocumentTreeComponent } from './document-tree.component';
import { Filter } from '../../filter/filter.class';

describe('DocumentTreeComponent', () => {
  let component: DocumentTreeComponent;
  let fixture: ComponentFixture<DocumentTreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTreeComponent ],
      imports: [
        CommonModule,
        MaterialModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<any>({
              id: 'Kurios Iesous'
            })
          }
        },
        { provide: DialogService, useClass: MockDialogService },
        { provide: DynamicTypesService, useClass: MockDynamicTypesService },
        { provide: ItemRepository, useClass: MockItemRepository }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(DocumentTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('filters after a search string is entered', (done: Function) => {
    expect(component.filterSubject.getValue()).not.toBeDefined();
    component.searchStringChanged('Search String');
    setTimeout(() => {
      let filter: Filter = component.filterSubject.getValue();
      expect(filter.rootElement.criteria[0]).toEqual(component.
        searchCriterion);
      done();
    }, 1000);
  });
});
