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


import { TestBed, ComponentFixture} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { AppBarComponent } from './appbar.component';

import { ItemRepository, RepoStates } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository} from '../../../../mocks/services/MockItemRepository';
import { CurrentUserService } from '../../../services/user/current-user.service';
import { MockCurrentUserService } from '../../../../mocks/services/MockCurrentUserService';
import { SessionService } from '../../../services/user/session.service';
import { MockSessionService } from '../../../../mocks/services/MockSessionService';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { NotificationService } from '../../../services/notifications/notification.service';
import { MockNotificationService } from '../../../../mocks/services/MockNotificationService';
import { BehaviorSubject } from 'rxjs';

describe('Component: App Bar', ()=>{
  let appBarComponent: AppBarComponent;
  let appBarFixture : ComponentFixture<AppBarComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [AppBarComponent],
      imports: [
        CommonModule,
        MaterialModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: CurrentUserService, useClass: MockCurrentUserService},
        {provide: SessionService, useClass: MockSessionService},
        {provide: NavigationService, useClass: MockNavigationService},
        { provide: NotificationService, useClass: MockNotificationService }
      ]
    }).compileComponents();

    appBarFixture = TestBed.createComponent(AppBarComponent);
    appBarComponent = appBarFixture.componentInstance;

  })

  afterEach(() => {
    appBarFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('displays a syncing message', ()=>{
    spyOn(TestBed.get(ItemRepository), 'getRepoStatusSubject').and.returnValue(
      new BehaviorSubject<any>({state : RepoStates.SYNCHRONIZING}))
    appBarFixture.detectChanges();
    expect(appBarComponent.syncStatusString).toBe('Syncing');
  })

  it('displays a sync failed message', ()=>{
    spyOn(TestBed.get(ItemRepository), 'getRepoStatusSubject').and.returnValue(
      new BehaviorSubject<any>({state : RepoStates.SYNCHRONIZATION_FAILED}))
      appBarFixture.detectChanges();
      expect(appBarComponent.syncStatusString).toBe('Synchronization Failed');
  })

  it('displays a disconnected message', ()=>{
    spyOn(TestBed.get(ItemRepository), 'getRepoStatusSubject').and.returnValue(
      new BehaviorSubject<any>({state : RepoStates.DISCONNECTED}))
      appBarFixture.detectChanges();
      expect(appBarComponent.syncStatusString).toBe('Disconnected');
  })

  it('instantiates the App Bar component', ()=>{
    appBarFixture.detectChanges();
    expect(appBarComponent).toBeTruthy();
  })


})
