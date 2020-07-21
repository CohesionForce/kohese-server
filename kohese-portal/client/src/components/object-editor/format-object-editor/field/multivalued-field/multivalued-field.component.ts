import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
  QueryList, ViewChildren } from '@angular/core';
import { MatExpansionPanel } from '@angular/material';

import { Attribute } from '../../../../../../../common/src/Attribute.interface';
import { EnumerationValue } from '../../../../../../../common/src/Enumeration.interface';
import { ItemProxy } from '../../../../../../../common/src/item-proxy';
import { KoheseDataModel } from '../../../../../../../common/src/KoheseModel.interface';
import { PropertyDefinition } from '../../../../../../../common/src/PropertyDefinition.interface';
import { TreeConfiguration } from '../../../../../../../common/src/tree-configuration';
import { TypeKind } from '../../../../../../../common/src/Type.interface';
import { TreeComponent } from '../../../../../components/tree/tree.component';
import { DialogService } from '../../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../../../services/user/session.service';
import { Field } from '../field.class';

/**
 * Displays a multivalued attribute based on the given PropertyDefinition
 */
@Component({
  selector: 'multivalued-field',
  templateUrl: './multivalued-field.component.html',
  styleUrls: ['./multivalued-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultivaluedFieldComponent extends Field {
  @ViewChildren('multivaluedAttributeExpansionPanel')
  private _multivaluedAttributeExpansionPanelQueryList:
    QueryList<MatExpansionPanel>;
  @ViewChildren('multivaluedAttributeExpansionPanel', { read: ElementRef })
  private _multivaluedAttributeExpansionPanelElementQueryList:
    QueryList<ElementRef>;
    
  public constructor(changeDetectorRef: ChangeDetectorRef, itemRepository:
    ItemRepository, dialogService: DialogService, sessionService:
    SessionService) {
    super(changeDetectorRef, itemRepository, dialogService, sessionService);
  }

  /**
   * Returns the values of the multivalued attribute corresponding to the given
   * PropertyDefinition
   * 
   * @param attributeName The name of a multivalued attribute for which a table
   * is to be displayed
   */
  public getTableElements(attributeName: string): Array<any> {
    let value: Array<any> = this._koheseObject[this._isVariantField ? 'value' :
      attributeName];
    if (value) {
      return value.map((reference: { id: string }) => {
        let typeName: string = this._dataModel['classProperties'][
          attributeName].definition.type[0];
        if ((this._enclosingDataModel ? this._enclosingDataModel : this.
          _dataModel)['classLocalTypes'][typeName]) {
          return reference;
        } else {
          return this._itemRepository.getTreeConfig().getValue().config.
            getProxyFor(reference.id).item;
        }
      });
    }
    
    return [];
  }
  
  /**
   * Returns the attribute names from the TableDefinition associated with the
   * given PropertyDefinition that corresponds to the type of the
   * corresponding multivalued attribute
   * 
   * @param propertyDefinition A PropertyDefinition with an associated
   * TableDefinition corresponding to a multivalued attribute
   */
  public getTableColumns(propertyDefinition: PropertyDefinition):
    Array<string> {
    let typeName: string = this._dataModel['classProperties'][
      propertyDefinition.propertyName].definition.type[0];
    let treeConfiguration: TreeConfiguration = this._itemRepository.
      getTreeConfig().getValue().config;
    let classLocalTypesEntry:
      { definedInKind: string, definition: KoheseDataModel } = (this.
      _enclosingDataModel ? this._enclosingDataModel : this._dataModel)[
      'classLocalTypes'][typeName];
    if (classLocalTypesEntry) {
      return treeConfiguration.getProxyFor('view-' + classLocalTypesEntry.
        definedInKind.toLowerCase()).item.localTypes[typeName].
        tableDefinitions[propertyDefinition.tableDefinition].columns;
    } else {
      return treeConfiguration.getProxyFor('view-' + this._dataModel[
        'classProperties'][propertyDefinition.propertyName].definition.type[0].
        toLowerCase()).item.tableDefinitions[propertyDefinition.
        tableDefinition].columns;
    }
  }

  /**
   * Returns a function intended to be called by TableComponent to retrieve
   * text for the table cell indicated by the given row and column identifier
   * 
   * @param attributeName The name of a multivalued attribute for which a table
   * is to be displayed
   */
  public getTableCellTextRetrievalFunction(attributeName: string): (row: any,
    columnId: string) => string {
    return (row: any, columnId: string) => {
      if (row[columnId] == null) {
        return '';
      }
      
      let type: any = this._dataModel['classProperties'][attributeName].
        definition.type;
      type = (Array.isArray(type) ? type[0] : type);
      let treeConfiguration: TreeConfiguration = this._itemRepository.
        getTreeConfig().getValue().config;
      let dataModel: any;
      let viewModel: any;
      let classLocalTypesEntry: any = (this._enclosingDataModel ? this.
        _enclosingDataModel : this._dataModel)['classLocalTypes'][type];
      if (classLocalTypesEntry) {
        dataModel = classLocalTypesEntry.definition;
        viewModel = this._itemRepository.getTreeConfig().getValue().config.
          getProxyFor('view-' + classLocalTypesEntry.definedInKind.
          toLowerCase()).item.localTypes[type];
      } else {
        dataModel = treeConfiguration.getProxyFor(type).item;
        viewModel = treeConfiguration.getProxyFor('view-' + type.
          toLowerCase()).item;
      }
      
      if (Array.isArray(dataModel.classProperties[columnId].definition.type)) {
        return row[columnId].map((value: any, index: number) => {
          let representation: string;
          if (dataModel.typeKind === TypeKind.ENUMERATION) {
            representation = viewModel.values[dataModel.values.map(
              (enumerationValue: EnumerationValue) => {
              return enumerationValue.name;
            }).indexOf(value)];
          } else {
            representation = this._itemRepository.getStringRepresentation(
              row, columnId, index, (this._enclosingDataModel ? this.
              _enclosingDataModel : this._dataModel), dataModel, viewModel,
              this._formatDefinitionType);
          }

          // Bullet-ize string representation
          return ('\u2022 ' + representation);
        }).join('\n');
      } else {
        if (dataModel.typeKind === TypeKind.ENUMERATION) {
          return viewModel.values[dataModel.values.map((enumerationValue:
            EnumerationValue) => {
            return enumerationValue.name;
          }).indexOf(row[columnId])];
        } else {
          return this._itemRepository.getStringRepresentation(row, columnId,
            undefined, (this._enclosingDataModel ? this._enclosingDataModel :
            this._dataModel), dataModel, viewModel, this.
            _formatDefinitionType);
        }
      }
    };
  }
  
  /**
   * Returns a function intended to be called by TableComponent to add elements
   * to a multivalued attribute
   * 
   * @param attributeName The name of a multivalued attribute for which a table
   * is to be displayed and to which elements are to be added
   */
  public getTableElementAdditionFunction(attributeName: string):
    () => Promise<Array<any>> {
    return async () => {
      let references: Array<{ id: string }> = this._koheseObject[this.
        _isVariantField ? 'value' : attributeName];
      if (!references) {
        references = this._koheseObject[this._isVariantField ? 'value' :
          attributeName] = [];
      }
      let selection: any = await this._dialogService.openComponentDialog(
        TreeComponent, {
        data: {
          root: TreeConfiguration.getWorkingTree().getRootProxy(),
          getChildren: (element: any) => {
            return (element as ItemProxy).children;
          },
          getText: (element: any) => {
            return (element as ItemProxy).item.name;
          },
          maySelect: (element: any) => {
            let typeName: string = this._dataModel['classProperties'][
              attributeName].definition.type[0];
            if (typeName === 'Item') {
              return true;
            }
            
            let elementTypeName: string = (element as ItemProxy).kind;
            while (true) {
              if (elementTypeName === typeName) {
                return true;
              }
              
              let itemProxy: ItemProxy = this._itemRepository.getTreeConfig().
                getValue().config.getProxyFor(elementTypeName);
              if (itemProxy) {
                elementTypeName = itemProxy.item.base;
              } else {
                break;
              }
            }
            
            return true;
          },
          getIcon: (element: any) => {
            return this._itemRepository.getTreeConfig().getValue().config.
              getProxyFor('view-' + (element as ItemProxy).kind.toLowerCase()).
              item.icon;
          },
          selection: references.map((reference: { id: string }) => {
            return TreeConfiguration.getWorkingTree().getProxyFor(reference.
              id);
          }),
          quickSelectElements: this._itemRepository.getRecentProxies(),
          allowMultiselect: true,
          showSelections: true
        }
      }).updateSize('90%', '90%').afterClosed().toPromise();
      
      let rows: Array<any> = [];
      if (selection) {
        references.length = 0;
        references.push(...selection.map((itemProxy: ItemProxy) => {
          return { id: itemProxy.item.id };
        }));
      }

      rows.push(...references.map((reference: { id: string }) => {
        return TreeConfiguration.getWorkingTree().getProxyFor(reference.id).
          item;
      }));
      
      // Delete the array if it becomes empty
      if (references.length === 0) {
        delete this._koheseObject[this._isVariantField ? 'value' :
          attributeName];
      }
      
      this._changeDetectorRef.markForCheck();
      return rows;
    };
  }
  
  /**
   * Returns a function intended to be called by TableComponent to move the
   * given elements before or after the given reference element
   * 
   * @param attributeName The name of a multivalued attribute for which a table
   * is to be displayed and elements are to be moved
   */
  public getTableElementMovementFunction(attributeName: string): (elements:
    Array<any>, referenceElement: any, moveBefore: boolean) => void {
    return (elements: Array<any>, referenceElement: any,
      moveBefore: boolean) => {
      let references: Array<any> = this._koheseObject[this._isVariantField ?
        'value' : attributeName];
      let treeConfiguration: TreeConfiguration = this._itemRepository.
        getTreeConfig().getValue().config;
      let isLocalTypeAttribute: boolean = (this._enclosingDataModel ? this.
        _enclosingDataModel : this._dataModel)['classLocalTypes'][this.
        _dataModel['classProperties'][attributeName].
        definition.type[0]];
      if (isLocalTypeAttribute) {
        for (let j: number = 0; j < elements.length; j++) {
          references.splice(references.indexOf(elements[j]), 1);
        }
      } else {
        for (let j: number = 0; j < elements.length; j++) {
          references.splice(references.map((reference: { id: string }) => {
            return treeConfiguration.getProxyFor(reference.id).item;
          }).indexOf(elements[j]), 1);
        }
      }
      
      if (moveBefore) {
        if (isLocalTypeAttribute) {
          references.splice(references.indexOf(referenceElement), 0,
            ...elements);
        } else {
          references.splice(references.map((reference: { id: string }) => {
            return treeConfiguration.getProxyFor(reference.id).item;
          }).indexOf(referenceElement), 0, ...elements.map((item: any) => {
            return { id: item.id };
          }));
        }
      } else {
        if (isLocalTypeAttribute) {
          references.splice(references.indexOf(referenceElement) + 1, 0,
            ...elements);
        } else {
          references.splice(references.map((reference: { id: string }) => {
            return treeConfiguration.getProxyFor(reference.id).item;
          }).indexOf(referenceElement) + 1, 0, ...elements.map((item: any) => {
            return { id: item.id };
          }));
        }
      }

      this._changeDetectorRef.markForCheck();
    };
  }
  
  /**
   * Returns a function intended to be called by TableComponent to remove the
   * given elements from a multivalued attribute
   * 
   * @param attributeName The name of a multivalued attribute for which a table
   * is to be displayed and from which elements are to be removed
   */
  public getTableElementRemovalFunction(attributeName: string): (elements:
    Array<any>) => void {
    return (elements: Array<any>) => {
      let references: Array<any> = this._koheseObject[this._isVariantField ?
        'value' : attributeName];
      let isLocalTypeAttribute: boolean = (this._enclosingDataModel ? this.
        _enclosingDataModel : this._dataModel)['classLocalTypes'][this.
        _dataModel['classProperties'][attributeName].definition.type[0]];
      if (isLocalTypeAttribute) {
        for (let j: number = 0; j < elements.length; j++) {
          references.splice(references.indexOf(elements[j]), 1);
        }
      } else {
        for (let j: number = 0; j < elements.length; j++) {
          references.splice(references.map((reference: { id: string }) => {
            return this._itemRepository.getTreeConfig().getValue().config.
              getProxyFor(reference.id).item;
          }).indexOf(elements[j]), 1);
        }
      }
      
      this._changeDetectorRef.markForCheck();
    };
  }

  /**
   * Adds a value to the multivalued attribute represented by the given name
   * 
   * @param attributeName The name of a multivalued attribute to which to add a
   * value
   */
  public addValue(attributeName: string): any {
    let attribute: Attribute = this._dataModel['classProperties'][
      attributeName].definition;
    if (Array.isArray(attribute.type) && this._koheseObject[this.
      _isVariantField ? 'value' : attributeName] == null) {
      this._koheseObject[this._isVariantField ? 'value' : attributeName] = [];
      return;
    }
    
    attribute.name = attributeName;
    return this.getDefaultValue(attribute);
  }

  /**
   * Returns an identifier for the given element at the given index
   * 
   * @param index The index of the given element
   * @param element The element for which to retrieve an identifier
   */
  public getMultivaluedAttributeValueIdentifier(index: number, element: any):
    string {
    return index.toString();
  }

  /**
   * Expands all expansion panels for the multivalued Kohese Model local type-
   * typed attribute represented by the given name
   * 
   * @param attributeName The name of a multivalued Kohese Model local type-
   * typed attribute
   */
  public expandAllMultivaluedAttributeExpansionPanels(attributeName: string):
    void {
    let expansionPanels: Array<MatExpansionPanel> = this.
      _multivaluedAttributeExpansionPanelQueryList.toArray();
    let expansionPanelElements: Array<ElementRef> = this.
      _multivaluedAttributeExpansionPanelElementQueryList.toArray();
    for (let j: number = 0; j < expansionPanels.length; j++) {
      if (expansionPanelElements[j].nativeElement.getAttribute('attributeName')
        === attributeName) {
        expansionPanels[j].open();
      }
    }
  }
  
  /**
   * Collapses all expansion panels for the multivalued Kohese Model local
   * type-typed attribute represented by the given name
   * 
   * @param attributeName The name of a multivalued Kohese Model local type-
   * typed attribute
   */
  public collapseAllMultivaluedAttributeExpansionPanels(attributeName: string):
    void {
    let expansionPanels: Array<MatExpansionPanel> = this.
      _multivaluedAttributeExpansionPanelQueryList.toArray();
    let expansionPanelElements: Array<ElementRef> = this.
      _multivaluedAttributeExpansionPanelElementQueryList.toArray();
    for (let j: number = 0; j < expansionPanels.length; j++) {
      if (expansionPanelElements[j].nativeElement.getAttribute('attributeName')
        === attributeName) {
        expansionPanels[j].close();
      }
    }
  }
}
