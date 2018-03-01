import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { BehaviorSubject } from 'rxjs';

describe('Component: App Bar', ()=>{
  let appBarComponent: AppBarComponent;
  let appBarFixture : ComponentFixture<AppBarComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [AppBarComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: CurrentUserService, useClass: MockCurrentUserService},
        {provide: SessionService, useClass: MockSessionService},
        {provide: NavigationService, useClass: MockNavigationService}
      ]
    }).compileComponents();

    appBarFixture = TestBed.createComponent(AppBarComponent);
    appBarComponent = appBarFixture.componentInstance;
    
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