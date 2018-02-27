import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { RepositoriesComponent } from './repositories.component';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { MockVersionControlService } from '../../../../mocks/services/MockVersionControlService';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';

describe('Component: Repositories', ()=>{
  let repositoriesComponent: RepositoriesComponent;
  let repositoriesFixture : ComponentFixture<RepositoriesComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [RepositoriesComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: VersionControlService, useClass: MockVersionControlService},
        {provide: NavigationService, useClass: MockNavigationService}
      ]
    }).compileComponents();

    repositoriesFixture = TestBed.createComponent(RepositoriesComponent);
    repositoriesComponent = repositoriesFixture.componentInstance;

    repositoriesFixture.detectChanges();
    
  })

  it('instantiates the Repositories component', ()=>{
    expect(repositoriesComponent).toBeTruthy(); 
  })
})