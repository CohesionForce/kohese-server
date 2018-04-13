import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'

import { DetailsComponent } from './details.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ServicesModule } from '../../services/services.module';
import { SessionService } from '../../services/user/session.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

import { MockSessionService } from '../../../mocks/services/MockSessionService';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Component: Details', ()=>{
  let detailsComponent: DetailsComponent;
  let detailsFixture : ComponentFixture<DetailsComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [DetailsComponent],
      imports : [CommonModule,
         FormsModule, 
         MaterialModule,
         PipesModule,
         ServicesModule, 
         RouterTestingModule, 
         BrowserAnimationsModule
         ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: SessionService, useClass: MockSessionService},
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: NavigationService, useClass: MockNavigationService},
        {provide: ActivatedRoute, useValue:{
          params: Observable.of({ id: '1' })
        }}
      ]
    }).compileComponents();

    detailsFixture = TestBed.createComponent(DetailsComponent);
    detailsComponent = detailsFixture.componentInstance;

    detailsFixture.detectChanges();
    
  })

  it('instantiates the details component', ()=>{
    expect(detailsComponent).toBeTruthy(); 
  })
  
  it('changes non-form fields on the input ItemProxy when changes are saved',
    () => {
    let fieldName: string = 'modifiedOn';
    let fieldValue: any = new Date().getTime();
    detailsComponent.whenNonFormFieldChanges({
      fieldName: fieldName,
      fieldValue: fieldValue
    });
    detailsComponent.itemProxy = TestBed.get(ItemRepository).getProxyFor(
      'test-uuid7');
    spyOn(TestBed.get(ItemRepository), 'upsertItem').and.returnValue(Promise.
      resolve());
    detailsComponent.upsertItem(detailsComponent.itemProxy.item);
    expect(detailsComponent.itemProxy.item[fieldName]).toEqual(fieldValue);
  });
  
  it('does not produce an error when the URL contains an invalid id', () => {
    expect(detailsComponent.itemProxy).not.toBeDefined();
  });
})