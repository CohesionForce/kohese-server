import { TestBed, ComponentFixture, fakeAsync,
  tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule, MatIconModule, MatInputModule, MatSelectModule,
  MatTableModule, MatCheckboxModule, MatExpansionModule,
  MatDialogRef } from '@angular/material';
import { of as observableOf } from 'rxjs';

import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { ComponentDialogComponent } from '../../dialog/component-dialog/component-dialog.component';
import { DataModelEditorComponent } from './data-model-editor.component';
import { Type, TypeKind } from '../../../../../common/src/Type.interface';
import { KoheseDataModel } from '../../../../../common/src/KoheseModel.interface';
import { Enumeration,
  EnumerationValue } from '../../../../../common/src/Enumeration.interface';
import { FormatDefinition,
  FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { FormatContainer,
  FormatContainerKind } from '../../../../../common/src/FormatContainer.interface';
import { PropertyDefinition } from '../../../../../common/src/PropertyDefinition.interface';

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
    await component.addLocalType(TypeKind.KOHESE_MODEL);
    let localTypeNames: Array<string> = Object.keys(component.dataModel.
      localTypes);
    let localTypeDataModel: Type = component.dataModel.localTypes[
      localTypeNames[localTypeNames.length - 1]];
    expect(localTypeDataModel.typeKind).toEqual(TypeKind.KOHESE_MODEL);
    expect(localTypeDataModel.name).toBeTruthy();
    expect(Object.keys((localTypeDataModel as KoheseDataModel).properties).
      length).toBeGreaterThan(0);

    await component.addLocalType(TypeKind.ENUMERATION);
    localTypeNames = Object.keys(component.dataModel.localTypes);
    localTypeDataModel = component.dataModel.localTypes[localTypeNames[
      localTypeNames.length - 1]];
    expect(localTypeDataModel.typeKind).toEqual(TypeKind.ENUMERATION);
    expect(localTypeDataModel.name).toBeTruthy();

    matDialogRefPlaceholder.afterClosed = () => {
      return observableOf(['Another Variant', { attribute:
        { name: 'attribute' }, view: { displayName: 'Attribute' } }]);
    };
    await component.addLocalType(TypeKind.VARIANT);
    localTypeNames = Object.keys(component.dataModel.localTypes);
    localTypeDataModel = component.dataModel.localTypes[localTypeNames[
      localTypeNames.length - 1]];
    expect(localTypeDataModel.typeKind).toEqual(TypeKind.VARIANT);
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

  it('adds an EnumerationValue', async () => {
    let enumeration: Enumeration = {
      typeKind: TypeKind.ENUMERATION,
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
      typeKind: TypeKind.ENUMERATION,
      id: 'Enumeration',
      name: 'Enumeration',
      values: [enumerationValue]
    };
    await component.removeEnumerationValue(enumeration, enumeration.values[0]);
    expect(enumeration.values.indexOf(enumerationValue)).toEqual(-1);
  });
});
