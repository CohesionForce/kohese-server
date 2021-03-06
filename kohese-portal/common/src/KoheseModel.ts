/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


'use strict'; //Required for use of 'class'
import * as  _ from 'underscore';
import { TreeConfiguration } from './tree-configuration';
import { ItemProxy, KoheseModelInterface }  from './item-proxy';
import { KoheseView } from './KoheseView';


let modelMap = {
};

export class KoheseModel extends ItemProxy implements KoheseModelInterface {
  private _view: KoheseView;
  get view() {
    return this._view;
  }
  set view(koheseView: KoheseView) {
    this._view = koheseView;
  }

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
      throw new Error('KoheseModel id must match name: ' + forItem.id);
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

    if (KoheseModel.modelsDefined){
      this.updateDerivedModelProperties();

    // Update derived properties in descendants
    var models = this.getDescendants();

      for(var index in models){
        let modelProxy = models[index];
        modelProxy.updateDerivedModelProperties();
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  updateItem(kind, forItem, mounting: boolean = false) {
    console.log('::: Updating KoheseModel: ' + forItem.id);

    // TODO: need to skip update if there are no changes
    super.updateItem(kind, forItem, mounting);

    if (KoheseModel.modelsDefined){
      this.updateDerivedModelProperties();

    // Update derived properties in descendants
    var models = this.getDescendants();

      for(var index in models){
        let modelProxy = models[index];
        modelProxy.updateDerivedModelProperties();
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  deleteItem(unmounting: boolean = false) {
    let itemId = this._item.id;
    console.log('::: Deleting KoheseModel: ' + itemId);
    if (modelMap[itemId]){
      delete modelMap[itemId];
    }
    super.deleteItem(false, unmounting);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  validateItemContent(itemContent){

    var model = this;

    var validationResult = {
      valid: true,
      kind: model._item.id,
      itemId: itemContent.id,
      missingProperties: [],
      malformedArray: [],
      malformedNumber: [],
      malformedTimestamp: [],
      invalidData: {}
    };

    if (model && model._item && model._item.requiredProperties) {
      for(let property of Object.keys(model._item.classProperties)) {
        let definition = model._item.classProperties[property].definition;

        // Detect missing properties
        if (definition.required) {
          if (!itemContent.hasOwnProperty(property) || itemContent[property] === null
            || (Array.isArray(itemContent[property]) && !itemContent[property].length)
            || (itemContent[property] === '')) {
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
  static getModelProxyFor(kind) : KoheseModel {
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
    let descendants: Array<ItemProxy> = rootModelProxy.getDescendants();
    for (let j: number = 0; j < descendants.length; j++) {
      if (descendants[j].kind === 'KoheseModel') {
        let model : KoheseModel = (descendants[j] as KoheseModel);
        model.updateDerivedModelProperties();
        if (model.parentProxy.kind === 'KoheseModel' && model.view && (model.view.parentProxy !== model.parentProxy.view)) {
          console.log('*** ERROR: View Model Hierarchy does not match Kohese Model Hierarchy for ' + model.view.item.id);
          // TODO: Remove these 2 lines when existing issues are corrected
          model.view.item.parentId = model.parentProxy.view.item.id;
          model.parentProxy.view.addChild(model.view);
        }
      }
    }

    TreeConfiguration.registerKoheseModelClass(KoheseModel);
    KoheseModel.modelsDefined = true;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  updateDerivedModelProperties () {
    let modelProxy = this;
    let kind = modelProxy._item.name;
    console.log('::: Processing Model Properties ' + kind);

    let propertyOrder = _.clone(modelProxy.parentProxy._item.propertyOrder) || [];
    modelProxy._item.propertyOrder = propertyOrder.concat(Object.keys(modelProxy._item.properties));

    let propertyStorageOrder = _.clone(modelProxy.parentProxy._item.propertyStorageOrder) || [];

    if (modelProxy._item.invertItemOrder){
      modelProxy._item.propertyStorageOrder = Object.keys(modelProxy._item.properties).concat(propertyStorageOrder);
    } else {
      modelProxy._item.propertyStorageOrder = propertyStorageOrder.concat(Object.keys(modelProxy._item.properties));
    }

    modelProxy._item.classParentTypes = _.clone(modelProxy.parentProxy._item.classParentTypes) || [];
    modelProxy._item.classLocalTypes = _.clone(modelProxy.parentProxy._item.classLocalTypes) || {};
    modelProxy._item.classProperties = _.clone(modelProxy.parentProxy._item.classProperties) || {};
    modelProxy._item.requiredProperties = _.clone(modelProxy.parentProxy._item.requiredProperties) || [];
    modelProxy._item.derivedProperties = _.clone(modelProxy.parentProxy._item.derivedProperties) || [];
    modelProxy._item.calculatedProperties = _.clone(modelProxy.parentProxy._item.calculatedProperties) || [];
    modelProxy._item.stateProperties = _.clone(modelProxy.parentProxy._item.stateProperties) || [];
    modelProxy._item.relationProperties = _.clone(modelProxy.parentProxy._item.relationProperties) || [];
    modelProxy._item.idProperties = _.clone(modelProxy.parentProxy._item.idProperties) || [];

    if (modelProxy.parentProxy instanceof KoheseModel){
      modelProxy._item.classParentTypes.push(modelProxy.parentProxy._item.name);
    }

    for (let dataType in modelProxy._item.localTypes){
      let localTypeSettings = modelProxy._item.localTypes[dataType];
      modelProxy._item.classLocalTypes[dataType] = {
        definedInKind: kind,
        definition: localTypeSettings
      };

      let classLocalType = modelProxy._item.classLocalTypes[dataType].definition;
      let classLocalParentType : any = {};  // TODO: Consider if LDT inheritance should be supported

      classLocalType.classProperties = _.clone(classLocalParentType.classProperties) || {};
      classLocalType.requiredProperties = _.clone(classLocalParentType.requiredProperties) || [];
      classLocalType.derivedProperties = _.clone(classLocalParentType.derivedProperties) || [];
      classLocalType.calculatedProperties = _.clone(classLocalParentType.calculatedProperties) || [];
      classLocalType.stateProperties = _.clone(classLocalParentType.stateProperties) || [];
      classLocalType.relationProperties = _.clone(classLocalParentType.relationProperties) || [];
      classLocalType.idProperties = _.clone(classLocalParentType.idProperties) || [];

      for (var property in localTypeSettings.properties){
        var propertySettings = localTypeSettings.properties[property];

        classLocalType.classProperties[property] = {
          definedInKind: kind,
          definition: propertySettings
        };

        if (propertySettings.derived){
          classLocalType.derivedProperties.push(property);
          if(propertySettings.calculated){
            classLocalType.calculatedProperties.push(property);
          }
        }
        // TODO: Can a LDT have StateMachine
        if (propertySettings.type && (propertySettings.type ==='StateMachine')){
          classLocalType.stateProperties.push(property);
        }
        if (propertySettings.relation){
          classLocalType.relationProperties.push(property);
        }
        if (propertySettings.id){
          classLocalType.idProperties.push(property);
        }
      }
    }

    for (var property in modelProxy._item.properties){
      var propertySettings = modelProxy._item.properties[property];
      modelProxy._item.classProperties[property] = {
        definedInKind: kind,
        definition: propertySettings
      };
      if (propertySettings.required){
        modelProxy._item.requiredProperties.push(property);
      }
      if (propertySettings.derived){
        modelProxy._item.derivedProperties.push(property);
        if(propertySettings.calculated){
          modelProxy._item.calculatedProperties.push(property);
        }
      }
      if (propertySettings.type && (propertySettings.type ==='StateMachine')){
        modelProxy._item.stateProperties.push(property);
      }
      if (propertySettings.relation){
        modelProxy._item.relationProperties.push(property);
      }
      if (propertySettings.id){
        modelProxy._item.idProperties.push(property);
      }
    }
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
    KoheseModel.modelsDefined = false;
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
    if (this._item.classProperties[propertyName]){
      property = this._item.classProperties[propertyName]
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
