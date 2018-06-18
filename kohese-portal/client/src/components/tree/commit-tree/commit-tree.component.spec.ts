import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { MaterialModule } from '../../../material.module';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { LensService } from '../../../services/lens-service/lens.service';
import { MockLensService } from '../../../../mocks/services/MockLensService';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { CommitTreeComponent } from './commit-tree.component';

describe('Component: commit-tree', () => {
  let component: CommitTreeComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommitTreeComponent],
      providers: [ {
          provide: ActivatedRoute,
          useValue: { params: Observable.of({ id: '' })}
        }, { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: LensService, useClass: MockLensService },
        { provide: NavigationService, useClass: MockNavigationService }
      ],
      imports: [
        VirtualScrollModule,
        MaterialModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    
    let fixture: ComponentFixture<CommitTreeComponent> = TestBed.
      createComponent(CommitTreeComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });
});