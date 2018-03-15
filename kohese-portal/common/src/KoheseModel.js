'use strict'; //Required for use of 'class'
var ItemProxy = require('./item-proxy.js');
var _ = require('underscore');


let modelMap = {
  'Internal': { internal: true, kind: 'Internal' },
  'Internal-Lost': { internal: true, kind: 'Internal' },
  'Internal-Model': { internal: true, kind: 'Internal' },
  'Internal-View-Model': { internal: true, kind: 'Internal' },
  'Internal-State': { internal: true, kind: 'Internal' }
};

class KoheseModel extends ItemProxy {
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
      let parentProxy = ItemProxy.getProxyFor(forItem.parentId);
      if(!parentProxy){
        // Parent model has not been loaded yet
        createMissingModelProxy(forItem.parentId);
      }
    }

    super('KoheseModel', forItem);

    modelMap[itemId] = this;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  updateItem(forItem) {
    console.log('::: Updating KoheseModel: ' + forItem.id);
    super.updateItem(this.kind, forItem);
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
      modelProxy = ItemProxy.getProxyFor(kind);
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
    let rootModelProxy = ItemProxy.getProxyFor('Model-Definitions');
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

      modelProxy.item.requiredProperties = _.clone(modelProxy.parentProxy.item.requiredProperties) || [];
      modelProxy.item.derivedProperties = _.clone(modelProxy.parentProxy.item.derivedProperties) || [];

      for (var property in modelProxy.item.properties){
        var propertySettings = modelProxy.item.properties[property];
        if (propertySettings.required){
          modelProxy.item.requiredProperties.push(property);
        }
        if (propertySettings.derived){
          modelProxy.item.derivedProperties.push(property);
        }
      }
    }

    ItemProxy.registerKoheseModelClass(KoheseModel);
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
module.exports = KoheseModel;

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



