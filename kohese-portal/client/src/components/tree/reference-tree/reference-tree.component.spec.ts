import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { ReferenceTreeComponent } from './reference-tree.component';

describe('Component: reference-tree', () => {
  let component: ReferenceTreeComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReferenceTreeComponent],
      imports: [VirtualScrollModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: ActivatedRoute, useValue: { params: Observable.of('') } }
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