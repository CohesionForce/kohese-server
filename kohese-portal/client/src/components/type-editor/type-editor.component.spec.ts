import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { MaterialModule } from '../../material.module';
import { TypeEditorComponent } from './type-editor.component';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { MockDialogService } from '../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { PipesModule } from '../../pipes/pipes.module';
import { TreeViewModule } from '../tree/tree.module';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ComponentDialogComponent } from '../dialog/component-dialog/component-dialog.component';
import { MatDialogRef } from '@angular/material';

describe('Component: Type Editor', ()=>{
  let typeEditorComponent: TypeEditorComponent;
  let typeEditorFixture : ComponentFixture<TypeEditorComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [TypeEditorComponent],
      imports: [
        CommonModule,
        MaterialModule,
        BrowserAnimationsModule,
        PipesModule,
        TreeViewModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        DynamicTypesService,
        {provide: DialogService, useClass: MockDialogService},
        {provide: ItemRepository, useClass: MockItemRepository}
      ]
    }).compileComponents();

    typeEditorFixture = TestBed.createComponent(TypeEditorComponent);
    typeEditorComponent = typeEditorFixture.componentInstance;
    typeEditorFixture.detectChanges();
  });

  it('instantiates the Type Editor component', ()=>{
    expect(typeEditorComponent).toBeTruthy(); 
  });

  it('adds Structures', async () => {
    let openComponentsDialogSpy: jasmine.Spy = spyOn(TestBed.get(
      DialogService), 'openComponentsDialog');
    let matDialogRefPlaceholder: MatDialogRef<ComponentDialogComponent> = {
      updateSize: (width: string, height: string) => {
        return matDialogRefPlaceholder;
      },
      afterClosed: () => {
        return of(['Structure',
          { id: '750c7c00-d658-11ea-80c8-3b7d496d4ca3' }]);
      }
    } as MatDialogRef<ComponentDialogComponent>;
    openComponentsDialogSpy.and.returnValue(matDialogRefPlaceholder);
    await typeEditorComponent.add();
    let metatypeInstanceItemProxy: ItemProxy = TreeConfiguration.
      getWorkingTree().getProxyFor('Structure');
    expect(metatypeInstanceItemProxy).toBeDefined();
    expect(metatypeInstanceItemProxy.item.namespace.id).toBe(
      '750c7c00-d658-11ea-80c8-3b7d496d4ca3');
  });

  it('removes Structures', async () => {
    typeEditorComponent.selectedType = TreeConfiguration.
      getWorkingTree().getProxyFor('Action').item;
    await typeEditorComponent.delete();
    expect(TreeConfiguration.getWorkingTree().getProxyFor('Action')).
      toBeUndefined();
  });
});
