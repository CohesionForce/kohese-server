import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatSelectModule, MatIconModule, MatTooltipModule, MatCheckboxModule,
  MatInputModule, MatDatepickerModule, MatExpansionModule,
  MatDialogModule } from '@angular/material';
import { MarkdownModule, MarkdownService, MarkedOptions } from 'ngx-markdown';

import { TableModule } from '../../table/table.module';
import { MarkdownEditorModule } from '../../markdown-editor/markdown-editor.module';
import { FormatObjectEditorComponent } from './format-object-editor.component';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';

describe('FormatObjectEditorComponent', () => {
  let component: FormatObjectEditorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormatObjectEditorComponent],
      imports: [
        CommonModule,
        FormsModule,
        BrowserAnimationsModule,
        MatSelectModule,
        MatIconModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatInputModule,
        MatDatepickerModule,
        MatExpansionModule,
        MatDialogModule,
        MarkdownModule,
        TableModule,
        MarkdownEditorModule
      ],
      providers: [
        MarkdownService,
        MarkedOptions,
        { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository }
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<FormatObjectEditorComponent> =
      TestBed.createComponent(FormatObjectEditorComponent);
    component = componentFixture.componentInstance;

    let treeConfiguration: TreeConfiguration = TestBed.get(ItemRepository).
      getTreeConfig().getValue().config;
    component.object = treeConfiguration.getProxyFor('KoheseModel').item;
    component.formatDefinitionType = FormatDefinitionType.DEFAULT;
    component.type = component.object;

    componentFixture.detectChanges();
  });
});
