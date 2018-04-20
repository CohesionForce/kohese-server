import { TestBed, ComponentFixture} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { from } from 'rxjs/observable/from';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../material.module'

import { ExploreComponent } from './explore.component';

import { NavigationService } from '../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
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
          params: from([{id: 1}])
        }}
      ]
    }).compileComponents();

    exploreFixture = TestBed.createComponent(ExploreComponent);
    exploreComponent = exploreFixture.componentInstance;

    exploreFixture.detectChanges();
    
  })

  it('instantiates the Explore component', ()=>{
    expect(exploreComponent).toBeTruthy(); 
  })
  it('should display the details view when an id is provided', ()=>{
    expect(exploreComponent.proxySelected).toBeTruthy();
  })
})