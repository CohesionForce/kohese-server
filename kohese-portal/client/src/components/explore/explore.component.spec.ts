import { TestBed, ComponentFixture} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { from as ObservableFrom } from 'rxjs';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../material.module'

import { ExploreComponent } from './explore.component';

import { NavigationService } from '../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { ActivatedRoute } from '@angular/router';
import { LensModule } from '../lens/lens.module';

describe('Component: Explore', ()=>{
  let exploreComponent: ExploreComponent;
  let exploreFixture : ComponentFixture<ExploreComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ExploreComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: NavigationService, useClass: MockNavigationService},
        {provide: ActivatedRoute, useValue:{
          params: ObservableFrom([{id: 'test-uuid7'}])
        }},
        {provide: ItemRepository, useClass: MockItemRepository}
      ]
    }).compileComponents();

    exploreFixture = TestBed.createComponent(ExploreComponent);
    exploreComponent = exploreFixture.componentInstance;

    exploreFixture.detectChanges();
    
  })

  it('instantiates the Explore component', ()=>{
    expect(exploreComponent).toBeTruthy(); 
  });
  
  it('should display details-view', () => {
    expect(exploreComponent.itemProxy).toBeTruthy();
  });
})