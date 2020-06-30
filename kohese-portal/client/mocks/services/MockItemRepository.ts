
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
import { Type, TypeKind } from '../../../common/src/Type.interface';
import { KoheseDataModel,
  KoheseViewModel } from '../../../common/src/KoheseModel.interface';
import { Attribute } from '../../../common/src/Attribute.interface';
import { FormatDefinition,
  FormatDefinitionType } from '../../../common/src/FormatDefinition.interface';
import { FormatContainerKind } from '../../../common/src/FormatContainer.interface';
import { PropertyDefinition } from '../../../common/src/PropertyDefinition.interface';

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
        dataModel.properties['globalTypeAttribute'] = globalTypeAttribute;

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
        dataModel.properties['multivaluedGlobalTypeAttribute'] =
          multivaluedGlobalTypeAttribute;

        let localTypeAttribute: Attribute = {
          name: 'localTypeAttribute',
          type: 'Local Type',
          required: false,
          default: null,
          relation: { contained: true }
        };
        dataModel.properties['localTypeAttribute'] = localTypeAttribute;

        let multivaluedLocalTypeAttribute: Attribute = {
          name: 'multivaluedLocalTypeAttribute',
          type: ['Local Type'],
          required: false,
          default: null,
          relation: { contained: true }
        };
        dataModel.properties['multivaluedLocalTypeAttribute'] =
          multivaluedLocalTypeAttribute;

        let enumerationAttribute: Attribute = {
          name: 'enumerationAttribute',
          type: 'Enumeration',
          required: false,
          default: null,
          relation: { contained: true }
        };
        dataModel.properties['enumerationAttribute'] = enumerationAttribute;

        let multivaluedEnumerationAttribute: Attribute = {
          name: 'multivaluedEnumerationAttribute',
          type: ['Enumeration'],
          required: false,
          default: null,
          relation: { contained: true }
        };
        dataModel.properties['multivaluedEnumerationAttribute'] =
          multivaluedEnumerationAttribute;

        dataModel.localTypes['Local Type'] = ({
          typeKind: TypeKind.KOHESE_MODEL,
          id: 'Local Type',
          name: 'Local Type',
          base: '',
          idInjection: true,
          properties: {
            globalTypeAttribute: globalTypeAttribute,
            multivaluedGlobalTypeAttribute: multivaluedGlobalTypeAttribute,
            localTypeAttribute: localTypeAttribute,
            multivaluedLocalTypeAttribute: multivaluedLocalTypeAttribute,
            enumerationAttribute: enumerationAttribute,
            multivaluedEnumerationAttribute: multivaluedEnumerationAttribute
          },
          validations: [],
          relations: {},
          acls: [],
          methods: []
        } as Type);

        dataModel.localTypes['Enumeration'] = {
          typeKind: TypeKind.ENUMERATION,
          id: 'Enumeration',
          name: 'Enumeration',
          values: [{
            name: 'EnumerationValue1',
            description: '',
          }, {
            name: 'EnumerationValue2',
            description: ''
          }]
        } as Type;

        dataModel['globalTypeAttribute'] = {
          id: 'KoheseModel'
        };
        dataModel['multivaluedGlobalTypeAttribute'] = [{
          id: 'KoheseModel'
        }, {
          id: 'KoheseModel'
        }];

        let localTypeInstance: any = {
          globalTypeAttribute: {
            id: 'KoheseModel'
          },
          multivaluedGlobalTypeAttribute: [{
            id: 'KoheseModel'
          }, {
            id: 'KoheseModel'
          }],
          localTypeAttribute: null,
          multivaluedLocalTypeAttribute: [],
          enumerationAttribute: 'EnumerationValue1',
          multivaluedEnumerationAttribute: [
            'EnumerationValue1',
            'EnumerationValue2'
          ]
        };
        
        localTypeInstance['localTypeAttribute'] = JSON.parse(JSON.stringify(
          localTypeInstance));
        localTypeInstance['multivaluedLocalTypeAttribute'].push(JSON.parse(
          JSON.stringify(localTypeInstance)));
        localTypeInstance['multivaluedLocalTypeAttribute'].push(JSON.parse(
          JSON.stringify(localTypeInstance)));

        dataModel['localTypeAttribute'] = JSON.parse(JSON.stringify(
          localTypeInstance));
        dataModel['multivaluedLocalTypeAttribute'] = [
          JSON.parse(JSON.stringify(localTypeInstance)),
          JSON.parse(JSON.stringify(localTypeInstance))
        ];
        dataModel['enumerationAttribute'] = 'EnumerationValue1';
        dataModel['multivaluedEnumerationAttribute'] = [
          'EnumerationValue1',
          'EnumerationValue2'
        ];
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

        viewModel.localTypes['Local Type'] = ({
          typeKind: TypeKind.KOHESE_MODEL,
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
                  globalTypeAttibutePropertyDefinition,
                  multivaluedGlobalTypeAttributePropertyDefinition,
                  localTypeAttributePropertyDefinition,
                  multivaluedLocalTypeAttributePropertyDefinition,
                  enumerationAttributePropertyDefinition,
                  multivaluedEnumerationAttributePropertyDefinition
                ]
              }]
            }
          },
          defaultFormatKey: {
            default: '0d8f76a0-b631-11ea-94f5-ad77c3385785'
          },
          tableDefinitions: {
            '502ae8c0-b71f-11ea-bdf1-99cdd4c272d8': {
              id: '502ae8c0-b71f-11ea-bdf1-99cdd4c272d8',
              name: 'Local Type Table Definition',
              columns: [
                'globalTypeAttribute',
                'multivaluedGlobalTypeAttribute',
                'localTypeAttribute',
                'multivaluedLocalTypeAttribute',
                'enumerationAttribute',
                'multivaluedEnumerationAttribute'
              ],
              expandedFormat: {
                column1: [],
                column2: [],
                column3: [],
                column4: []
              }
            }
          }
        } as Type);

        viewModel.localTypes['Enumeration'] = {
          typeKind: TypeKind.ENUMERATION,
          id: 'Enumeration',
          name: 'Enumeration',
          values: ['Enumeration Value 1', 'Enumeration Value 2']
        } as Type;

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
            'globalTypeAttribute',
            'multivaluedGlobalTypeAttribute',
            'localTypeAttribute',
            'multivaluedLocalTypeAttribute',
            'enumerationAttribute',
            'multivaluedEnumerationAttribute'
          ],
          expandedFormat: {
            column1: [],
            column2: [],
            column3: [],
            column4: []
          }
        };
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
    return String(koheseObject[attributeName]);
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
