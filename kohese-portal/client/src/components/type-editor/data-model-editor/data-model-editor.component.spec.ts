import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule, MatDialogRef, MatExpansionModule, MatIconModule,
  MatInputModule, MatMenuModule, MatSelectModule,
  MatTableModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of as observableOf } from 'rxjs';

import { Enumeration,
  EnumerationValue } from '../../../../../common/src/Enumeration.interface';
import { KoheseDataModel } from '../../../../../common/src/KoheseModel.interface';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { Metatype, Type } from '../../../../../common/src/Type.interface';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { ComponentDialogComponent } from '../../dialog/component-dialog/component-dialog.component';
import { DataModelEditorComponent } from './data-model-editor.component';

describe('DataModelEditorComponent', () => {
  let component: DataModelEditorComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataModelEditorComponent],
      imports: [
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        MatCheckboxModule,
        MatMenuModule,
        MatExpansionModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    
    let componentFixture: ComponentFixture<DataModelEditorComponent> = TestBed.
      createComponent(DataModelEditorComponent);
    component = componentFixture.componentInstance;
    component.dataModel = TestBed.get(ItemRepository).getTreeConfig().
      getValue().config.getProxyFor('KoheseModel').item;

    componentFixture.detectChanges();
  });

  it('adds a local type', async () => {
    let matDialogRefPlaceholder: MatDialogRef<ComponentDialogComponent> = ({
      'updateSize': (width: string, height: string) => {
        return matDialogRefPlaceholder;
      },
      'afterClosed': () => {
        return observableOf(['Another Local Type', {
          attribute: {
            name: 'attribute'
          },
          view: {
            displayName: 'Attribute'
          }
        }]);
      }
    } as MatDialogRef<ComponentDialogComponent>);
    spyOn(TestBed.get(DialogService), 'openComponentsDialog').and.returnValue(
      matDialogRefPlaceholder);
    await component.addLocalType(Metatype.STRUCTURE);
    let localTypeNames: Array<string> = Object.keys(component.dataModel.
      localTypes);
    let localTypeDataModel: Type = component.dataModel.localTypes[
      localTypeNames[localTypeNames.length - 1]];
    expect(localTypeDataModel.metatype).toEqual(Metatype.STRUCTURE);
    expect(localTypeDataModel.name).toBeTruthy();
    expect(Object.keys((localTypeDataModel as KoheseDataModel).properties).
      length).toBeGreaterThan(0);

    await component.addLocalType(Metatype.ENUMERATION);
    localTypeNames = Object.keys(component.dataModel.localTypes);
    localTypeDataModel = component.dataModel.localTypes[localTypeNames[
      localTypeNames.length - 1]];
    expect(localTypeDataModel.metatype).toEqual(Metatype.ENUMERATION);
    expect(localTypeDataModel.name).toBeTruthy();

    matDialogRefPlaceholder.afterClosed = () => {
      return observableOf(['Another Variant', { attribute:
        { name: 'attribute' }, view: { displayName: 'Attribute' } }]);
    };
    await component.addLocalType(Metatype.VARIANT);
    localTypeNames = Object.keys(component.dataModel.localTypes);
    localTypeDataModel = component.dataModel.localTypes[localTypeNames[
      localTypeNames.length - 1]];
    expect(localTypeDataModel.metatype).toEqual(Metatype.VARIANT);
    expect(localTypeDataModel.name).toBeTruthy();
    expect(Object.keys((localTypeDataModel as KoheseDataModel).properties).
      length).toBeGreaterThan(0);
  });
  
  // it('removes an attribute', fakeAsync(() => {
  //   // Test global and local type attribute removal
  //   let attributeName: string = 'tags';
  //   component.removeAttribute(attributeName);
  //   tick();
  //   expect(component.dataModel.properties[attributeName]).not.toBeDefined();
  //   let typeViewModel: any;
  //   expect(typeViewModel.viewProperties[attributeName].not.toBeDefined());
    
  //   let examineFormatDefinitions: (viewModel: any) => void = (viewModel:
  //     any) => {
  //     expect(viewModel.formatDefinitions[viewModel.defaultFormatKey[
  //       FormatDefinitionType.DEFAULT]].containers[0].contents.map(
  //       (propertyDefinition: PropertyDefinition) => {
  //       return propertyDefinition.propertyName;
  //     }).indexOf(attributeName)).toEqual(-1);
  //     let formatDefinition: FormatDefinition = viewModel.formatDefinition[
  //       viewModel.defaultFormatKey[FormatDefinitionType.DOCUMENT]];
  //     for (let j: number = 0; j < formatDefinition.containers.length; j++) {
  //       let formatContainer: FormatContainer = formatDefinition.containers[j];
  //       if (formatContainer.kind === FormatContainerKind.
  //         REVERSE_REFERENCE_TABLE) {
  //         expect(formatContainer.contents.map((propertyDefinition:
  //           PropertyDefinition) => {
  //           return propertyDefinition.propertyName.attribute;
  //         }).indexOf(attributeName)).toEqual(-1);
  //       } else {
  //         expect(formatContainer.contents.map((propertyDefinition:
  //           PropertyDefinition) => {
  //           return propertyDefinition.propertyName;
  //         }).indexOf(attributeName)).toEqual(-1);
  //       }
  //     }
  //   };
    
  //   examineFormatDefinitions(typeViewModel);
  //   let subtypeViewModel: any;
  //   examineFormatDefinitions(subtypeViewModel);
  // }));

  it('determines if two Namespace references are equal', () => {
    expect(component.areNamespaceReferencesEqual(null, null)).toBe(true);
    expect(component.areNamespaceReferencesEqual({ id: '' }, null)).toBe(
      false);
    expect(component.areNamespaceReferencesEqual({ id: '' }, { id: '' })).toBe(
      true);
  });

  it('retrieves all Namespaces', () => {
    expect(component.getNamespaces()).toEqual([TreeConfiguration.
      getWorkingTree().getProxyFor('750c7c00-d658-11ea-80c8-3b7d496d4ca3').
      item]);
  });
  
  it('adds an EnumerationValue', async () => {
    let enumeration: Enumeration = {
      metatype: Metatype.ENUMERATION,
      id: 'Enumeration',
      name: 'Enumeration',
      values: []
    };
    await component.addEnumerationValue(enumeration);
    expect(enumeration.values.length).toBeGreaterThan(0);
    expect(enumeration.values[0].name).toBeTruthy();
  });

  it('removes an EnumerationValue', async () => {
    let enumerationValue: EnumerationValue = {
      name: 'EnumerationValue',
      description: 'Description'
    };
    let enumeration: Enumeration = {
      metatype: Metatype.ENUMERATION,
      id: 'Enumeration',
      name: 'Enumeration',
      values: [enumerationValue]
    };
    await component.removeEnumerationValue(enumeration, enumeration.values[0]);
    expect(enumeration.values.indexOf(enumerationValue)).toEqual(-1);
  });
});
