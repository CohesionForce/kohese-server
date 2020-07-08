import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule, MatExpansionModule, MatIconModule, MatInputModule,
  MatBadgeModule, MatTableModule, MatSelectModule, MatDividerModule,
  MatListModule } from '@angular/material';

import { ObjectEditorModule } from '../../object-editor/object-editor.module';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ViewModelEditorComponent } from './view-model-editor.component';
import { TableEditorComponent } from '../format-editor/table-editor/table-editor.component';

describe('ViewModelEditorComponent', () => {
  let component: ViewModelEditorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ViewModelEditorComponent,
        TableEditorComponent
      ],
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MatTooltipModule,
        MatIconModule,
        MatExpansionModule,
        MatInputModule,
        MatBadgeModule,
        MatTableModule,
        MatSelectModule,
        MatDividerModule,
        MatListModule,
        ObjectEditorModule
      ],
      providers: [
        { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository }
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<ViewModelEditorComponent> = TestBed.
      createComponent(ViewModelEditorComponent);
    component = componentFixture.componentInstance;

    let treeConfiguration: TreeConfiguration = TestBed.get(ItemRepository).
      getTreeConfig().getValue().config;
    component.viewModel = treeConfiguration.getProxyFor('view-kohesemodel').item;
    component.dataModel = treeConfiguration.getProxyFor('KoheseModel').item;

    componentFixture.detectChanges();
  });

  it('retrieves an identifier for a given EnumerationValue at the given ' +
    'index', () => {
    expect(component.getEnumerationValueIdentifier(3,
      { name: 'EnumerationValue', description: '' })).toBe('3');
  });
});
