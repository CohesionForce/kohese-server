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
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material.module'; // deprecated

// Kohese
import { DetailsComponent } from './details.component';
import { PipesModule } from '../../pipes/pipes.module';
import { ServicesModule } from '../../services/services.module';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';

// Mocks
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';

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

    detailsFixture.detectChanges();
  });

  afterEach(() => {
    detailsFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the details component', () => {
    expect(detailsComponent).toBeTruthy();
  });
});
