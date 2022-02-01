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
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Other External Dependencies
import { ToastrModule } from 'ngx-toastr';

// Kohese
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { RepositoryService } from '../../../services/repository/repository.service';
import { RepositoriesComponent, RepositoryContentDialog } from './repositories.component';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { SessionService } from '../../../services/user/session.service';
import { NotificationService } from '../../../services/notifications/notification.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { CacheManager } from '../../../../cache-worker/CacheManager';
import { PipesModule } from "../../../pipes/pipes.module";
import { MaterialModule } from '../../../material.module';

// Mocks
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockVersionControlService } from '../../../../mocks/services/MockVersionControlService';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { MockSessionService } from '../../../../mocks/services/MockSessionService';
import { MockNotificationService } from '../../../../mocks/services/MockNotificationService';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockCacheManager } from '../../../../mocks/services/MockCacheManager';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

describe('Component: Repositories', () => {
  let component: RepositoriesComponent;
  let fixture : ComponentFixture<RepositoriesComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [RepositoriesComponent],
      imports : [
        CommonModule,
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
        { provide: RepositoryService, useClass: MockItemRepository },
        { provide: CacheManager, useClass: MockCacheManager }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RepositoriesComponent);
    component = fixture.componentInstance;

    component.remoteNameInput = 'Remote Name for addRemote';
    component.remoteUrlInput = 'Remote URL for addRemote';
    component.rootProxy = TreeConfiguration.getWorkingTree().getRootProxy();

    fixture.detectChanges();

  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  });

  // TODO: Add Expectations

  it('instantiates the Repositories component', ()=>{
    expect(component).toBeTruthy();
  });

  it('should add a remote repository', () => {

    component.addRemote();

    // expect(toastrService.success()).toHaveBeenCalled();
  });

  it('should get remote repositories', () => {

  });

  it('should commit changes made to a repository', () => {

  });

  it('should push changes made to a repository', () => {

  });

  it('should refresh all repository states', () => {

  });

  it('should unmount a repository', () => {

  });

  it('should disable a repository', () => {

  });

  it('should change the mount point of a repository', () => {

  });

});

describe('Component: RepositoryContentDialog', () => {
  let repositoryContentDialogComponent: RepositoryContentDialog;
  let repositoryContentDialogFixture: ComponentFixture<RepositoryContentDialog>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositoryContentDialog],
      imports : [
        CommonModule,
        MaterialModule,
        MatDialogModule,
        PipesModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        ToastrModule.forRoot()
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: DialogService, useClass: MockDialogService },
        { provide: MatDialogRef, useClass: MockDialogService },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ItemRepository, useClass: MockItemRepository},
        { provide: VersionControlService, useClass: MockVersionControlService},
        { provide: NavigationService, useClass: MockNavigationService},
        { provide: SessionService, useClass: MockSessionService },
        { provide: NotificationService, useClass: MockNotificationService },
        { provide: RepositoryService, useClass: MockItemRepository }
      ]
    }).compileComponents();

    repositoryContentDialogFixture = TestBed.createComponent(RepositoryContentDialog);
    repositoryContentDialogComponent = repositoryContentDialogFixture.componentInstance;

    repositoryContentDialogFixture.detectChanges();
  });

  afterEach(() => {
    repositoryContentDialogFixture.destroy();
    TestBed.resetTestingModule();
  });

  // TODO: Add Expectations

  it('instantiates the RepositoryContentDialog component', () => {
    expect(repositoryContentDialogComponent).toBeTruthy();
  });

  it('sets the repository data', () => {

  });

  it('should mount a repository', () => {

  });

});
