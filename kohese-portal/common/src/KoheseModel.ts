'use strict'; //Required for use of 'class'
import { ItemProxy }  from './item-proxy';
import { TreeConfiguration } from './tree-configuration';
import * as  _ from 'underscore';


let modelMap = {
};

export class KoheseModel extends ItemProxy {

  static modelsDefined : boolean = false;

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

    if (withItem.isInternal){
      this.internal = true;
    }

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
    // TODO: Need to update derived properties in descendants if there is a changed
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
    super.deleteItem(false);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  validateItemContent(itemContent){

    var model = this;

    var validationResult = {
      valid: true,
      kind: model.item.id,
      itemId: itemContent.id,
      missingProperties: [],
      malformedArray: [],
      malformedNumber: [],
      malformedTimestamp: [],
      invalidData: {}
    };

    if (model && model.item && model.item.requiredProperties) {
      for(let property of Object.keys(model.item.classProperties)) {
        let definition = model.item.classProperties[property].definition;

        // Detect missing properties
        if (definition.required) {
          if (!itemContent.hasOwnProperty(property) || itemContent[property] === null) {
            validationResult.valid = false;
            validationResult.missingProperties.push(property);
          }
        }

        if (itemContent.hasOwnProperty(property) && itemContent[property] !== null) {

          // Detect if an array property is malformed
          if (Array.isArray(definition.type) && !Array.isArray(itemContent[property])) {
            validationResult.valid = false;
            validationResult.malformedArray.push(property);
            validationResult.invalidData[property] = itemContent[property];
          }

          // Detect if number is malformed
          if (definition.type === 'number' && (typeof itemContent[property] !== 'number')) {
            validationResult.valid = false;
            validationResult.malformedNumber.push(property);  
            validationResult.invalidData[property] = itemContent[property];
          }

          // Detect if timestamp is malformed
          if (definition.type === 'timestamp'){
            if (typeof itemContent[property] !== 'number') {
              validationResult.valid = false;
              validationResult.malformedTimestamp.push(property);  
              validationResult.invalidData[property] = itemContent[property];
            } else {
              if (itemContent[property] < 50000000){
                // Detect timestamps that were entered in YYMMDD format
                validationResult.valid = false;
                validationResult.malformedTimestamp.push(property);  
                validationResult.invalidData[property] = itemContent[property];  
              }
            }
          }
        }
      }
    }

    // Remove empty error categories
    if (!validationResult.missingProperties.length){
      delete validationResult.missingProperties;
    }

    if (!validationResult.malformedArray.length){
      delete validationResult.malformedArray;
    }

    if (!validationResult.malformedNumber.length){
      delete validationResult.malformedNumber;
    }

    if (!validationResult.malformedTimestamp.length){
      delete validationResult.malformedTimestamp;
    }

    if (!Object.keys(validationResult.invalidData).length){
      delete validationResult.invalidData;
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
      let modelProxy = models[index];
      let kind = modelProxy.item.name;
      console.log('::: Processing Model Properties ' + kind);

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
        modelProxy.item.classProperties[property] = {
          definedInKind: kind,
          definition: propertySettings
        };
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
    KoheseModel.modelsDefined = true;
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

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getPropertyDetails(propertyName:string) {
    let property = undefined;
    if (this.item.classProperties[propertyName]){
      property = this.item.classProperties[propertyName]
    }
    return property;
  }

    //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  isDerivedProperty(propertyName:string) {
    let property = this.getPropertyDetails(propertyName);
    return property.definition.derived;
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
