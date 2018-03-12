import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { NavigationService } from '../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../mocks/services/MockDynamicTypesService';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { SessionService } from '../../services/user/session.service';
import { MockSessionService } from '../../../mocks/services/MockSessionService';
import { ActivatedRoute } from '@angular/router';
import { TreeComponent } from './tree.component';
import { Observable } from 'rxjs/Observable';

describe('Component: Tree', () => {
  let fixture: ComponentFixture<TreeComponent>;
  let component: TreeComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TreeComponent],
      providers: [
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: DynamicTypesService, useClass: MockDynamicTypesService },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: SessionService, useClass: MockSessionService },
        { provide: ActivatedRoute, useValue: {
            params: Observable.of({
                id: 7
              })
          } }
      ],
      imports: [FormsModule, BrowserAnimationsModule, MaterialModule,
        PipesModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    
    fixture = TestBed.createComponent(TreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('filters when the selected view changes', () => {
    expect(component.filterStream.getValue().status).toEqual(false);
    component.viewSelectionChanged('Version Control');
    expect(component.filterStream.getValue().status).toEqual(true);
  });
});