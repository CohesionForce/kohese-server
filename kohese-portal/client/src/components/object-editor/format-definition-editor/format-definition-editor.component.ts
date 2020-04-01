import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  Input, OnInit } from '@angular/core';

import { FormatDefinition } from '../../type-editor/FormatDefinition.interface';
import { FormatContainer,
  FormatContainerKind } from '../../type-editor/FormatContainer.interface';
import { PropertyDefinition } from '../../type-editor/PropertyDefinition.interface';
import { TableDefinition } from '../../type-editor/TableDefinition.interface';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

@Component({
  selector: 'format-definition-editor',
  templateUrl: './format-definition-editor.component.html',
  styleUrls: ['./format-definition-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormatDefinitionEditorComponent implements OnInit {
  private _formatDefinition: FormatDefinition;
  get formatDefinition() {
    return this._formatDefinition;
  }
  @Input('formatDefinition')
  set formatDefinition(formatDefinition: FormatDefinition) {
    this._formatDefinition = formatDefinition;
  }
  
  private _dataModel: any;
  get dataModel() {
    return this._dataModel;
  }
  @Input('dataModel')
  set dataModel(dataModel: any) {
    this._dataModel = dataModel;
  }
  
  private _viewModel: any;
  get viewModel() {
    return this._viewModel;
  }
  @Input('viewModel')
  set viewModel(viewModel: any) {
    this._viewModel = viewModel;
  }
  
  private _attributes: Array<any>;
  get attributes() {
    return this._attributes;
  }
  @Input('attributes')
  set attributes(attributes: Array<any>) {
    this._attributes = attributes;
  }
  
  private _referenceAttributes: { [kindName: string]: Array<any> } = {};
  get referenceAttributes() {
    return this._referenceAttributes;
  }
  
  private _isDisabled: boolean = false;
  get isDisabled() {
    return this._isDisabled;
  }
  @Input('disabled')
  set isDisabled(isDisabled: boolean) {
    this._isDisabled = isDisabled;
  }
  
  private _userInterfaceTypes: any = {
    'boolean': {
      'Boolean': 'boolean'
    },
    'number': {
      'Number': 'number'
    },
    'string': {
      'Text': 'text',
      'Markdown': 'markdown',
      'Masked String': 'maskedString'
    },
    'StateMachine': {
      'State': 'state-editor'
    },
    'timestamp': {
      'Date': 'date'
    },
    'user-selector': {
      'Username': 'user-selector'
    }
  };
  
  get FormatContainerKind() {
    return FormatContainerKind;
  }
  
  get Object() {
    return Object;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }
  
  public ngOnInit(): void {
    let typeNames: Array<string> = [];
    let dataModelItemProxy: ItemProxy = ({
      item: this._dataModel
    } as ItemProxy);
    do {
      typeNames.push(dataModelItemProxy.item.base);
      dataModelItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
        dataModelItemProxy.item.base);
    } while (dataModelItemProxy);
    
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'KoheseModel') {
        for (let attributeName in itemProxy.item.properties) {
          let attribute: any = itemProxy.item.properties[attributeName];
          attribute.name = attributeName;
          if (attribute.relation) {
            let typeName: string = (Array.isArray(attribute.type) ?
              attribute.type[0] : attribute.type);
            if (typeNames.indexOf(typeName) !== -1) {
              let kindAttributes: Array<any> = this._referenceAttributes[
                itemProxy.item.name];
              if (!kindAttributes) {
                kindAttributes = [];
                this._referenceAttributes[itemProxy.item.name] =
                  kindAttributes;
              }
              
              let attributeCopy: any = JSON.parse(JSON.stringify(attribute));
              attributeCopy.containingType = itemProxy.item.name;
              kindAttributes.push(attributeCopy);
            }
          }
        }
      }
    }, undefined);
  }
  
  public doesPropertyDefinitionMatchSelection(option: any, selection: any):
    boolean {
    return ((option.kind === selection.kind) && (option.attribute ===
      selection.attribute));
  }
  
  public getSelectableAttributes(): Array<any> {
    if (this._dataModel.localTypes) {
      return this._attributes.filter((attribute: any) => {
        let typeName: string = (Array.isArray(attribute.type) ? attribute.type[
          0] : attribute.type);
        return (!this._dataModel.localTypes[typeName] || (Object.values(this.
          _viewModel.localTypes[typeName].formatDefinitions).length > 0));
      });
    } else {
      return this._attributes;
    }
  }
  
  public attributeSelected(attributeName: string, propertyDefinition:
    PropertyDefinition): void {
    propertyDefinition.propertyName = attributeName;
    propertyDefinition.customLabel = attributeName;
    propertyDefinition.visible = true;
    propertyDefinition.tableDefinition = '';

    let attribute: any = this._dataModel.classProperties[attributeName].
      definition;
    propertyDefinition.editable = !attribute.derived;
    let userInterfaceType: string = '';
    let attributeType: string = (Array.isArray(attribute.type) ? attribute.
      type[0] : attribute.type);
    switch (attributeType) {
      case 'boolean':
        userInterfaceType = 'boolean';
        break;
      case 'number':
        userInterfaceType = 'number';
        break;
      case 'string':
        userInterfaceType = 'text';
        break;
      case 'StateMachine':
        userInterfaceType = 'state-editor';
        break;
      case 'timestamp':
        userInterfaceType = 'date';
        break;
      case 'user-selector':
        userInterfaceType = 'user-selector';
        break;
    }
    propertyDefinition.kind = userInterfaceType;
    
    if (this._dataModel.localTypes) {
      let dataModelType: any = this._dataModel.classProperties[attributeName].
        definition.type;
      let typeName: string = (Array.isArray(dataModelType) ? dataModelType[0] :
        dataModelType);
      if (this._viewModel.localTypes[typeName]) {
        propertyDefinition.formatDefinition = Object.values(this._viewModel.
          localTypes[typeName].formatDefinitions)[0]['id'];
      } else {
        delete propertyDefinition.formatDefinition;
      }
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public getFormatContainerPanelTitle(formatContainer: FormatContainer):
    string {
    if (formatContainer.kind === FormatContainerKind.REVERSE_REFERENCE_TABLE) {
      return formatContainer.contents.map((propertyDefinition:
        PropertyDefinition) => {
        return propertyDefinition.propertyName.attribute;
      }).join(', ');
    } else {
      return formatContainer.contents.map((propertyDefinition:
        PropertyDefinition) => {
        return propertyDefinition.propertyName;
      }).join(', ');
    }
  }
  
  public addFormatContainer(formatContainerKind: FormatContainerKind): void {
    this._formatDefinition.containers.push({
      kind: formatContainerKind,
      contents: []
    });
  }
  
  public removeFormatContainer(formatContainer: FormatContainer): void {
    this._formatDefinition.containers.splice(this._formatDefinition.containers.
      indexOf(formatContainer), 1);
  }
  
  public addAttribute(formatContainer: FormatContainer): void {
    let propertyDefinition: PropertyDefinition;
    if (formatContainer.kind === FormatContainerKind.
      REVERSE_REFERENCE_TABLE) {
      let kindName: string = Object.keys(this._referenceAttributes)[0];
      let attribute: any = this._referenceAttributes[kindName][0];
      propertyDefinition = {
        propertyName: {
          kind: kindName,
          attribute: attribute.name
        },
        customLabel: '',
        labelOrientation: 'Top',
        kind: '',
        formatDefinition: undefined,
        tableDefinition: '',
        visible: true,
        editable: false
      };
    } else {
      let attribute: any = this._dataModel.classProperties[Object.keys(this.
        _dataModel.classProperties)[0]].definition;
      let userInterfaceType: string = '';
      let attributeType: string = (Array.isArray(attribute.type) ? attribute.
        type[0] : attribute.type);
      switch (attributeType) {
        case 'boolean':
          userInterfaceType = 'boolean';
          break;
        case 'number':
          userInterfaceType = 'number';
          break;
        case 'string':
          userInterfaceType = 'text';
          break;
        case 'StateMachine':
          userInterfaceType = 'state-editor';
          break;
        case 'timestamp':
          userInterfaceType = 'date';
          break;
        case 'user-selector':
          userInterfaceType = 'user-selector';
          break;
      }
      
      let formatDefinitionId: string;
      if (this._dataModel.localTypes) {
        if (this._dataModel.localTypes[attributeType]) {
          let formatDefinitions: Array<FormatDefinition> = Object.values(
            this._viewModel.localTypes[attributeType].formatDefinitions);
          if (formatDefinitions.length > 0) {
            formatDefinitionId = formatDefinitions[0].id;
          }
        }
      }
      
      propertyDefinition = {
        propertyName: attribute.name,
        customLabel: attribute.name,
        labelOrientation: 'Top',
        kind: userInterfaceType,
        formatDefinition: formatDefinitionId,
        tableDefinition: '',
        visible: true,
        editable: true
      };
    }
    
    formatContainer.contents.push(propertyDefinition);
  }
  
  public getUserInterfaceTypes(attributeName: string): Array<string> {
    let type: any = this._dataModel.classProperties[attributeName].definition.
      type;
    type = (Array.isArray(type) ? type[0] : type);
    if ((type === 'string') && this._dataModel.classProperties[attributeName].
      definition.relation) {
      return Object.keys(this._userInterfaceTypes['user-selector']);
    } else if (this._userInterfaceTypes[type]) {
      return Object.keys(this._userInterfaceTypes[type]);
    } else {
      return ['Reference'];
    }
  }
  
  public getUserInterfaceTypeValue(attributeName: string, userInterfaceType:
    string): string {
    if (userInterfaceType === 'Reference') {
      return '';
    } else {
      if ((userInterfaceType === Object.keys(this._userInterfaceTypes[
        'user-selector'])[0]) && this._dataModel.classProperties[
        attributeName].definition.relation) {
        return 'user-selector';
      } else {
        let type: any = this._dataModel.classProperties[attributeName].
          definition.type;
        type = (Array.isArray(type) ? type[0] : type);
        return this._userInterfaceTypes[type][userInterfaceType];
      }
    }
  }
  
  public areUserInterfaceTypeValuesEqual(option: string, selection: string):
    boolean {
    if ((option === '') && (selection === 'proxy-selector')) {
      return true;
    } else if ((option === 'state-editor') && (selection === 'StateMachine')) {
      return true;
    } else {
      return (option === selection);
    }
  }
  
  public getLocalTypeFormatDefinitions(propertyDefinition: PropertyDefinition):
    Array<FormatDefinition> {
    let dataModelType: any = this._dataModel.classProperties[
      propertyDefinition.propertyName].definition.type;
    let typeName: string = (Array.isArray(dataModelType) ? dataModelType[0] :
      dataModelType);
    return Object.values(this._viewModel.localTypes[typeName].
      formatDefinitions);
  }
  
  public isMultivaluedReferenceAttribute(propertyDefinition:
    PropertyDefinition): boolean {
    for (let j: number = 0; j < this._attributes.length; j++) {
      if ((this._attributes[j].name === propertyDefinition.propertyName) &&
        this._attributes[j].relation && Array.isArray(this._attributes[j].
        type)) {
        return true;
      }
    }
    
    return false;
  }
  
  public getTableDefinitions(propertyDefinition: PropertyDefinition):
    Array<TableDefinition> {
    let attributeTypeName: string = this._attributes.filter((attribute:
      any) => {
      return (attribute.name === propertyDefinition.propertyName);
    })[0].type[0];
    
    if (this._viewModel.localTypes && this._viewModel.localTypes[
      attributeTypeName]) {
      return Object.values(this._viewModel.localTypes[attributeTypeName].
        tableDefinitions);
    } else {
      return Object.values(TreeConfiguration.getWorkingTree().getProxyFor(
        'view-' + attributeTypeName.toLowerCase()).item.tableDefinitions);
    }
  }
  
  public removeAttribute(formatContainer: FormatContainer, propertyDefinition:
    PropertyDefinition): void {
    formatContainer.contents.splice(formatContainer.contents.indexOf(
      propertyDefinition), 1);
  }
  
  public mayMove(formatContainer: FormatContainer, propertyDefinition:
    PropertyDefinition, moveUp: boolean): boolean {
    let index: number = formatContainer.contents.indexOf(propertyDefinition);
    if (moveUp) {
      return (index !== 0);
    } else {
      return (index !== (formatContainer.contents.length - 1));
    }
  }
  
  public move(formatContainer: FormatContainer, propertyDefinition:
    PropertyDefinition, moveUp: boolean): void {
    let index: number = formatContainer.contents.indexOf(propertyDefinition);
    formatContainer.contents.splice(index, 1);
    if (moveUp) {
      formatContainer.contents.splice(index - 1, 0, propertyDefinition);
    } else {
      formatContainer.contents.splice(index + 1, 0, propertyDefinition);
    }
  }
}
