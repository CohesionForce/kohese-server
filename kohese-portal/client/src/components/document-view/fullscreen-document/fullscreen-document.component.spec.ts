import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { FullscreenDocumentComponent } from './fullscreen-document.component';

describe('FullscreenDocumentComponent', () => {
  let component: FullscreenDocumentComponent;
  let fixture: ComponentFixture<FullscreenDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullscreenDocumentComponent ],
      providers: [ {
        provide: ActivatedRoute,
        useValue: { params: new BehaviorSubject<any>({ id: 'test-uuid2' }) }
        }, { provide: ItemRepository, useClass: MockItemRepository } ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullscreenDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
