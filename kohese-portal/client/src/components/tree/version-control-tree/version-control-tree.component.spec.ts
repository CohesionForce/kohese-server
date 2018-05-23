import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { ToastrModule } from 'ngx-toastr';

import { MaterialModule } from '../../../material.module';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { MockVersionControlService } from '../../../../mocks/services/MockVersionControlService';
import { VersionControlTreeComponent } from './version-control-tree.component';

describe('Component: version-control-tree', () => {
  let component: VersionControlTreeComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VersionControlTreeComponent],
      imports: [
        VirtualScrollModule,
        ToastrModule.forRoot(),
        MaterialModule
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: ActivatedRoute, useValue: { params: Observable.of('') } },
        { provide: DialogService, useClass: MockDialogService },
        {
          provide: VersionControlService,
          useClass: MockVersionControlService
        }
      ]
    }).compileComponents();
    
    let fixture: ComponentFixture<VersionControlTreeComponent> = TestBed.
      createComponent(VersionControlTreeComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });
  
  it('initializes', () => {
    expect(component.getRow('ROOT')).toBeDefined();
  });
});