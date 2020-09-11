
import {of as observableOf,  BehaviorSubject ,  Observable ,  Subject } from 'rxjs';


import { MockItem } from '../data/MockItem';
import { MockViewData } from '../data/MockViewData';
import { MockDataModel, ModelDefinitions } from '../data/MockDataModel';
import { ItemProxy } from '../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../common/src/tree-configuration';
import { KoheseModel } from '../../../common/src/KoheseModel';
import { RepoStates,
  TreeConfigType } from '../../src/services/item-repository/item-repository.service';
import { KoheseType } from '../../src/classes/UDT/KoheseType.class';
import { MockItemCache } from './MockItemCache';
import { ItemCache } from '../../../common/src/item-cache';
import { Type, Metatype } from '../../../common/src/Type.interface';
import { KoheseDataModel,
  KoheseViewModel } from '../../../common/src/KoheseModel.interface';
import { Attribute } from '../../../common/src/Attribute.interface';
import { FormatDefinition,
  FormatDefinitionType } from '../../../common/src/FormatDefinition.interface';
import { FormatContainerKind } from '../../../common/src/FormatContainer.interface';
import { PropertyDefinition } from '../../../common/src/PropertyDefinition.interface';
import { Enumeration } from '../../../common/src/Enumeration.interface';

export class MockItemRepository {
  static modelDefinitions = ModelDefinitions();
  static singleton = new MockItemRepository();

  mockRootProxy = ItemProxy.getWorkingTree().getRootProxy();
  state: any;

  constructor() {
    console.log('### MIR Constructor called');
    if (MockItemRepository.singleton) {
      this.mockFullSync();
      return MockItemRepository.singleton;
    }
    console.log('### MIR Creating singleton');
    MockItemRepository.singleton = this;
    if (!ItemCache.getItemCache()){
      let mockItemCache = new MockItemCache();
      ItemCache.setItemCache(mockItemCache);  
    }
    this.mockFullSync();
  }

  mockFullSync () {
    TreeConfiguration.getWorkingTree().reset();

    for(let modelName in MockItemRepository.modelDefinitions.model) {
      console.log('::: Loading ' + modelName);
      let dataModel: KoheseDataModel = JSON.parse(JSON.stringify(
        MockItemRepository.modelDefinitions.model[modelName]));
      if (dataModel.name === 'KoheseModel') {
        let booleanAttribute: Attribute = {
          name: 'booleanAttribute',
          type: 'boolean',
          required: false,
          default: false
        };
        dataModel.properties[booleanAttribute.name] = booleanAttribute;

        let multivaluedBooleanAttribute: Attribute = {
          name: 'multivaluedBooleanAttribute',
          type: ['boolean'],
          required: false,
          default: []
        };
        dataModel.properties[multivaluedBooleanAttribute.name] =
          multivaluedBooleanAttribute;
        
        let numberAttribute: Attribute = {
          name: 'numberAttribute',
          type: 'number',
          required: false,
          default: 0
        };
        dataModel.properties[numberAttribute.name] = numberAttribute;

        let multivaluedNumberAttribute: Attribute = {
          name: 'multivaluedNumberAttribute',
          type: ['number'],
          required: false,
          default: []
        };
        dataModel.properties[multivaluedNumberAttribute.name] =
          multivaluedNumberAttribute;

        let timeAttribute: Attribute = {
          name: 'timeAttribute',
          type: 'timestamp',
          required: false,
          default: null //new Date().getTime()
        };
        dataModel.properties[timeAttribute.name] = timeAttribute;

        let multivaluedTimeAttribute: Attribute = {
          name: 'multivaluedTimeAttribute',
          type: ['timestamp'],
          required: false,
          default: []
        };
        dataModel.properties[multivaluedTimeAttribute.name] =
          multivaluedTimeAttribute;

        let stateMachineDefinition: any = {
          state: {
            First: {
              name: 'First',
              description: ''
            },
            Second: {
              name: 'Second',
              description: ''
            },
            Third: {
              name: 'Third',
              description: ''
            }
          },
          transition: {
            FirstToSecond: {
              source: 'First',
              target: 'Second'
            },
            SecondToThird: {
              source: 'Second',
              target: 'Third'
            },
            FirstToThird: {
              source: 'First',
              target: 'Third'
            }
          }
        };
        let stateAttribute: Attribute = {
          name: 'stateAttribute',
          type: 'StateMachine',
          required: false,
          default: 'First',
          properties: stateMachineDefinition
        };
        dataModel.properties[stateAttribute.name] = stateAttribute;

        let multivaluedStateAttribute: Attribute = {
          name: 'multivaluedStateAttribute',
          type: ['StateMachine'],
          required: false,
          default: ['First', 'First'],
          properties: stateMachineDefinition
        };
        dataModel.properties[multivaluedStateAttribute.name] =
          multivaluedStateAttribute;
        
        let usernameAttribute: Attribute = {
          name: 'usernameAttribute',
          type: 'string',
          required: false,
          default: 'admin',
          relation: {
            kind: 'KoheseUser',
            foreignKey: 'username'
          }
        };
        dataModel.properties[usernameAttribute.name] = usernameAttribute;

        let multivaluedUsernameAttribute: Attribute = {
          name: 'multivaluedUsernameAttribute',
          type: ['string'],
          required: false,
          default: [],
          relation: {
            kind: 'KoheseUser',
            foreignKey: 'username'
          }
        };
        dataModel.properties[multivaluedUsernameAttribute.name] =
          multivaluedUsernameAttribute;

        let stringAttribute: Attribute = {
          name: 'stringAttribute',
          type: 'string',
          required: false,
          default: ''
        };
        dataModel.properties[stringAttribute.name] = stringAttribute;

        let multivaluedStringAttribute: Attribute = {
          name: 'multivaluedStringAttribute',
          type: ['string'],
          required: false,
          default: []
        };
        dataModel.properties[multivaluedStringAttribute.name] =
          multivaluedStringAttribute;

        let maskedStringAttribute: Attribute = {
          name: 'maskedStringAttribute',
          type: 'string',
          required: false,
          default: ''
        };
        dataModel.properties[maskedStringAttribute.name] =
          maskedStringAttribute;

        let multivaluedMaskedStringAttribute: Attribute = {
          name: 'multivaluedMaskedStringAttribute',
          type: ['string'],
          required: false,
          default: []
        };
        dataModel.properties[multivaluedMaskedStringAttribute.name] =
          multivaluedMaskedStringAttribute;

        let markdownAttribute: Attribute = {
          name: 'markdownAttribute',
          type: 'string',
          required: false,
          default: ''
        };
        dataModel.properties[markdownAttribute.name] = markdownAttribute;

        let multivaluedMarkdownAttribute: Attribute = {
          name: 'multivaluedMarkdownAttribute',
          type: ['string'],
          required: false,
          default: []
        };
        dataModel.properties[multivaluedMarkdownAttribute.name] =
          multivaluedMarkdownAttribute;

        let globalTypeAttribute: Attribute = {
          name: 'globalTypeAttribute',
          type: 'KoheseModel',
          required: false,
          default: null,
          relation: {
            kind: 'Item',
            foreignKey: 'id'
          }
        };
        dataModel.properties[globalTypeAttribute.name] = globalTypeAttribute;

        let multivaluedGlobalTypeAttribute: Attribute = {
          name: 'multivaluedGlobalTypeAttribute',
          type: ['KoheseModel'],
          required: false,
          default: null,
          relation: {
            kind: 'Item',
            foreignKey: 'id'
          }
        };
        dataModel.properties[multivaluedGlobalTypeAttribute.name] =
          multivaluedGlobalTypeAttribute;

        let localTypeAttribute: Attribute = {
          name: 'localTypeAttribute',
          type: 'Local Type',
          required: false,
          default: null,
          relation: { contained: true }
        };
        dataModel.properties[localTypeAttribute.name] = localTypeAttribute;

        let multivaluedLocalTypeAttribute: Attribute = {
          name: 'multivaluedLocalTypeAttribute',
          type: ['Local Type'],
          required: false,
          default: null,
          relation: { contained: true }
        };
        dataModel.properties[multivaluedLocalTypeAttribute.name] =
          multivaluedLocalTypeAttribute;

        let enumerationAttribute: Attribute = {
          name: 'enumerationAttribute',
          type: 'Enumeration',
          required: false,
          default: null,
          relation: { contained: true }
        };
        dataModel.properties[enumerationAttribute.name] = enumerationAttribute;

        let multivaluedEnumerationAttribute: Attribute = {
          name: 'multivaluedEnumerationAttribute',
          type: ['Enumeration'],
          required: false,
          default: null,
          relation: { contained: true }
        };
        dataModel.properties[multivaluedEnumerationAttribute.name] =
          multivaluedEnumerationAttribute;
        
        let variantAttribute: Attribute = {
          name: 'variantAttribute',
          type: 'Variant',
          required: false,
          default: null,
          relation: { contained: true }
        };
        dataModel.properties[variantAttribute.name] = variantAttribute;

        let multivaluedVariantAttribute: Attribute = {
          name: 'multivaluedVariantAttribute',
          type: ['Variant'],
          required: false,
          default: null,
          relation: { contained: true }
        };
        dataModel.properties[multivaluedVariantAttribute.name] =
          multivaluedVariantAttribute;

        dataModel.localTypes['Local Type'] = ({
          metatype: Metatype.STRUCTURE,
          id: 'Local Type',
          name: 'Local Type',
          base: '',
          idInjection: true,
          properties: {
            booleanAttribute: booleanAttribute,
            multivaluedBooleanAttribute: multivaluedBooleanAttribute,
            numberAttribute: numberAttribute,
            multivaluedNumberAttribute: multivaluedNumberAttribute,
            timeAttribute: timeAttribute,
            multivaluedTimeAttribute: multivaluedTimeAttribute,
            stateAttribute: stateAttribute,
            multivaluedStateAttribute: multivaluedStateAttribute,
            usernameAttribute: usernameAttribute,
            multivaluedUsernameAttribute: multivaluedUsernameAttribute,
            stringAttribute: stringAttribute,
            multivaluedStringAttribute: multivaluedStringAttribute,
            maskedStringAttribute: maskedStringAttribute,
            multivaluedMaskedStringAttribute: multivaluedMaskedStringAttribute,
            markdownAttribute: markdownAttribute,
            multivaluedMarkdownAttribute: multivaluedMarkdownAttribute,
            globalTypeAttribute: globalTypeAttribute,
            multivaluedGlobalTypeAttribute: multivaluedGlobalTypeAttribute,
            localTypeAttribute: localTypeAttribute,
            multivaluedLocalTypeAttribute: multivaluedLocalTypeAttribute,
            enumerationAttribute: enumerationAttribute,
            multivaluedEnumerationAttribute: multivaluedEnumerationAttribute,
            variantAttribute: variantAttribute,
            multivaluedVariantAttribute: multivaluedVariantAttribute
          },
          validations: [],
          relations: {},
          acls: [],
          methods: []
        } as KoheseDataModel);

        dataModel.localTypes['Enumeration'] = {
          metatype: Metatype.ENUMERATION,
          id: 'Enumeration',
          name: 'Enumeration',
          values: [{
            name: 'EnumerationValue1',
            description: '',
          }, {
            name: 'EnumerationValue2',
            description: ''
          }, {
            name: 'EnumerationValue3',
            description: ''
          }]
        } as Enumeration;

        dataModel.localTypes['Variant'] = {
          metatype: Metatype.VARIANT,
          id: 'Variant',
          name: 'Variant',
          base: null,
          idInjection: true,
          properties: {
            booleanAttribute: booleanAttribute,
            multivaluedBooleanAttribute: multivaluedBooleanAttribute,
            numberAttribute: numberAttribute,
            multivaluedNumberAttribute: multivaluedNumberAttribute,
            timeAttribute: timeAttribute,
            multivaluedTimeAttribute: multivaluedTimeAttribute,
            stateAttribute: stateAttribute,
            multivaluedStateAttribute: multivaluedStateAttribute,
            usernameAttribute: usernameAttribute,
            multivaluedUsernameAttribute: multivaluedUsernameAttribute,
            stringAttribute: stringAttribute,
            multivaluedStringAttribute: multivaluedStringAttribute,
            maskedStringAttribute: maskedStringAttribute,
            multivaluedMaskedStringAttribute: multivaluedMaskedStringAttribute,
            markdownAttribute: markdownAttribute,
            multivaluedMarkdownAttribute: multivaluedMarkdownAttribute,
            globalTypeAttribute: globalTypeAttribute,
            multivaluedGlobalTypeAttribute: multivaluedGlobalTypeAttribute,
            localTypeAttribute: localTypeAttribute,
            multivaluedLocalTypeAttribute: multivaluedLocalTypeAttribute,
            enumerationAttribute: enumerationAttribute,
            multivaluedEnumerationAttribute: multivaluedEnumerationAttribute,
            variantAttribute: variantAttribute,
            multivaluedVariantAttribute: multivaluedVariantAttribute
          },
          validations: [],
          relations: {},
          acls: [],
          methods: []
        } as KoheseDataModel;

        dataModel[booleanAttribute.name] = true;
        dataModel[multivaluedBooleanAttribute.name] = [true, false];
        dataModel[numberAttribute.name] = 3;
        dataModel[multivaluedNumberAttribute.name] = [3, 1];
        dataModel[timeAttribute.name] = 86400000;
        dataModel[multivaluedTimeAttribute.name] = [0, 86400000];
        dataModel[stateAttribute.name] = 'First';
        dataModel[multivaluedStateAttribute.name] = ['First', 'Second'];
        dataModel[usernameAttribute.name] = 'admin';
        dataModel[multivaluedUsernameAttribute.name] = ['admin', 'admin'];
        dataModel[stringAttribute.name] = 'String';
        dataModel[multivaluedStringAttribute.name] = ['String1', 'String2'];
        dataModel[maskedStringAttribute.name] = 'MaskedString';
        dataModel[multivaluedMaskedStringAttribute.name] = ['MaskedString1',
          'MaskedString2'];
        dataModel[markdownAttribute.name] = '**Markdown**';
        dataModel[multivaluedMarkdownAttribute.name] = ['**Markdown1**',
          '_Markdown2_'];
        dataModel[globalTypeAttribute.name] = {
          id: 'KoheseModel'
        };
        dataModel[multivaluedGlobalTypeAttribute.name] = [{
          id: 'KoheseModel'
        }, {
          id: 'KoheseModel'
        }, {
          id: 'KoheseModel'
        }];

        let localTypeInstance: any = {
          booleanAttribute: true,
          multivaluedBooleanAttribute: [true, false],
          numberAttribute: 3,
          multivaluedNumberAttribute: [3, 1],
          timeAttribute: 86400000,
          multivaluedTimeAttribute: [0, 86400000],
          stateAttribute: 'First',
          multivaluedStateAttribute: ['First', 'Second'],
          usernameAttribute: 'admin',
          multivaluedUsernameAttribute: ['admin', 'admin'],
          stringAttribute: 'String',
          multivaluedStringAttribute: ['String1', 'String2'],
          maskedStringAttribute: 'MaskedString',
          multivaluedMaskedStringAttribute: ['MaskedString1', 'MaskedString2'],
          markdownAttribute: '**Markdown**',
          multivaluedMarkdownAttribute: ['**Markdown1**', '_Markdown2_'],
          globalTypeAttribute: {
            id: 'KoheseModel'
          },
          multivaluedGlobalTypeAttribute: [{
            id: 'KoheseModel'
          }, {
            id: 'KoheseModel'
          }, {
            id: 'KoheseModel'
          }],
          localTypeAttribute: null,
          multivaluedLocalTypeAttribute: [],
          enumerationAttribute: 'EnumerationValue1',
          multivaluedEnumerationAttribute: [
            'EnumerationValue1',
            'EnumerationValue2',
            'EnumerationValue3'
          ],
          variantAttribute: {
            discriminant: 'globalTypeAttribute',
            value: {
              id: 'KoheseModel'
            }
          },
          multivaluedVariantAttribute: [{
            discriminant: 'globalTypeAttribute',
            value: {
              id: 'KoheseModel'
            }
          }, {
            discriminant: 'multivaluedEnumerationAttribute',
            value: ['EnumerationValue1', 'EnumerationValue2',
              'EnumerationValue3']
          }, {
            discriminant: 'booleanAttribute',
            value: 'true'
          }]
        };
        
        localTypeInstance[localTypeAttribute.name] = JSON.parse(JSON.stringify(
          localTypeInstance));
        localTypeInstance[multivaluedLocalTypeAttribute.name].push(JSON.parse(
          JSON.stringify(localTypeInstance)));
        localTypeInstance[multivaluedLocalTypeAttribute.name].push(JSON.parse(
          JSON.stringify(localTypeInstance)));

        dataModel[localTypeAttribute.name] = JSON.parse(JSON.stringify(
          localTypeInstance));
        dataModel[multivaluedLocalTypeAttribute.name] = [
          JSON.parse(JSON.stringify(localTypeInstance)),
          JSON.parse(JSON.stringify(localTypeInstance))
        ];
        dataModel[enumerationAttribute.name] = 'EnumerationValue1';
        dataModel[multivaluedEnumerationAttribute.name] = [
          'EnumerationValue1',
          'EnumerationValue2',
          'EnumerationValue3'
        ];
        dataModel[variantAttribute.name] = {
          discriminant: 'globalTypeAttribute',
          value: {
            id: 'KoheseModel'
          }
        };
        dataModel[multivaluedVariantAttribute.name] = [{
          discriminant: 'globalTypeAttribute',
          value: {
            id: 'KoheseModel'
          }
        }, {
          discriminant: 'multivaluedEnumerationAttribute',
          value: ['EnumerationValue1', 'EnumerationValue2']
        }, {
          discriminant: 'booleanAttribute',
          value: 'true'
        }];
      }

      new KoheseModel(dataModel);
    }

    for(let viewName in MockItemRepository.modelDefinitions.view) {
      console.log('::: Loading ' + viewName);
      let viewModel: KoheseViewModel = JSON.parse(JSON.stringify(
        MockItemRepository.modelDefinitions.view[viewName]));
      if (viewModel.modelName === 'KoheseModel') {
        let formatDefinition: FormatDefinition = viewModel.formatDefinitions[
          viewModel.defaultFormatKey[FormatDefinitionType.DEFAULT]];
        let propertyDefinitions: Array<PropertyDefinition> = formatDefinition.
          containers[0].contents;
        let booleanAttributePropertyDefinition: PropertyDefinition = {
          propertyName: 'booleanAttribute',
          customLabel: 'Boolean Attribute',
          labelOrientation: 'Top',
          kind: 'boolean',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(booleanAttributePropertyDefinition);

        let multivaluedBooleanAttributePropertyDefinition: PropertyDefinition =
          {
          propertyName: 'multivaluedBooleanAttribute',
          customLabel: 'Multivalued Boolean Attribute',
          labelOrientation: 'Top',
          kind: 'boolean',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(
          multivaluedBooleanAttributePropertyDefinition);

        let numberAttributePropertyDefinition: PropertyDefinition = {
          propertyName: 'numberAttribute',
          customLabel: 'Number Attribute',
          labelOrientation: 'Top',
          kind: 'number',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(numberAttributePropertyDefinition);

        let multivaluedNumberAttributePropertyDefinition: PropertyDefinition =
          {
          propertyName: 'multivaluedNumberAttribute',
          customLabel: 'Multivalued Number Attribute',
          labelOrientation: 'Top',
          kind: 'number',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(
          multivaluedNumberAttributePropertyDefinition);

        let timeAttributePropertyDefinition: PropertyDefinition = {
          propertyName: 'timeAttribute',
          customLabel: 'Time Attribute',
          labelOrientation: 'Top',
          kind: 'date',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(timeAttributePropertyDefinition);

        let multivaluedTimeAttributePropertyDefinition: PropertyDefinition = {
          propertyName: 'multivaluedTimeAttribute',
          customLabel: 'Multivalued Time Attribute',
          labelOrientation: 'Top',
          kind: 'date',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(
          multivaluedTimeAttributePropertyDefinition);

        let stateAttributePropertyDefinition: PropertyDefinition = {
          propertyName: 'stateAttribute',
          customLabel: 'State Attribute',
          labelOrientation: 'Top',
          kind: 'state-editor',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(stateAttributePropertyDefinition);

        let multivaluedStateAttributePropertyDefinition: PropertyDefinition = {
          propertyName: 'multivaluedStateAttribute',
          customLabel: 'Multivalued State Attribute',
          labelOrientation: 'Top',
          kind: 'state-editor',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(multivaluedStateAttributePropertyDefinition);

        let usernameAttributePropertyDefinition: PropertyDefinition = {
          propertyName: 'usernameAttribute',
          customLabel: 'Username Attribute',
          labelOrientation: 'Top',
          kind: 'user-selector',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(usernameAttributePropertyDefinition);

        let multivaluedUsernameAttributePropertyDefinition:
          PropertyDefinition = {
          propertyName: 'multivaluedUsernameAttribute',
          customLabel: 'Multivalued Username Attribute',
          labelOrientation: 'Top',
          kind: 'user-selector',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(
          multivaluedUsernameAttributePropertyDefinition);

        let stringAttributePropertyDefinition: PropertyDefinition = {
          propertyName: 'stringAttribute',
          customLabel: 'String Attribute',
          labelOrientation: 'Top',
          kind: 'text',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(stringAttributePropertyDefinition);

        let multivaluedStringAttributePropertyDefinition: PropertyDefinition =
          {
          propertyName: 'multivaluedStringAttribute',
          customLabel: 'Multivalued String Attribute',
          labelOrientation: 'Top',
          kind: 'text',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(
          multivaluedStringAttributePropertyDefinition);

        let maskedStringAttributePropertyDefinition: PropertyDefinition = {
          propertyName: 'maskedStringAttribute',
          customLabel: 'Masked String Attribute',
          labelOrientation: 'Top',
          kind: 'maskedString',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(maskedStringAttributePropertyDefinition);

        let multivaluedMaskedStringAttributePropertyDefinition:
          PropertyDefinition = {
          propertyName: 'multivaluedMaskedStringAttribute',
          customLabel: 'Multivalued Masked String Attribute',
          labelOrientation: 'Top',
          kind: 'maskedString',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(
          multivaluedMaskedStringAttributePropertyDefinition);

        let markdownAttributePropertyDefinition: PropertyDefinition = {
          propertyName: 'markdownAttribute',
          customLabel: 'Markdown Attribute',
          labelOrientation: 'Top',
          kind: 'markdown',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(markdownAttributePropertyDefinition);

        let multivaluedMarkdownAttributePropertyDefinition:
          PropertyDefinition = {
          propertyName: 'multivaluedMarkdownAttribute',
          customLabel: 'Multivalued Markdown Attribute',
          labelOrientation: 'Top',
          kind: 'markdown',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(
          multivaluedMarkdownAttributePropertyDefinition);

        let globalTypeAttibutePropertyDefinition: PropertyDefinition = {
          propertyName: 'globalTypeAttribute',
          customLabel: 'Global Type Attribute',
          labelOrientation: 'Top',
          kind: '',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(globalTypeAttibutePropertyDefinition);

        let multivaluedGlobalTypeAttributePropertyDefinition:
          PropertyDefinition = {
          propertyName: 'multivaluedGlobalTypeAttribute',
          customLabel: 'Multivalued Global Type Attribute',
          labelOrientation: 'Top',
          kind: '',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(
          multivaluedGlobalTypeAttributePropertyDefinition);
        
        let localTypeAttributePropertyDefinition: PropertyDefinition = {
          propertyName: 'localTypeAttribute',
          customLabel: 'Local Type Attribute',
          labelOrientation: 'Top',
          kind: '',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(localTypeAttributePropertyDefinition);
        
        let multivaluedLocalTypeAttributePropertyDefinition:
          PropertyDefinition = {
          propertyName: 'multivaluedLocalTypeAttribute',
          customLabel: 'Multivalued Local Type Attribute',
          labelOrientation: 'Top',
          kind: '',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(
          multivaluedLocalTypeAttributePropertyDefinition);

        let enumerationAttributePropertyDefinition: PropertyDefinition = {
          propertyName: 'enumerationAttribute',
          customLabel: 'Enumeration Attribute',
          labelOrientation: 'Top',
          kind: '',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(enumerationAttributePropertyDefinition);
        
        let multivaluedEnumerationAttributePropertyDefinition:
          PropertyDefinition = {
          propertyName: 'multivaluedEnumerationAttribute',
          customLabel: 'Multivalued Enumeration Attribute',
          labelOrientation: 'Top',
          kind: '',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(
          multivaluedEnumerationAttributePropertyDefinition);
        
        let variantAttributePropertyDefinition: PropertyDefinition = {
          propertyName: 'variantAttribute',
          customLabel: 'Variant Attribute',
          labelOrientation: 'Top',
          kind: '',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(variantAttributePropertyDefinition);

        let multivaluedVariantAttributePropertyDefinition:
          PropertyDefinition = {
          propertyName: 'multivaluedVariantAttribute',
          customLabel: 'Multivalued Variant Attribute',
          labelOrientation: 'Top',
          kind: '',
          visible: true,
          editable: true
        };
        propertyDefinitions.push(
          multivaluedVariantAttributePropertyDefinition);
        
        viewModel.localTypes['Local Type'] = ({
          metatype: Metatype.STRUCTURE,
          id: 'view-localtype',
          name: 'view-localtype',
          modelName: 'Local Type',
          icon: '',
          color: '#000000',
          viewProperties: {},
          formatDefinitions: {
            '0d8f76a0-b631-11ea-94f5-ad77c3385785': {
              id: '0d8f76a0-b631-11ea-94f5-ad77c3385785',
              name: 'Default Format Definition',
              header: {
                kind: FormatContainerKind.HEADER,
                contents: []
              },
              containers: [{
                kind: FormatContainerKind.VERTICAL,
                contents: [
                  booleanAttributePropertyDefinition,
                  multivaluedBooleanAttributePropertyDefinition,
                  numberAttributePropertyDefinition,
                  multivaluedNumberAttributePropertyDefinition,
                  timeAttributePropertyDefinition,
                  multivaluedTimeAttributePropertyDefinition,
                  stateAttributePropertyDefinition,
                  multivaluedStateAttributePropertyDefinition,
                  usernameAttributePropertyDefinition,
                  multivaluedUsernameAttributePropertyDefinition,
                  stringAttributePropertyDefinition,
                  multivaluedStringAttributePropertyDefinition,
                  maskedStringAttributePropertyDefinition,
                  multivaluedMaskedStringAttributePropertyDefinition,
                  markdownAttributePropertyDefinition,
                  multivaluedMarkdownAttributePropertyDefinition,
                  globalTypeAttibutePropertyDefinition,
                  multivaluedGlobalTypeAttributePropertyDefinition,
                  localTypeAttributePropertyDefinition,
                  multivaluedLocalTypeAttributePropertyDefinition,
                  enumerationAttributePropertyDefinition,
                  multivaluedEnumerationAttributePropertyDefinition,
                  variantAttributePropertyDefinition,
                  multivaluedVariantAttributePropertyDefinition
                ]
              }]
            },
            '497ce790-d0d7-11ea-83b0-4f5b7c4a9272': {
              id: '497ce790-d0d7-11ea-83b0-4f5b7c4a9272',
              name: 'Document Format Definition',
              header: {
                kind: FormatContainerKind.HEADER,
                contents: []
              },
              containers: []
            }
          },
          defaultFormatKey: {
            default: '0d8f76a0-b631-11ea-94f5-ad77c3385785',
            document: '497ce790-d0d7-11ea-83b0-4f5b7c4a9272'
          },
          tableDefinitions: {
            '502ae8c0-b71f-11ea-bdf1-99cdd4c272d8': {
              id: '502ae8c0-b71f-11ea-bdf1-99cdd4c272d8',
              name: 'Local Type Table Definition',
              columns: [
                'booleanAttribute',
                'multivaluedBooleanAttribute',
                'numberAttribute',
                'multivaluedNumberAttribute',
                'timeAttribute',
                'multivaluedTimeAttribute',
                'stateAttribute',
                'multivaluedStateAttribute',
                'usernameAttribute',
                'multivaluedUsernameAttribute',
                'stringAttribute',
                'multivaluedStringAttribute',
                'maskedStringAttribute',
                'multivaluedMaskedStringAttribute',
                'markdownAttribute',
                'multivaluedMarkdownAttribute',
                'globalTypeAttribute',
                'multivaluedGlobalTypeAttribute',
                'localTypeAttribute',
                'multivaluedLocalTypeAttribute',
                'enumerationAttribute',
                'multivaluedEnumerationAttribute',
                'variantAttribute',
                'multivaluedVariantAttribute'
              ],
              expandedFormat: {
                column1: [],
                column2: [],
                column3: [],
                column4: []
              }
            }
          }
        } as KoheseViewModel);

        viewModel.localTypes['Enumeration'] = {
          metatype: Metatype.ENUMERATION,
          id: 'Enumeration',
          name: 'Enumeration',
          values: ['Enumeration Value 1', 'Enumeration Value 2',
            'Enumeration Value 3']
        } as Type;//Enumeration;

        viewModel.localTypes['Variant'] = ({
          metatype: Metatype.STRUCTURE,
          id: 'view-variant',
          name: 'view-variant',
          modelName: 'Variant',
          icon: '',
          color: '#000000',
          viewProperties: {},
          formatDefinitions: {
            '064ad380-d0d5-11ea-83b0-4f5b7c4a9272': {
              id: '064ad380-d0d5-11ea-83b0-4f5b7c4a9272',
              name: 'Default Format Definition',
              header: {
                kind: FormatContainerKind.HEADER,
                contents: []
              },
              containers: [{
                kind: FormatContainerKind.VERTICAL,
                contents: [
                  booleanAttributePropertyDefinition,
                  multivaluedBooleanAttributePropertyDefinition,
                  numberAttributePropertyDefinition,
                  multivaluedNumberAttributePropertyDefinition,
                  timeAttributePropertyDefinition,
                  multivaluedTimeAttributePropertyDefinition,
                  stateAttributePropertyDefinition,
                  multivaluedStateAttributePropertyDefinition,
                  usernameAttributePropertyDefinition,
                  multivaluedUsernameAttributePropertyDefinition,
                  stringAttributePropertyDefinition,
                  multivaluedStringAttributePropertyDefinition,
                  maskedStringAttributePropertyDefinition,
                  multivaluedMaskedStringAttributePropertyDefinition,
                  markdownAttributePropertyDefinition,
                  multivaluedMarkdownAttributePropertyDefinition,
                  globalTypeAttibutePropertyDefinition,
                  multivaluedGlobalTypeAttributePropertyDefinition,
                  localTypeAttributePropertyDefinition,
                  multivaluedLocalTypeAttributePropertyDefinition,
                  enumerationAttributePropertyDefinition,
                  multivaluedEnumerationAttributePropertyDefinition,
                  variantAttributePropertyDefinition,
                  multivaluedVariantAttributePropertyDefinition
                ]
              }]
            },
            'a6254d70-d0d7-11ea-83b0-4f5b7c4a9272': {
              id: 'a6254d70-d0d7-11ea-83b0-4f5b7c4a9272',
              name: 'Document Format Definition',
              header: {
                kind: FormatContainerKind.HEADER,
                contents: []
              },
              containers: []
            }
          },
          defaultFormatKey: {
            default: '064ad380-d0d5-11ea-83b0-4f5b7c4a9272',
            document: 'a6254d70-d0d7-11ea-83b0-4f5b7c4a9272'
          },
          tableDefinitions: {
            '3a5b87f0-d0d5-11ea-83b0-4f5b7c4a9272': {
              id: '3a5b87f0-d0d5-11ea-83b0-4f5b7c4a9272',
              name: 'Local Type Table Definition',
              columns: [
                'booleanAttribute',
                'multivaluedBooleanAttribute',
                'numberAttribute',
                'multivaluedNumberAttribute',
                'timeAttribute',
                'multivaluedTimeAttribute',
                'stateAttribute',
                'multivaluedStateAttribute',
                'usernameAttribute',
                'multivaluedUsernameAttribute',
                'stringAttribute',
                'multivaluedStringAttribute',
                'maskedStringAttribute',
                'multivaluedMaskedStringAttribute',
                'markdownAttribute',
                'multivaluedMarkdownAttribute',
                'globalTypeAttribute',
                'multivaluedGlobalTypeAttribute',
                'localTypeAttribute',
                'multivaluedLocalTypeAttribute',
                'enumerationAttribute',
                'multivaluedEnumerationAttribute',
                'variantAttribute',
                'multivaluedVariantAttribute'
              ],
              expandedFormat: {
                column1: [],
                column2: [],
                column3: [],
                column4: []
              }
            }
          }
        } as KoheseViewModel);

        formatDefinition.containers.push({
          kind: FormatContainerKind.HORIZONTAL,
          contents: [{
            propertyName: 'multivaluedGlobalTypeAttribute',
            customLabel: 'Multivalued Global Type Attribute Table',
            labelOrientation: 'Top',
            kind: '',
            visible: true,
            editable: true,
            tableDefinition: '975f0030-b7e9-11ea-ac23-8b3d84d820e2'
          }, {
            propertyName: 'multivaluedLocalTypeAttribute',
            customLabel: 'Multivalued Local Type Attribute Table',
            labelOrientation: 'Top',
            kind: '',
            visible: true,
            editable: true,
            tableDefinition: '502ae8c0-b71f-11ea-bdf1-99cdd4c272d8'
          }]
        });

        viewModel.tableDefinitions['975f0030-b7e9-11ea-ac23-8b3d84d820e2'] = {
          id: '975f0030-b7e9-11ea-ac23-8b3d84d820e2',
          name: 'Kohese Model Table Definition',
          columns: [
            'booleanAttribute',
            'multivaluedBooleanAttribute',
            'numberAttribute',
            'multivaluedNumberAttribute',
            'timeAttribute',
            'multivaluedTimeAttribute',
            'stateAttribute',
            'multivaluedStateAttribute',
            'usernameAttribute',
            'multivaluedUsernameAttribute',
            'stringAttribute',
            'multivaluedStringAttribute',
            'maskedStringAttribute',
            'multivaluedMaskedStringAttribute',
            'markdownAttribute',
            'multivaluedMarkdownAttribute',
            'globalTypeAttribute',
            'multivaluedGlobalTypeAttribute',
            'localTypeAttribute',
            'multivaluedLocalTypeAttribute',
            'enumerationAttribute',
            'multivaluedEnumerationAttribute',
            'variantAttribute',
            'multivaluedVariantAttribute'
          ],
          expandedFormat: {
            column1: [],
            column2: [],
            column3: [],
            column4: []
          }
        };

        viewModel.formatDefinitions['0322b120-d0d8-11ea-83b0-4f5b7c4a9272'] = {
          id: '0322b120-d0d8-11ea-83b0-4f5b7c4a9272',
          name: 'Document Format Definition',
          header: {
            kind: FormatContainerKind.HEADER,
            contents: [{
              propertyName: 'name',
              customLabel: 'Name',
              labelOrientation: 'Top',
              kind: 'text',
              visible: true,
              editable: true
            }]
          },
          containers: []
        };
        viewModel.defaultFormatKey[FormatDefinitionType.DOCUMENT] =
          '0322b120-d0d8-11ea-83b0-4f5b7c4a9272';
      }

      new ItemProxy('KoheseView', viewModel);
    }

    KoheseModel.modelDefinitionLoadingComplete();

    // Mock the effect of KoheseType
    let working = ItemProxy.getWorkingTree();
    for(let modelName in MockItemRepository.modelDefinitions.model) {
      let modelProxy : KoheseModel = (working.getProxyFor(modelName)) as KoheseModel;
      let viewId = 'view-' + modelName.toLowerCase();
      let viewProxy = working.getProxyFor(viewId);
      modelProxy.type = new KoheseType(modelProxy, viewProxy);
    }

    let numberOfItemsToAdd: number = 7;
    for (let j: number = 0; j < numberOfItemsToAdd; j++) {
      let item: any = MockItem();
      /* Delete the parentId so that this Item will be added as a child of the
      root proxy */
      delete item.parentId;
      // Make the ID of each of these added Items distinct among each other
      item.id = item.id + (j + 1);
      new ItemProxy('Action', item);
    }

    TreeConfiguration.getWorkingTree().loadingComplete();
  }

  getRepoStatusSubject() {
    return new BehaviorSubject<any>({ state: RepoStates.SYNCHRONIZATION_SUCCEEDED })
  }

  getRootProxy() {
    return this.mockRootProxy;
  }

  public getHistoryFor(proxy: ItemProxy): Promise<any> {
    let historyObject: any = {
      author: 'Mock commit author',
      commit: 'mock-commit-id',
      message: 'Mock commit message.',
      date: 0
    };
    proxy.history = [historyObject];
    return Promise.resolve((JSON.parse(JSON.stringify(proxy.history))));
  }

  getProxyFor(id: string) {
    return TreeConfiguration.getWorkingTree().getProxyFor(id);
  }

  getRecentProxies() {
    return [
      new ItemProxy('Item', MockItem()),
      new ItemProxy('Item', MockItem()),
      new ItemProxy('Item', MockItem())
    ]
  }

  public buildItem(type: string, item: any): Promise<ItemProxy> {
    return Promise.resolve(new ItemProxy(type, item));
  }

  registerRecentProxy() {

  }

  getShortFormItemList() {

  }

  getRepositories() {

  }

  deleteItem() {

  }

  public upsertItem(kind: string, item: any): Promise<ItemProxy> {
    return Promise.resolve(new ItemProxy(kind, item));
  }

  public getChangeSubject(): Subject<any> {
    return ItemProxy.getWorkingTree().getChangeSubject();
  }

  public getIcons(): Promise<Array<string>> {
    return Promise.resolve(['fa fa-star']);
  }

  public fetchItem(proxy: ItemProxy): Promise<ItemProxy> {
    let id: string = proxy.item.id;
    proxy.updateItem(proxy.kind, MockItem());
    proxy.item.id = id;
    return Promise.resolve(proxy);
  }

  public getStringRepresentation(koheseObject: any, attributeName: string,
    index: number, enclosingType: KoheseDataModel, dataModel: KoheseDataModel,
    viewModel: KoheseViewModel, formatDefinitionType: FormatDefinitionType):
    string {
    let value: any;
    if (index == null) {
      value = koheseObject[(dataModel.metatype === Metatype.VARIANT) ? 'value'
        : attributeName];
    } else {
      value = koheseObject[(dataModel.metatype === Metatype.VARIANT) ? 'value'
        : attributeName][index];
    }

    if ((dataModel['classProperties'][attributeName].definition.relation) &&
      (value.id != null)) {
      return TreeConfiguration.getWorkingTree().getProxyFor(value.id).item.
        name;
    }

    return String(value);
  }

  async setTreeConfig() {

  }

  getTreeConfig(): Observable<any> {
    return new BehaviorSubject<any>({
      config: TreeConfiguration.getWorkingTree(),
      configType: TreeConfigType.DEFAULT
    });
  }
  
  public getSessionMap(): Promise<any> {
    return Promise.resolve({ 'socketId': {
      sessionId: 'socketId',
      address: '3.3.3.3',
      username: 'admin',
      numberOfConnections: 3
    } });
  }
}
