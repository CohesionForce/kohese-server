import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'

import { DetailsComponent } from './details.component';
import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ServicesModule } from '../../services/services.module';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { NavigationService } from '../../services/navigation/navigation.service';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';

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
         BrowserAnimationsModule
         ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: NavigationService, useClass: MockNavigationService}
      ]
    }).compileComponents();

    detailsFixture = TestBed.createComponent(DetailsComponent);
    detailsComponent = detailsFixture.componentInstance;
    detailsComponent.itemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor('test-uuid3');
    detailsComponent.onFormGroupUpdated({
      value: {}
    });

    detailsFixture.detectChanges();
    
  })

  it('instantiates the details component', ()=>{
    expect(detailsComponent).toBeTruthy(); 
  })
  
  it('changes non-form fields on the input ItemProxy when changes are saved',
    () => {
    let fieldName: string = 'modifiedOn';
    let fieldValue: any = new Date().getTime();
    detailsComponent.onNonFormFieldChanged({
      fieldName: fieldName,
      fieldValue: fieldValue
    });
    detailsComponent.itemProxy = TestBed.get(ItemRepository).getProxyFor(
      'test-uuid7');
    spyOn(TestBed.get(ItemRepository), 'upsertItem').and.returnValue(Promise.
      resolve());
    detailsComponent.upsertItem();
    expect(detailsComponent.itemProxy.item[fieldName]).toEqual(fieldValue);
  });
})