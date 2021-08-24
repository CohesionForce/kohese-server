/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { TestBed, ComponentFixture} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { from as ObservableFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material.module';

// Kohese
import { ExploreComponent } from './explore.component';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { ActivatedRoute } from '@angular/router';

// Mocks
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';

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

  afterEach(() => {
    exploreFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the Explore component', ()=>{
    expect(exploreComponent).toBeTruthy();
  });

  it('should display details-view', () => {
    expect(exploreComponent.itemProxy).toBeTruthy();
  });
})
