'use strict'; //Required for use of 'class'
import { ItemProxy }  from './item-proxy';
import { TreeConfiguration } from './tree-configuration';
import * as  _ from 'underscore';


let modelMap = {
  'Internal': { internal: true, kind: 'Internal' },
  'Internal-Lost': { internal: true, kind: 'Internal' },
  'Internal-Model': { internal: true, kind: 'Internal' },
  'Internal-View-Model': { internal: true, kind: 'Internal' }
};

export class KoheseModel extends ItemProxy {

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(withItem){
    let forItem = JSON.parse(JSON.stringify(withItem));
    let itemId = forItem.id;

    console.log('::: Loading KoheseModel: ' + forItem.name);


    if (!forItem.id){
      forItem.id = forItem.name;
    }

    if (forItem.id && !forItem.loadPending && (forItem.id !== forItem.name)) {
      throw new Error('KoheseModel id must match name');
    }

    if (forItem.parentId){
      let parentProxy = ItemProxy.getWorkingTree().getProxyFor(forItem.parentId);
      if(!parentProxy){
        // Parent model has not been loaded yet
        createMissingModelProxy(forItem.parentId);
      }
    }

    super('KoheseModel', forItem);

    if (!modelMap[itemId]) {
      modelMap[itemId] = this;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  updateItem(kind, forItem) {
    console.log('::: Updating KoheseModel: ' + forItem.id);
    super.updateItem(kind, forItem);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  deleteItem() {
    let itemId = this.item.id;
    console.log('::: Deleting KoheseModel: ' + itemId);
    if (modelMap[itemId]){
      delete modelMap[itemId];
    }
    super.deleteItem();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  validateItemContent(itemContent){

    var model = this;

    var validationResult = {
      valid: true,
      missingProperties: []
    };

    if (model && model.item && model.item.requiredProperties) {
      model.item.requiredProperties.forEach((property) => {
        if (!itemContent.hasOwnProperty(property) ||
            itemContent[property] === null) {
          validationResult.valid = false;
          validationResult.missingProperties.push(property);
        }
      });
    }

    return validationResult;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getModelProxyFor(kind) {
    let modelProxy = modelMap[kind];

    // Create a placeholder kind if it does not exist yet
    if (!modelProxy) {
      // Make sure the map has not been missed due to loading order on the client
      modelProxy = ItemProxy.getWorkingTree().getProxyFor(kind);
      if (modelProxy) {
        modelMap[kind] = modelProxy;
      }
    }
    return modelProxy;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static modelDefinitionLoadingComplete() {
    // Create the key ordering for descendant models
    let rootModelProxy = ItemProxy.getWorkingTree().getProxyFor('Model-Definitions');
    var models = rootModelProxy.getDescendants();

    for(var index in models){
      var modelProxy = models[index];
      console.log('::: Processing Model Properties ' + modelProxy.item.name);

      let propertyOrder = _.clone(modelProxy.parentProxy.item.propertyOrder) || [];
      modelProxy.item.propertyOrder = propertyOrder.concat(Object.keys(modelProxy.item.properties));

      let propertyStorageOrder = _.clone(modelProxy.parentProxy.item.propertyStorageOrder) || [];

      if (modelProxy.item.invertItemOrder){
        modelProxy.item.propertyStorageOrder = Object.keys(modelProxy.item.properties).concat(propertyStorageOrder);
      } else {
        modelProxy.item.propertyStorageOrder = propertyStorageOrder.concat(Object.keys(modelProxy.item.properties));
      }

      modelProxy.item.classProperties = _.clone(modelProxy.parentProxy.item.classProperties) || {};
      modelProxy.item.requiredProperties = _.clone(modelProxy.parentProxy.item.requiredProperties) || [];
      modelProxy.item.derivedProperties = _.clone(modelProxy.parentProxy.item.derivedProperties) || [];
      modelProxy.item.calculatedProperties = _.clone(modelProxy.parentProxy.item.calculatedProperties) || [];
      modelProxy.item.stateProperties = _.clone(modelProxy.parentProxy.item.stateProperties) || [];
      modelProxy.item.relationProperties = _.clone(modelProxy.parentProxy.item.relationProperties) || [];
      modelProxy.item.idProperties = _.clone(modelProxy.parentProxy.item.idProperties) || [];

      for (var property in modelProxy.item.properties){
        var propertySettings = modelProxy.item.properties[property];
        modelProxy.item.classProperties[property] = propertySettings;
        if (propertySettings.required){
          modelProxy.item.requiredProperties.push(property);
        }
        if (propertySettings.derived){
          modelProxy.item.derivedProperties.push(property);
          if(propertySettings.calculated){
            modelProxy.item.calculatedProperties.push(property);
          }
        }
        if (propertySettings.type && (propertySettings.type ==='StateMachine')){
          modelProxy.item.stateProperties.push(property);
        }
        if (propertySettings.relation){
          modelProxy.item.relationProperties.push(property);
        }
        if (propertySettings.id){
          modelProxy.item.idProperties.push(property);
        }
      }
    }

    TreeConfiguration.registerKoheseModelClass(KoheseModel);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static removeLoadedModels() {
    // Remove loaded modelMap
    for (let key in modelMap) {
      if (!modelMap[key].internal) {
        delete modelMap[key];
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getModelDefinitions() {
    return modelMap;
  }

}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function createMissingModelProxy(forKind) {
  var lostProxy = new KoheseModel({
    id : forKind,
    name : 'Lost Model: ' + forKind,
    description : 'Found node(s) referencing this node.',
    parentId : 'LOST+FOUND',
    loadPending: true
  });
  lostProxy.internal = true;

  return lostProxy;
}
