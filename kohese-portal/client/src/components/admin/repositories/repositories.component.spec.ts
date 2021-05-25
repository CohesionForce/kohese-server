import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { MaterialModule } from '../../../material.module'
import { PipesModule } from "../../../pipes/pipes.module";

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { RepositoryService } from '../../../services/repository/repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { RepositoriesComponent } from './repositories.component';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { MockVersionControlService } from '../../../../mocks/services/MockVersionControlService';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { SessionService } from '../../../services/user/session.service';
import { MockSessionService } from '../../../../mocks/services/MockSessionService';
import { NotificationService } from '../../../services/notifications/notification.service';
import { MockNotificationService } from '../../../../mocks/services/MockNotificationService';
import { DialogService } from '../../../services/dialog/dialog.service';
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
