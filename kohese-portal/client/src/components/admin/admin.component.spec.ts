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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'

// Other External Dependencies

// Kohese
import { NavigationService } from '../../services/navigation/navigation.service';
import { SessionService } from '../../services/user/session.service';
import { LensService } from '../../services/lens-service/lens.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { AdminComponent } from './admin.component';
import { CacheManager } from '../../../../client/cache-worker/CacheManager';
import { PipesModule } from '../../pipes/pipes.module';
import { MaterialModule } from '../../material.module';

// Mocks
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { MockDialogService } from '../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockSessionService } from '../../../mocks/services/MockSessionService';
import { MockLensService } from '../../../mocks/services/MockLensService';
import { MockCacheManager } from '../../../mocks/services/MockCacheManager';

describe('Component: Admin', () => {
  let adminComponent: AdminComponent;
  let adminFixture : ComponentFixture<AdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminComponent],
      imports : [
        CommonModule,
        MaterialModule,
        BrowserAnimationsModule,
        PipesModule,
        FormsModule,
        ReactiveFormsModule
        ],
      schemas: [NO_ERRORS_SCHEMA],

      providers: [
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: SessionService, useClass: MockSessionService },
        { provide: DialogService, useClass: MockDialogService },
        { provide: LensService, useClass: MockLensService },
        { provide: CacheManager, useClass: MockCacheManager }

      ]
    }).compileComponents();

    adminFixture = TestBed.createComponent(AdminComponent);
    adminComponent = adminFixture.componentInstance;

    adminFixture.detectChanges();
  });

  afterEach(() => {
    adminFixture.destroy();
  });

  it('should instantiate the admin component', () => {
   expect(AdminComponent).toBeTruthy();
  });

});
