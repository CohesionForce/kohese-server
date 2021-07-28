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
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';

// NPM
import { ToastrModule } from 'ngx-toastr';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { RepositoryService } from '../../../services/repository/repository.service';
import { RepositoriesComponent } from './repositories.component';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { SessionService } from '../../../services/user/session.service';
import { NotificationService } from '../../../services/notifications/notification.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { PipesModule } from "../../../pipes/pipes.module";
import { MaterialModule } from '../../../material.module'; // deprecated

// Mocks
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockVersionControlService } from '../../../../mocks/services/MockVersionControlService';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { MockSessionService } from '../../../../mocks/services/MockSessionService';
import { MockNotificationService } from '../../../../mocks/services/MockNotificationService';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';

describe('Component: Repositories', ()=>{
  let repositoriesComponent: RepositoriesComponent;
  let repositoriesFixture : ComponentFixture<RepositoriesComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [RepositoriesComponent],
      imports : [CommonModule,
         MaterialModule,
         PipesModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule,
         ToastrModule.forRoot()
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository},
        { provide: VersionControlService, useClass: MockVersionControlService},
        { provide: NavigationService, useClass: MockNavigationService},
        { provide: SessionService, useClass: MockSessionService },
        { provide: NotificationService, useClass: MockNotificationService },
        { provide: RepositoryService, useClass: MockItemRepository }
      ]
    }).compileComponents();

    repositoriesFixture = TestBed.createComponent(RepositoriesComponent);
    repositoriesComponent = repositoriesFixture.componentInstance;

    repositoriesFixture.detectChanges();

  })

  afterEach(() => {
    repositoriesFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the Repositories component', ()=>{
    expect(repositoriesComponent).toBeTruthy();
  })
})
