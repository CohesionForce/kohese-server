import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule, MatDatepickerModule, MatDialogModule,
  MatExpansionModule, MatIconModule, MatInputModule, MatSelectModule,
  MatTooltipModule } from '@angular/material';
import { MarkdownModule } from 'ngx-markdown';

import { MarkdownEditorModule } from '../../../../../components/markdown-editor/markdown-editor.module';
import { FormatDefinitionType } from '../../../../../../../common/src/FormatDefinition.interface';
import { PropertyDefinition } from '../../../../../../../common/src/PropertyDefinition.interface';
import { TreeConfiguration } from '../../../../../../../common/src/tree-configuration';
import { MockDialogService } from '../../../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../../../mocks/services/MockItemRepository';
import { MockSessionService } from '../../../../../../mocks/services/MockSessionService';
import { DialogService } from '../../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../../../services/user/session.service';
import { FormatObjectEditorComponent } from '../../format-object-editor.component';
import { MultivaluedFieldComponent } from '../multivalued-field/multivalued-field.component';
import { SinglevaluedFieldComponent } from './singlevalued-field.component';

describe('SinglevaluedFieldComponent', () => {
  let component: SinglevaluedFieldComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        SinglevaluedFieldComponent,
        FormatObjectEditorComponent,
        MultivaluedFieldComponent
      ],
      imports: [
        FormsModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatInputModule,
        MatDatepickerModule,
        MatIconModule,
        MatSelectModule,
        MatExpansionModule,
        MatDialogModule,
        MarkdownModule,
        MarkdownEditorModule
      ],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService },
        { provide: SessionService, useClass: MockSessionService }
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<SinglevaluedFieldComponent> =
      TestBed.createComponent(SinglevaluedFieldComponent);
    component = componentFixture.componentInstance;

    let treeConfiguration: TreeConfiguration = TestBed.get(ItemRepository).
      getTreeConfig().getValue().config;
    component.koheseObject = treeConfiguration.getProxyFor('KoheseModel').item;
    component.dataModel = component.koheseObject;
    component.viewModel = treeConfiguration.getProxyFor('view-kohesemodel').item;
    component.propertyDefinition = component.viewModel.formatDefinitions[
      component.viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]].
      containers[0].contents.filter((propertyDefinition:
      PropertyDefinition) => {
      return (propertyDefinition.propertyName === 'id');
    })[0];
    component.formatDefinitionType = FormatDefinitionType.DEFAULT;

    componentFixture.detectChanges();
  });
});
