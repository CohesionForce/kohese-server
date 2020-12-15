/**
 *
 */

'use strict'; // Required for use of 'class'
import * as  _ from 'underscore';
import * as jsSHA_Import from 'jssha';
import * as uuidV1_Import from 'uuid/v1';
import { TreeConfiguration } from './tree-configuration';
import { TreeHashEntry, TreeHashMap } from './tree-hash';
import { VersionStatus } from './version-status';

//
// Adjust for the differences in CommonJS and ES6 for jssha
//
let jsSHA;
if (typeof(jsSHA_Import) === 'object') {
  jsSHA = (<any>jsSHA_Import).default;
} else {
  jsSHA = jsSHA_Import;
}

// Adjust for the differences in CommonJS and ES6 for uuid
let uuidV1;
if (typeof(uuidV1_Import) === 'object') {
  uuidV1 = uuidV1_Import.default;
} else {
  uuidV1 = uuidV1_Import;
}

class RelationIdMap {
  public references : {};
  public referencedBy : {};
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/i;

let displayICHUnexpectedSetDetails = false;

//////////////////////////////////////////////////////////////////////////
// ItemChangeHandler tracks changes to the item content and provides update
// of dirty status.
//////////////////////////////////////////////////////////////////////////
const ItemChangeHandler = (typeDecl, target, proxy: ItemProxy, propertyPath?, typeProperties?) => {
  return new Proxy(target, {

    //////////////////////////////////////////////////////////////////////////
    get: function(target, property) {

      let path = '';
      if (propertyPath) {
        path = propertyPath + '.';
      }
      path += property.toString();

      // console.log('%%% Get: ' + JSON.stringify(typeDecl) + ' - ' + proxy._item.name + ' - ' + path)

      // Retrieve the existing value of the target property
      let returnValue = target[property];

      // Do not wrap the classProperties
      // TODO: Remove this when classProperities is completely defined by LDT
      if (property === 'classProperties') {
        return returnValue;
      }

      // Determine if there is a property definition
      let propertyDefinition;

      if (!typeProperties && !propertyPath && proxy && proxy.model) {
        // At the ItemProxy level, so retrieve from model.item.classProperties
        typeProperties = proxy.model._item.classProperties;
      }

      if (typeProperties) {
        propertyDefinition = typeProperties[property];
      }
      if (propertyDefinition && !propertyDefinition.definition) {
        propertyDefinition = undefined;
      }

      // Set returnValue for automatic properties
      if (!target.hasOwnProperty(property)) {

        // Detect if this is an ItemChangeHandler
        if (property === '$isItemChangeHandler') {
          return true;
        }

        if (property === '$typeDecl') {
          return typeDecl;
        }

        if (property === '$typeProperties') {
          return typeProperties;
        }
        if (propertyDefinition){
          // Provide automatic return of fields required by current UI filter implementation
          // TODO: Remove this logic when the UI filter is updated to remove this approach
          switch (property) {
            case 'kind':
              if (!propertyPath && proxy) {
                return proxy.kind;
              } else {
                return undefined;
              }
              break;
            case 'status':
              if (!propertyPath && proxy && proxy.vcStatus) {
                return proxy.vcStatus.statusArray;
              } else {
                return undefined;
              }
              break;
          }
        }
      }

      // Wrap any nested Objects (or Arrays)
      if (returnValue !== null && typeof returnValue === 'object') {
        // TODO: Determine if itemChangeHandlers can be replaced with $isItemChangeHandler based logic
        // TODO: Determine if there is a risk of two portions of the same item containing the same returnValue due to assignment issue
        let changeHandler = proxy.itemChangeHandlers.get(returnValue);
        if (!changeHandler) {
          let attributeTypeProperties;
          let nestedTypeDecl = propertyDefinition ? propertyDefinition.definition.type : undefined;

          if (propertyDefinition && propertyDefinition.definition.relation && propertyDefinition.definition.relation.contained) {
            if (!Array.isArray(nestedTypeDecl)) {
              attributeTypeProperties = proxy.model.item.classLocalTypes[
                nestedTypeDecl].definition.classProperties;
            }
          }

          if (Array.isArray(typeDecl)){
            nestedTypeDecl = typeDecl[0];
            if (proxy.model.item.classLocalTypes[nestedTypeDecl]){
              attributeTypeProperties = proxy.model.item.classLocalTypes[
                nestedTypeDecl].definition.classProperties;
            }
          }
          changeHandler = ItemChangeHandler(nestedTypeDecl, returnValue, proxy, path, attributeTypeProperties);
          proxy.itemChangeHandlers.set(returnValue, changeHandler);
        }
        returnValue = changeHandler;
      }

      return returnValue;
    },

    //////////////////////////////////////////////////////////////////////////
    set: function(target, property, value) {

      let provideNotification = false;

      let path = '';
      if (propertyPath) {
        path = propertyPath + '.';
      }
      path += property.toString();

      // console.log('%%% Set: ' + JSON.stringify(typeDecl) + ' - ' + proxy._item.name + ' - ' + path)

      if (target[property] === value) {
        // console.log('$$$ Trying to set property to same value: ' + property.toString() + ' - ' + value);
        return true;
      }

      // Store automatic fields without notification
      switch (property) {
        case 'children':
        case '__deletedProperty':
          if (!propertyPath){
            target[property] = value;
            return true;
          }
      }

      // Store Lost-Proxy fields
      if (proxy.kind === 'Internal-Lost') {
        target[property] = value;
        return true;
      }

      // Determine if there is a property definition
      let propertyDefinition;
      if (typeProperties) {
        propertyDefinition = typeProperties[property];
      } else if (!propertyPath && proxy && proxy.model) {
        propertyDefinition = proxy.model._item.classProperties[property];
      }

      if (propertyDefinition && !propertyDefinition.definition) {
        propertyDefinition = undefined;
      }

      // Detect unexpected properties
      if (!propertyDefinition && proxy && proxy.model && !Array.isArray(typeDecl)) {
        let trace = new Error().stack;
        console.log('!!! Warning: Trying to set unexpected property: ' + propertyPath + '/' + property.toString() + ' - to: ' + JSON.stringify(value));
        if (displayICHUnexpectedSetDetails) {
          console.log(trace);
        }
        console.log('!!! Warning: Attempting to set unexpected property will become an error');

        // TODO: Need to throw an exception if this is attempted (for now let it happen)
      }

      if (!propertyDefinition || (propertyDefinition && !propertyDefinition.definition.derived)) {

        // console.log('$$$ Trying to set property: ' + property.toString() + ' -> ' + value + '<-');

        if (!proxy.dirtyFields) {
          proxy.dirtyFields = {};
        }

        // Clone the value in case it is an object
        let clonedValue;
        if (value !== undefined) {
          clonedValue = JSON.parse(JSON.stringify(value))
        }

        // TODO: Handle array splitting
        if (!proxy.dirtyFields.hasOwnProperty(path)) {
          // Copy the original value for comparison
          let clonedOriginalValue;

          if (target[property] != null) {
            clonedOriginalValue = JSON.parse(JSON.stringify(target[property]));
          }

          proxy.dirtyFields[path] =
            {
              from: clonedOriginalValue,
              to: clonedValue
            }
        } else {
          // Update to the new value
          proxy.dirtyFields[path].to = clonedValue;
        }

        let difference: any = proxy.dirtyFields[path];
        // Detect if the value has been reset to its original value
        if (((difference.from == null) && (difference.to == null)) || _.
          isEqual(difference.to, difference.from)) {
          // TODO: remove next console lines
          // console.log('--> Removing dirty for: ' + path);
          // console.log(JSON.stringify(difference, null, '  '));
          delete proxy.dirtyFields[path];
          if (Object.keys(proxy.dirtyFields).length === 0) {
            delete proxy.dirtyFields;
          }
        }

        provideNotification = true;
      }

      // TODO: Need to remove next line
      // console.log('>>> Setting property: ' + property.toString() + ' - ' + JSON.stringify(value));
      target[property] = value;

      if (proxy && provideNotification) {
        proxy.notifyDirtyStatus();
      }

      return true;
    },

    //////////////////////////////////////////////////////////////////////////
    deleteProperty: function(target, property) {
      let provideNotification = false;

      let path = '';
      if (propertyPath) {
        path = propertyPath + '.';
      }
      path += property.toString();

      if (target.hasOwnProperty(property)) {

        // console.log('$$$ Trying to delete property: ' + property.toString());

        if (!proxy.dirtyFields) {
          proxy.dirtyFields = {};
        }

        if (!proxy.dirtyFields[path]) {
          // TODO: Handle array splitting
          proxy.dirtyFields[path] = {
            from: target[property]
          }
        } else {
          delete proxy.dirtyFields[path].to;
        }

        // Detect if the value has been reset to its original value
        if (_.isEqual(proxy.dirtyFields[path].to, proxy.dirtyFields[path].from)) {
          delete proxy.dirtyFields[path];
          if (Object.keys(proxy.dirtyFields).length === 0) {
            delete proxy.dirtyFields;
          }
        }

        provideNotification = true;
      }

      delete target[property];

      if (proxy && provideNotification) {
        proxy.notifyDirtyStatus();
      }

      return true;
    }
  });
};

//////////////////////////////////////////////////////////////////////////
// Create ItemProxy from an existing Item
//////////////////////////////////////////////////////////////////////////
interface ValidationResultType {
    valid: boolean,
    kind: string,
    itemId: string,
    missingProperties?: Array<string>,
    malformedArray?: Array<string>,
    malformedNumber?: Array<string>,
    malformedTimestamp?: Array<string>,
    invalidData?: {}
}

export interface KoheseModelInterface {
  // TODO: Need to remove dependance of ItemProxy on model's _item
  _item? : any;

  item? : any;
  view : any;

  validateItemContent(itemContent) : ValidationResultType;
  getPropertyDetails(propertyName: string) : any;
  isDerivedProperty(propertyName: string) : boolean;

  // TODO: Need to remove this attribute that is added by Dynamic Types Service
  type : any;
}

export class ItemProxy {

  public static oidCalcCount = 0;
  public static theCalcCount = 0;
  // private static shaObj = new jsSHA('SHA-1', 'TEXT');

  public model : KoheseModelInterface;
  public state;
  public _item
  public item;
  public itemChangeHandlers = new WeakMap();
  public dirtyFields;
  public treeConfig : TreeConfiguration;
  public kind;
  public references;
  public relations;
  public internal : boolean = false;

  public validationError;

  public oid;
  public deferTreeHash;
  public treeHash;
  public treeHashEntry : TreeHashEntry;

  public parentProxy;
  public children;
  public descendantCount : number;

  public analysis;

  // Needed for information calculated on the server
  public repoPath;

  // Needed for information calculated on the client
  public external_dirty : boolean = false;

  set dirty (value : boolean) {
    // TODO: Need to evaluate remaining setting of dirty and remove
    this.external_dirty = value;
  }

  get dirty () : boolean {
    return this.external_dirty || this.hasDirty();
  }

  private _vcStatus : VersionStatus = new VersionStatus();
  public history;
  public newHistoryNewStyle;  // TODO: Remove this after testing is complete
  public type; // Used to store KoheseType.

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(kind, withItem, treeConfig?) {
    if (!treeConfig){
      // console.log('$$$ Using working tree');
      treeConfig = TreeConfiguration.getWorkingTree();
    } else {
      // console.log('$$$ Using tree: ' + treeConfig.treeId);
    }

    var forItem = JSON.parse(JSON.stringify(withItem));
    var itemId = forItem.id;

    if (!itemId){
      if ('KoheseModel' === kind) {
        forItem.id = forItem.name;
      } else {
        forItem.id = uuidV1();
      }

      itemId = forItem.id;
      console.log('::: Allocating new id: ' + itemId);
    } else {
      // console.log('::: Constructor called for ' + itemId);
    }

    // Perform validation before proxy creation and storage in the map since invalid items should not be allowed
    // after loading complete
    let validationResult = ItemProxy.validateItemContent(kind, forItem, treeConfig, true);

    // Note: The constructor may be called for an existing item proxy.  Look for the existing proxy if it exists.
    let proxy : ItemProxy = treeConfig.proxyMap[itemId];

    if (!proxy) {
      // An existing proxy was not found, so use the newly created instance from this constructor
      proxy = this;
      proxy.treeConfig = treeConfig;
      proxy.children = [];
      proxy.relations = {
        references: {
          Item: {
            children: proxy.children
          }
        },
        referencedBy: {}
      };
      proxy.descendantCount = 0;

      // Store a reference to this new proxy in the map
      proxy.treeConfig.proxyMap[itemId] = proxy;
    }

    if (!validationResult.valid) {
      // Store the validationResult if there is an erro
      proxy.validationError = validationResult;
    } else {
      // Remove any prior validationError
      delete proxy.validationError;
    }

    switch (kind){
      case 'Internal':
      case 'Internal-Lost':
      case 'Internal-Model':
      case 'Internal-View-Model':
        proxy.internal = true;
        break;
      default:
        // Do Nothing
      }

    if (proxy._item &&
        (!proxy._item.loadPending) &&
        (proxy.kind !== 'Internal') &&
        (proxy.kind !== 'Internal-Lost') &&
        (proxy.kind !== 'Internal-Model')){
      // Item already exists, so update it instead
      proxy.updateItem(kind, forItem);
      return proxy;
    }

    let loadPending;
    if (proxy && proxy._item){
      loadPending = proxy._item.loadPending;
    }


    proxy._item = {};
    proxy.item = ItemChangeHandler(kind, proxy._item, proxy);

    proxy.copyAttributes(forItem);
    proxy.clearDirtyFlags();

    proxy.setItemKind(kind);

    if (kind === 'Repository') {
      proxy.treeConfig.repoMap[itemId] = proxy;
    }

    if (kind === 'Internal') {
      // Don't continue
      return proxy;
    }

    if (proxy._item.parentId && proxy._item.parentId === '') {
      delete proxy._item.parentId;
    }

    var parentId = proxy._item.parentId || 'ROOT';

    if (parentId.hasOwnProperty('id')){
      // parentId supplied as a reference object
      parentId = parentId.id;
      proxy._item.parentId = parentId;
    }

    var parent = proxy.treeConfig.proxyMap[parentId];

    if (!parent) {
      // Create the parent before it is found
      parent = ItemProxy.createMissingProxy('Item', 'id', parentId, proxy.treeConfig);
    }

    parent.addChild(proxy);

    if (loadPending && (proxy._item.parentId !== 'LOST+FOUND') && (this.kind !==
      'Internal') && (this.kind !== 'Internal-Model') && (this.kind !==
      'Internal-View-Model')) {
      // Remove load pending since the item has now been loaded
      delete proxy._item.loadPending;
      this.internal = false;
    }

    if (proxy.children){
      proxy.sortChildren();
    } else {
      proxy._item.children = [];
    }

    proxy.calculateTreeHash();
    proxy.calculateDerivedProperties();
    proxy.updateReferences();

    if(!proxy.treeConfig.loading){
      proxy.treeConfig.changeSubject.next({
        type: 'create',
        kind: proxy.kind,
        id: proxy._item.id,
        proxy: proxy
      });
    }

    return proxy;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  hasDirty() : boolean {
    return this.hasOwnProperty('dirtyFields');
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  clearDirtyFlags() {
    if (this.dirty) {
      delete this.dirtyFields;
      this.external_dirty = false;
      this.treeConfig.changeSubject.next({
        type: 'dirty',
        kind: this.kind,
        id: this._item.id,
        dirty: this.dirty,
        dirtyFields: this.dirtyFields,
        proxy: this
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static validateItemContent (kind, forItem, treeConfig, migrateData = false) : any {
    let validation = {
      valid : true
    };

    if (TreeConfiguration.koheseModelDefn) {
      let modelProxy = TreeConfiguration.koheseModelDefn.getModelProxyFor(kind);
      if(modelProxy && (modelProxy.kind === 'KoheseModel')){
        // if (modelProxy.constructor.name !== 'KoheseModel'){
        //   modelProxy.dumpProxy();
        //   throw({
        //     error: 'Class Mismatch',
        //     expected: 'KoheseModel',
        //     found: modelProxy.constructor.name
        //   });
        // }
        validation = modelProxy.validateItemContent(forItem);

        if (!validation.valid){
          // TODO Need to remove this bypass logic which is needed to load some existing data
          if(treeConfig.loading){

            if (migrateData) {
              ItemProxy.resolveDataMigrationIssue(validation, forItem);
              ItemProxy.validateItemContent(kind, forItem, treeConfig, false);
            } else {
              console.log('*** Error: Invalid data item');
              console.log(validation);
            }

          } else {
            throw ({
              error: 'Not-Valid',
              validation: validation,
              item: forItem
            });
          }
        }
      }
    }
    return validation;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static resolveDataMigrationIssue(validation, forItem) {

    ////////////////////////////////////////////////////////////////////////
    function convertReference (property) {
      if (validation.invalidData.hasOwnProperty(property)) {

        // Resolve reference that is a single UUID
        if (UUID_REGEX.test(forItem[property])) {
          forItem[property] = [ { id: forItem[property] } ]
        }

        // Resolve reference that is a single reference
        if (forItem[property].id) {
          forItem[property] = [ forItem[property] ]
        }

      }
    }

    ////////////////////////////////////////////////////////////////////////
    function convertTimestamp(property) {
      if (forItem[property] === '') {
        delete forItem[property];
      } else {
        if (validation.invalidData.hasOwnProperty(property)) {
          if (DATE_REGEX.test(forItem[property])) {
            forItem[property] = Date.parse(forItem[property]);
          }
        }
      }
    }

    ////////////////////////////////////////////////////////////////////////
    function convertNumber(property) {
      if (validation.invalidData.hasOwnProperty(property)) {
        if (forItem[property] === '') {
          delete forItem[property];
        } else {
          let convertedNumber = Number(forItem[property]);
          if (convertedNumber !== NaN) {
            forItem[property] = convertedNumber;
          }
        }
      }
    }

    ////////////////////////////////////////////////////////////////////////
    if (!validation.valid) {

      // Adjust malformed arrays
      if (validation.malformedArray) {

        if (validation.kind == 'Observation' || validation.kind === 'Issue'){
          convertReference('context');
        }

        if (validation.kind == 'Task') {
          convertReference('predecessors');
        }

        if (validation.kind == 'UseCase') {
          if (validation.invalidData.Actors) {
            forItem.Actors = [ forItem.Actors ]
          }
        }

      }

      // Adjust malformed numbers
      if (validation.malformedNumber) {
        if (validation.kind == 'Action' || validation.kind === 'Task'){
          convertNumber('estimatedHoursEffort');
          convertNumber('remainingHoursEffort');
          convertNumber('actualHoursEffort');
        }
      }

      // Adjust malformed timestamps
      if (validation.malformedTimestamp) {
        if (validation.kind == 'Observation' || validation.kind === 'Issue'){
          convertTimestamp('observedOn');
        }

        if (validation.kind == 'Action' || validation.kind === 'Task'){
          convertTimestamp('approvedOn');
          convertTimestamp('estimatedStart');
          convertTimestamp('estimatedCompletion');
          convertTimestamp('actualStart');
          convertTimestamp('actualCompletion');
        }
      }

    }

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getWorkingTree() : TreeConfiguration {
    // TODO remove all references
    return TreeConfiguration.getWorkingTree();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static gitDocumentOID(forDoc) {

    // This function calculates a OID that is equivalaent to the one calculated
    // natively by git.for the contents of a blob

    var forText = JSON.stringify(forDoc, null, '  ');

    var length = forText.length;

    var shaObj = new jsSHA('SHA-1', 'TEXT');

    shaObj.update('blob ' + length + '\0' + forText);

    var oid = shaObj.getHash('HEX');

    return oid;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static displayCalcCounts() {
    console.log('^^^ OID Calc Count: ' + ItemProxy.oidCalcCount);
    console.log('^^^ THE Calc Count: ' + ItemProxy.theCalcCount);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  calculateDerivedProperties(){
    if (this.model && this.model._item){
      if (this.model._item.stateProperties){
        let seperatorRequired = false;
        this.state = '';
        for(let statePropertyIdx in this.model._item.stateProperties){
          let stateProperty = this.model._item.stateProperties[statePropertyIdx];
          if(seperatorRequired){
            this.state += '/';
          }
          this.state += this._item[stateProperty];
          seperatorRequired = true;
        }
      }
      if (this.model._item.calculatedProperties.length){
        for (let cpIdx in this.model._item.calculatedProperties){
          // TODO Need to expand calculation with complex calculations
          let propertyName = this.model._item.calculatedProperties[cpIdx];
          let property = this.model._item.properties[propertyName];
          let calculation = property.calculated;

          // Note:  This only supports assignment calculations
          this._item[propertyName] = this._item[calculation];
        }
      }
      if (this.model._item.idProperties){
        for (let idIdx in this.model._item.idProperties){
          let idName = this.model._item.idProperties[idIdx];
          let idKind = this.model._item.classProperties[idName].definedInKind;
          this.treeConfig.addIdMap(idKind, idName, this);
        }
      }

      // Calculate derived children attribute
      this._item.children = this.getOrderedChildIdsAsReferences();

      // Calculate derived validation errors
      if (this.validationError) {
        this._item.hasValidationError = true;
      } else {
        delete this._item.hasValidationError;
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRelationsByAttribute() {
    let relationMap = {};
    for(let refTypeKey in this.relations){
      relationMap[refTypeKey] = {};
      for(let kindKey in this.relations[refTypeKey])
      {
        relationMap[refTypeKey] = {};

        let relationsForKind = this.relations[refTypeKey][kindKey];
        for(let relationKey in relationsForKind){
          if (!relationMap[refTypeKey][relationKey]){
            relationMap[refTypeKey][relationKey] = {};
          }
          let relationList = relationsForKind[relationKey];
          if (Array.isArray(relationList)){
            relationMap[refTypeKey][relationKey][kindKey] = [];
            for(let index = 0; index < relationList.length; index++){
              relationMap[refTypeKey][relationKey][kindKey].push(relationList[index]);
            }
          } else {
            if (relationList){
              relationMap[refTypeKey][relationKey][kindKey] = relationList;
            } else {
              delete relationMap[refTypeKey][relationKey];
            }
          }
        }
      }
    }
    return relationMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  updateReferences(){
    // console.log('$$$ Updating References for: ' + this._item.id);
    let oldReferences = this.getRelationIdMap().references || {};

    let thisProxy = this;

    //////////////////////////////////////////////////////////////////////////
    function updateReferencesForRelations(forObject, withType, withPrefix?){

      let prefix;
      if (withPrefix){
        prefix = withPrefix + '.';
      } else {
        prefix = '';
      }

      for(let relationPropertyIdx in withType.relationProperties){
        let relationProperty = withType.relationProperties[relationPropertyIdx];
        let prefixedRelationProperty = prefix + relationProperty;
        let relationPropertyDefn = withType.classProperties[relationProperty].definition;

        let relationDefn;
        if (typeof relationPropertyDefn.relation === 'object'){
          relationDefn = relationPropertyDefn.relation;
        }

        // Ignore relation for parent/children since they are processed differently
        switch (prefixedRelationProperty) {
          case 'parentId':
          case 'children':
            continue;
        }

        // Capture state of relations before update
        let isSingle = true;
        let oldRelationIds = [];
        let newRelationIds = [];
        if (oldReferences &&
            oldReferences[thisProxy.kind] &&
            oldReferences[thisProxy.kind][prefixedRelationProperty])
        {
          oldRelationIds = oldReferences[thisProxy.kind][prefixedRelationProperty];
        }

        // Detect relations
        let relationList = [];

        if (forObject){
          if(relationDefn && relationDefn.contained){
            let containedTypeDefn = thisProxy.model._item.classLocalTypes[relationPropertyDefn.type].definition;
            let relationValue = forObject[relationProperty];
            if (relationValue){
              updateReferencesForRelations(relationValue, containedTypeDefn, prefixedRelationProperty);
            }
          } else {

            if (Array.isArray(forObject)){
              for (let objIdx in forObject) {
                let relationValue = forObject[objIdx][relationProperty];
                if (relationValue) {
                  if(Array.isArray(relationValue)){
                    isSingle = false;

                    // Check for reference style
                    let updatedRelationValue = [];
                    let valueUpdated = false;
                    for(let idx in relationValue){
                      let thisRelationValue = relationValue[idx];
                      if (!relationDefn && !thisRelationValue.hasOwnProperty('id')){
                        valueUpdated = true;
                        thisRelationValue = {id: thisRelationValue};
                      }
                      updatedRelationValue.push(thisRelationValue);
                    }

                    if(valueUpdated){
                      forObject[objIdx][relationProperty] = updatedRelationValue;
                    }
                    relationList.push(...updatedRelationValue);
                  } else {

                    // Check for reference style
                    if(!relationDefn && !relationValue.hasOwnProperty('id')){
                      // Update the property to have the correct reference style
                      relationValue = {id: relationValue};
                      forObject[objIdx][relationProperty] = relationValue;
                    }

                    relationList.push(relationValue);
                  }
                }
              }
            } else {
              let relationValue = forObject[relationProperty];
              if (relationValue){
                if(Array.isArray(relationValue)){
                  isSingle = false;

                  // Check for reference style
                  let updatedRelationValue = [];
                  let valueUpdated = false;
                  for(let idx in relationValue){
                    let thisRelationValue = relationValue[idx];
                    if (!relationDefn && !thisRelationValue.hasOwnProperty('id')){
                      valueUpdated = true;
                      thisRelationValue = {id: thisRelationValue};
                    }
                    updatedRelationValue.push(thisRelationValue);
                  }

                  if(valueUpdated){
                    forObject[relationProperty] = updatedRelationValue;
                  }
                  relationList.push(...updatedRelationValue);
                } else {

                  // Check for reference style
                  if(!relationDefn && !relationValue.hasOwnProperty('id')){
                    // Update the property to have the correct reference style
                    relationValue = {id: relationValue};
                    forObject[relationProperty] = relationValue;
                  }

                  relationList.push(relationValue);
                }
              }
            }
          }
        }

        for(let relIdx in relationList){
          let refId = relationList[relIdx];
          if (refId.hasOwnProperty('id')){
            refId = refId.id;
          }

          let refProxy;
          if (relationDefn){
            refProxy = thisProxy.treeConfig.getProxyByProperty(relationDefn.kind, relationDefn.foreignKey, refId);
            if (!refProxy && !relationDefn.contained){
              ItemProxy.createMissingProxy(relationDefn.kind, relationDefn.foreignKey, refId, thisProxy.treeConfig);
              refProxy = thisProxy.treeConfig.getProxyFor(refId);
            }
          } else {
            refProxy = thisProxy.treeConfig.getProxyFor(refId);
            if(!refProxy){
              ItemProxy.createMissingProxy('Item', 'id', refId, thisProxy.treeConfig);
              refProxy = thisProxy.treeConfig.getProxyFor(refId);
            }
          }
          if (refProxy){
            newRelationIds.push(refProxy._item.id);
            thisProxy.addReference(refProxy, prefixedRelationProperty, isSingle);
          }
        }

        // Detect old relations that need to be removed
        if (!Array.isArray(oldRelationIds)){
          // Convert oldRelationIds to an array
          if (oldRelationIds){
            oldRelationIds = [ oldRelationIds ];
          }
        }
        for (let oldRefIdx in oldRelationIds){
          let oldRefId = oldRelationIds[oldRefIdx];
          if (!newRelationIds.includes(oldRefId)){
            // Old Ref is no longer associated
            // console.log('%%% oldRefId: ' + oldRefId);
            let oldRefProxy = thisProxy.treeConfig.getProxyFor(oldRefId);
            if (oldRefProxy){
              thisProxy.removeReference(oldRefProxy, prefixedRelationProperty, isSingle);
            } else {
              console.log('*** Could not find ref for ' + oldRefId);
              console.log(oldRelationIds);
            }
          }
        }

      }
    }

    //////////////////////////////////////////////////////////////////////////
    if (thisProxy.model && thisProxy.model._item && thisProxy.model._item.relationProperties){
      updateReferencesForRelations(thisProxy._item, thisProxy.model._item);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  addReference(toProxy, forProperty, isSingle){

    // Add reference to the referencing proxy
    if (!this.relations.references[this.kind]){
      this.relations.references[this.kind] = {};
    }

    if (isSingle){
      this.relations.references[this.kind][forProperty] = toProxy;
    } else {
      if (!this.relations.references[this.kind][forProperty]){
        this.relations.references[this.kind][forProperty] = [];
      }

      if (!this.relations.references[this.kind][forProperty].includes(toProxy)){
        this.relations.references[this.kind][forProperty].push(toProxy);
      }
    }

    // Add reference to the referenced proxy
    if (!toProxy.relations.referencedBy[this.kind]){
      toProxy.relations.referencedBy[this.kind] = {};
    }
    if (!toProxy.relations.referencedBy[this.kind][forProperty]){
      toProxy.relations.referencedBy[this.kind][forProperty] = [];
    }

    if (!toProxy.relations.referencedBy[this.kind][forProperty].includes(this)){
      toProxy.relations.referencedBy[this.kind][forProperty].push(this);
      if(!this.treeConfig.loading){
        this.treeConfig.changeSubject.next({
          type: 'reference-added',
          relation: 'forProperty',
          kind: this.kind,
          id: toProxy._item.id,
          proxy: toProxy
        });
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  removeReference(toProxy, forProperty, isSingle) {
    // Remove reference to the referencing proxy
    if (!this.relations.references[this.kind]){
      this.relations.references[this.kind] = {};
    }

    if (isSingle){
      if (this.relations.references[this.kind][forProperty] === toProxy){
        // console.log('%%% Removing reference to ' + toProxy._item.id);
        delete this.relations.references[this.kind][forProperty];
      }
    } else {
      if (!this.relations.references[this.kind][forProperty]){
        this.relations.references[this.kind][forProperty] = [];
      }

      let proxyArrayIdx = this.relations.references[this.kind][forProperty].indexOf(toProxy);
      if (proxyArrayIdx > -1){
        // console.log('%%% Removing reference from array for ' + toProxy._item.id);
        this.relations.references[this.kind][forProperty].splice(proxyArrayIdx, 1);
      }
    }

    // Remove reference from the referenced proxy
    if (!toProxy.relations.referencedBy[this.kind]){
      toProxy.relations.referencedBy[this.kind] = {};
    }
    if (!toProxy.relations.referencedBy[this.kind][forProperty]){
      toProxy.relations.referencedBy[this.kind][forProperty] = [];
    }

    let proxyIdx = toProxy.relations.referencedBy[this.kind][forProperty].indexOf(this);
    if (proxyIdx > -1){
      // console.log('%%% Removing reference from array for ' + toProxy._item.id);
      toProxy.relations.referencedBy[this.kind][forProperty].splice(proxyIdx, 1);
      if(!this.treeConfig.loading){
        this.treeConfig.changeSubject.next({
          type: 'reference-removed',
          relation: 'forProperty',
          kind: this.kind,
          id: toProxy._item.id,
          proxy: toProxy
        });
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  removeAllReferences(){
    let references = this.relations.references;

    for(let kindKey in references)
    {
      let relationsForKind = references[kindKey];
      for(let relationKey in relationsForKind){
        let relationList = relationsForKind[relationKey];
        if (Array.isArray(relationList)){
          if (kindKey !== 'Item' && relationKey !== 'children'){
            for(let index = 0; index < relationList.length; index++){
              console.log('>>> Remove reference:  ' + relationList[index]._item.id);
              this.removeReference(relationList[index], relationKey, false);
            }
          }
        } else {
          if (relationList){
            if (kindKey !== 'Item' && relationKey !== 'parent'){
              this.removeReference(relationList, relationKey, true);
            }
          }
        }
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  setItemKind(kind){
    this.kind = kind;
    this.internal = ((this.kind === 'Internal') || (this.kind ===
      'Internal-Lost') || (this.kind === 'Internal-Model') || (this.kind ===
      'Internal-View-Model'));

    if (TreeConfiguration.koheseModelDefn){
      this.model = TreeConfiguration.koheseModelDefn.getModelProxyFor(kind);
    } else {
      this.treeConfig.proxyHasDeferredModelAssociation[this._item.id] = this;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  checkPropertyOrder(){
    if (this.model && this.model._item && this.model._item.propertyStorageOrder) {
      var newItem : any = {};;
      var oldKeys = Object.keys(this._item);
      for (var keyIdx in this.model._item.propertyStorageOrder){
        var key = this.model._item.propertyStorageOrder[keyIdx];
        if (this._item.hasOwnProperty(key)) {
          newItem[key] = this._item[key];
        }
      }
      if (this._item.itemIds){
        newItem.itemIds = this._item.itemIds;
      }

      var newKeys = Object.keys(newItem);
      if (!_.isEqual(oldKeys, newKeys)){
        let deletedKeys = _.difference(oldKeys, newKeys);
        if (deletedKeys.length > 0) {
          console.log('*** Error: Found unexpected properties: ' + deletedKeys + ' in ' + this.kind + ' - ' + this._item.name + ' - ' + this._item.id);
          deletedKeys.forEach(key => {
            console.log('>>> ' + key + ' = ' + JSON.stringify(this._item[key]));
          });
        // } else {
        //   console.log('!!! Warning: Properties are in a different order: ');
        //   console.log('>>> Old Keys: ' + oldKeys);
        //   console.log('>>> New Keys: ' + newKeys);
        }
        this._item = newItem;
        this.item = ItemChangeHandler(this.kind, this._item, this);
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  validateItem(){

    return ItemProxy.validateItemContent(this.kind, this._item, this.treeConfig);

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  document() {
    this.checkPropertyOrder();
    return JSON.stringify(this._item, null, '  ');
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cloneItem() {
    this.checkPropertyOrder();
    let clone = JSON.parse(JSON.stringify(this._item));
    return clone;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cloneItemAndStripDerived() {
    let clone = this.cloneItem();

    // Determine if derived properities need to be stripped
    if (this.model && this.model._item.derivedProperties && this.model._item.derivedProperties.length) {
      let derivedProperties = this.model._item.derivedProperties;
      for(let idx in derivedProperties){
        let key = derivedProperties[idx];
        delete clone[key];
      }
    }

    if (this.kind === 'KoheseModel') {
      for (let localTypeName in this._item.localTypes) {
        let localType: any = clone.localTypes[localTypeName];
        let koheseModelType: any = this.model._item;
        for (let j: number = 0; j < koheseModelType.derivedProperties.length;
          j++) {
          delete localType[koheseModelType.derivedProperties[j]];
        }
      }
    }

    return clone;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  strippedDocument() {
    let clone = this.cloneItemAndStripDerived();
    return JSON.stringify(clone, null, '  ');
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  calculateOID() {
    // Skip placeholder nodes that haven't been loaded yet
    if (!this._item){
      return;
    }

    var shaObj = new jsSHA('SHA-1', 'TEXT');

    var doc = this.strippedDocument();
    shaObj.update('blob ' + doc.length + '\0' + doc);

    this.oid = shaObj.getHash('HEX');
    ItemProxy.oidCalcCount++;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  calculateTreeHash(deferredRollup : boolean = false, toOID?, toTreeHashEntry?) {

    // Don't calculateTreeHash during initial load
    if (!this._item || (this.treeConfig.loading && !deferredRollup)){
      this.deferTreeHash = true;
      return;
    }

    // TODO: Should only have to do this when content is updated
    if (toOID){
      this.oid = toOID;
    } else {
      this.calculateOID();
    }

    let treeHashEntry : TreeHashEntry = {
        kind: this.kind,
        oid: this.oid,
        childTreeHashes: {},
        treeHash : undefined
    };

    for (var childIdx in this.children){
      var childProxy = this.children[childIdx];
      switch(childProxy.kind){
        case 'Repository':
          treeHashEntry.childTreeHashes[childProxy._item.id] = 'Repository-Mount';
          break;
        case 'Internal':
          treeHashEntry.childTreeHashes[childProxy._item.id] = 'Internal';
          break;
        default:
          if(childProxy.deferTreeHash){
            this.deferTreeHash = true;
            return;
          }
          treeHashEntry.childTreeHashes[childProxy._item.id] = childProxy.treeHash;
      }
    }

    let calculateTreeHashSha = true;
    let removeDeferTreeHash = true;

    if (toTreeHashEntry) {
      this.treeHash = toTreeHashEntry.treeHash;
      treeHashEntry.treeHash = this.treeHash;

      // Add the parentId to the treeHash entry
      if (this._item.parentId){
        treeHashEntry.parentId = this._item.parentId;
      }

      let diff = TreeHashEntry.diff(toTreeHashEntry, treeHashEntry);
      if (!diff.match) {
        console.log('!!! TreeHashEntry did not match expected: ' + this._item.id + ' - ' + this._item.name);
        console.log(diff);
        delete treeHashEntry.treeHash;
        delete treeHashEntry.parentId;
        removeDeferTreeHash = false;
      } else {
        calculateTreeHashSha = false;
      }
    }

    if (calculateTreeHashSha){
      var shaObj = new jsSHA('SHA-1', 'TEXT');
      shaObj.update(JSON.stringify(treeHashEntry));
      this.treeHash =  shaObj.getHash('HEX');
      ItemProxy.theCalcCount++;

      treeHashEntry.treeHash = this.treeHash;

      // Add the parentId to the treeHash entry
      if (this._item.parentId){
        treeHashEntry.parentId = this._item.parentId;
      }
    }

    this.treeHashEntry = treeHashEntry;

    if (this.deferTreeHash && removeDeferTreeHash) {
      delete this.deferTreeHash;
    }

    // Propagate changes up the tree
    if (!deferredRollup){
      if (this.parentProxy){
        this.parentProxy.calculateTreeHash();
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  calculateTreeHashes(deferCalc : boolean = false, repoOnly : boolean = true) : Promise<number> {

    // Note: This operation can take a long time on large data sets.  The iterationCount
    //       allows a configurable number of items to be processed and then yields the
    //       processing to allow other processing of the application to continue.  If
    //       not deferCalc, then the processing will run to completion without yielding
    //       the CPU.

    let iterationCount = 0;
    let resultPromise = new Promise<number>((resolve, reject) => {
      const deferredRollup = true;
      const yieldAtIteration = 100;
      const msToYield = 100;

      let flags = {
        postorder: true
      };

      if (repoOnly) {
        flags['excludeKind'] = ['Repository', 'Internal'];
      }

      function performTreeHashCalculations() {
        // console.log('$$$ Beginning TreeHash calculation at: ' + iterationCount);
        let proxy : ItemProxy;
        let thisIteration;

        // tslint:disable-next-line: no-use-before-declare
        while (thisIteration = iterator.next()){
          if (thisIteration.done){
            resolve(iterationCount);
            return;
          }
          proxy = thisIteration.value;
          if (proxy.deferTreeHash || !proxy.treeHashEntry) {
            iterationCount++;
            proxy.calculateTreeHash(deferredRollup);
            if (deferCalc && (iterationCount % yieldAtIteration === 0)) {
              setTimeout(performTreeHashCalculations, msToYield);
              return;
            }
          }
        }


      }

      let iterator = this.iterateTree(flags);

      if (deferCalc){
        setTimeout(performTreeHashCalculations, msToYield);
      } else {
        performTreeHashCalculations();
      }
    });

    return resultPromise;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getTreeHashMap() : TreeHashMap {
    var treeHashMap = {};
    this.visitTree({excludeKind : ['Repository', 'Internal']}, (proxy) => {
      treeHashMap [proxy._item.id] = proxy.treeHashEntry;
    });
    return treeHashMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getAncestorProxies() {
    var ancestorProxy = this.parentProxy;
    var ancestorProxyList = [];
    while (ancestorProxy){
      ancestorProxyList.push(ancestorProxy);
      ancestorProxy = ancestorProxy.parentProxy;
    }
    return ancestorProxyList;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getDepthFromAncestor(theAncestor) {
    var ancestorProxy = this.parentProxy;
    var depth = 1;

    if (this === theAncestor){
      return 0;
    }

    while (ancestorProxy){
      if (ancestorProxy === theAncestor){
        return depth;
      }
      ancestorProxy = ancestorProxy.parentProxy;
      depth++;
    }
    return -1;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  hasAncestor(theAncestor) {
    var ancestorProxy = this.parentProxy;

    if (this === theAncestor){
      return true;
    }

    while (ancestorProxy){
      if (ancestorProxy === theAncestor){
        return true;
      }
      ancestorProxy = ancestorProxy.parentProxy;
    }
    return false;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRepositoryProxy() {
    var proxy = this;

    while (proxy && proxy.kind !== 'Repository' && proxy._item.id !== 'ROOT'){
      proxy = proxy.parentProxy;
    }
    return proxy;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getChildByName(name) {
    for ( var childIdx in this.children) {
      var child = this.children[childIdx];
      if (child._item.name === name) {
        return child;
      }
    }
    return null;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getDescendants() {
    var descendantList = [];

    this.visitChildren(null, (childProxy) => {
      descendantList.push(childProxy);
    });

    return descendantList;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getDescendantCountInSameRepo() : number {
    let descendantCount: number = 0;
    this.visitTree({includeOrigin: false, excludeKind : ['Repository', 'Internal']}, (proxy) => {
      descendantCount++;
    });
    return descendantCount;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  /*
   * Flags -
   *   {
   *     includeOrigin - defaults to true
   *     excludeKind - Kind followed by boolean
   *   }
   *
   * Depth First -
   *
   * Preorder - only supply before function
   * Postorder - only supply after function
   *
   * Include Origin - Operate on the parent node
   *
   */
  visitTree(flags, doBefore, doAfter?){

    // console.log('### visitTree - begin');
    var includeOrigin = (flags && flags.hasOwnProperty('includeOrigin')) ? flags.includeOrigin : true;
    var excludeKind = (flags && flags.hasOwnProperty('excludeKind')) ? flags.excludeKind : [];
    var before = doBefore ? doBefore : () => {};
    var after = doAfter ? doAfter : () => {};

    var excludeChildKind = {};
    excludeKind.forEach((kind)=>{
      excludeChildKind[kind] = true;
      });

    function visitChild(proxy){
      if (!excludeChildKind[proxy.kind]){
        before(proxy);
        proxy.children.forEach(visitChild);
        after(proxy);
      }
    }

    // Before Origin
    if (includeOrigin){
      before(this);
    }

    this.children.forEach(visitChild);

    // After for Origin
    if (includeOrigin){
      after(this);
    }
    // console.log('### visitTree - end');
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  /*
   * Calls visit with flags.includeOrigin = false.
   *
   */
  visitChildren(flags, doBefore, doAfter?){

    var childFlags = flags || {};
    childFlags.includeOrigin = false;

    this.visitTree(childFlags, doBefore, doAfter);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  /*
   * Flags -
   *   {
   *     includeOrigin - defaults to true
   *     excludeKind - Kind followed by boolean
   *     postorder - yield value after children
   *   }
   *
   * Depth First -
   *
   * Preorder - set postorder to false (default)
   * Postorder - set postorder to true
   *
   * Include Origin - Operate on the parent node
   *
   */
  *iterateTree(flags){

    let includeOrigin = (flags && flags.hasOwnProperty('includeOrigin')) ? flags.includeOrigin : true;
    let excludeKind = (flags && flags.hasOwnProperty('excludeKind')) ? flags.excludeKind : [];
    let postorder = (flags && flags.hasOwnProperty('postorder')) ? flags.postorder : false;
    let preorder = !postorder;

    let excludeChildKind = {};

    excludeKind.forEach((kind)=>{
      excludeChildKind[kind] = true;
      });

    function* visitChild(proxy){
      if (!excludeChildKind[proxy.kind]){

        if (preorder){
          yield proxy;
        }

        for (let childIdx in proxy.children) {
          let childProxy = proxy.children[childIdx];
          yield* visitChild(childProxy);
        }

        if (postorder){
          yield proxy;
        }
      }
    }

    // Before Origin
    if (includeOrigin && preorder){
      yield this;
    }

    for (let childIdx in this.children) {
      let childProxy = this.children[childIdx];
      yield* visitChild(childProxy);
    }

    // After for Origin
    if (includeOrigin && postorder){
      yield this;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  dumpProxy(indent? : string) {
    var thisIndent = '';
    var childIndent = '|-';
    if (indent) {
      thisIndent = indent;
      childIndent = '| ' + thisIndent;
    }

    console.log('=== ' + thisIndent + this._item.id + ' - ' + this._item.name +
        ' - ' + this.kind + ' <' + this.constructor.name + '>');

    for ( var childIdx in this.children) {
      var childProxy = this.children[childIdx];
      childProxy.dumpProxy(childIndent);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  dumpProxyNameAndDescription() {
    console.log(this._item.name);
    console.log(this._item.description);

    for ( var childIdx in this.children) {
      var childProxy = this.children[childIdx];
      childProxy.dumpProxyNameAndDescription();
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getSubtreeAsList() {

    let subtreeList = [];

    var document = this;

    var addProxyToList = function(proxy){

      let listItem = {
        depth: proxy.getDepthFromAncestor(document),
        proxy: proxy
      };

      subtreeList.push(listItem);
    };

    let visitFlags = {};
    this.visitTree(visitFlags, addProxyToList);

    return subtreeList;

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRelationIdMap() : RelationIdMap {
    let relationIdMap : RelationIdMap = {
      references : undefined,
      referencedBy : undefined
    };

    for(let refTypeKey in this.relations){
      relationIdMap[refTypeKey] = {};
      for(let kindKey in this.relations[refTypeKey])
      {
        relationIdMap[refTypeKey][kindKey] = {};

        let relationsForKind = this.relations[refTypeKey][kindKey];
        for(let relationKey in relationsForKind){
          let relationList = relationsForKind[relationKey];
          if (Array.isArray(relationList)){
            relationIdMap[refTypeKey][kindKey][relationKey] = [];
            for(let index = 0; index < relationList.length; index++){
              relationIdMap[refTypeKey][kindKey][relationKey].push(relationList[index]._item.id);
            }
          } else {
            if (relationList){
              relationIdMap[refTypeKey][kindKey][relationKey] = relationList._item.id;
            } else {
              relationIdMap[refTypeKey][kindKey][relationKey] = null;
            }
          }
        }
      }
    }
    return relationIdMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  addChild(childProxy) {
    if (childProxy.parentProxy === this) {
//      console.log('::: IP: Child ' + childProxy._item.name + ' already associated with ' + this._item.name);
      return;
    }
//    console.log('::: IP: Adding child ' + childProxy._item.name + ' to ' + this._item.name);

    if (this.hasAncestor(childProxy)) {
      let oldParentId;
      if (childProxy.parentProxy){
        oldParentId = childProxy.parentProxy._item.id;
      }

      throw ({
        error: 'Parent-Can-Not-Be-Descendant',
        childId: childProxy._item.id,
        oldParentId: oldParentId,
        newParentId: this._item.id
      });
    }

    // Determine if this node is already attached to another parent
    if (childProxy.parentProxy) {
      childProxy.parentProxy.removeChild(childProxy);
    }

    // update display of lostAndFound node if this is the first child
    if (this === this.treeConfig.lostAndFound && this.treeConfig.lostAndFound.children.length === 0) {
      this.treeConfig.root.addChild(this.treeConfig.lostAndFound);
    }

    // Note:
    // * It is possible that this new child is the parent for an existing lost item that will soon be removed.
    // * Since the child has already been updated, an alphabeticaly sort may result in an incorrect sorting order.
    // * The sortChildren routine should be called instead of trying to do an alphabetical insertion.

    // Insert the new child, and then sort
    this.children.push(childProxy);
    childProxy.parentProxy = this;
    childProxy.relations.references.Item.parent = this;
    this.sortChildren();

    // update descendant count
    var deltaCount = 1 + childProxy.descendantCount;
    this.descendantCount += deltaCount;

    var ancestorProxy = this.parentProxy;
    while (ancestorProxy){
      ancestorProxy.descendantCount += deltaCount;
      ancestorProxy = ancestorProxy.parentProxy;
    }

    // Update derived children attribute
    this._item.children = this.getOrderedChildIdsAsReferences();

    // Notify about change is not loading
    if(!this.treeConfig.loading){
      this.treeConfig.changeSubject.next({
        type: 'reference-added',
        relation: 'children',
        kind: this.kind,
        id: this._item.id,
        proxy: this
      });
    }

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  removeChild(childProxy) {
    // console.log('::: IP: Removing child ' + proxy._item.name + ' from ' +
    // this._item.name);
    this.children = _.reject(this.children, function(proxy : ItemProxy) {
      return childProxy._item.id === proxy._item.id;
    });

    delete childProxy.parentProxy;
    childProxy.relations.references.Item.parent = null;

    // update descendant count
    var deltaCount = 1 + childProxy.descendantCount;
    this.descendantCount -= deltaCount;

    var ancestorProxy = this.parentProxy;
    while (ancestorProxy){
      ancestorProxy.descendantCount -= deltaCount;
      ancestorProxy = ancestorProxy.parentProxy;
    }

    // update display of lostAndFound node
    if (this === this.treeConfig.lostAndFound && this.treeConfig.lostAndFound.children.length === 0) {
      this.treeConfig.root.removeChild(this.treeConfig.lostAndFound);
    }

    if (this.kind === 'Internal-Lost' && this.children.length === 0) {
      this.deleteItem(false);
    }

    this.calculateTreeHash();

    // Update derived children attribute
    this._item.children = this.getOrderedChildIdsAsReferences();

    // Notify about change is not loading
    if(!this.treeConfig.loading){
      this.treeConfig.changeSubject.next({
        type: 'reference-removed',
        relation: 'children',
        kind: this.kind,
        id: this._item.id,
        proxy: this
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  sortChildren() {
    let orderBeforeSort = this.getOrderedChildIds();
    if (!this._item.itemIds || this._item.itemIds.length === 0){
      this.children.sort(function(a, b){
        if (a._item.name > b._item.name) { return 1; }
        if (a._item.name < b._item.name) { return -1; }
        if (a._item.name === b._item.name) {
          if (a._item.id > b._item.id) { return 1; }
          if (a._item.id < b._item.id) { return -1; }
        }
        return 0;
      });
    } else {
      // Sort by itemIds list if it is present
      var itemIds = this._item.itemIds;

      this.children.sort(function(a, b) {
        var aIndex = itemIds.indexOf(a._item.id);
        var bIndex = itemIds.indexOf(b._item.id);
        if (aIndex < 0) {
          aIndex = itemIds.length;
        }
        if (bIndex < 0) {
          bIndex = itemIds.length;
          // Detect when both items are not in the list
          if (aIndex === bIndex) {
            if (a._item.name > b._item.name){
              aIndex++;
            } else if (a._item.name < b._item.name) {
              bIndex++;
            } else {
              // Names are the same, so sort on the id
              if (a._item.id > b._item.id) { aIndex++; }
              if (a._item.id < b._item.id) { bIndex++; }
            }
          }
        }

        if (aIndex > bIndex) { return 1; }
        if (aIndex < bIndex) { return -1; }
        return 0;
      });
    }
    let orderAfterSort = this.getOrderedChildIds();
    this._item.children = this.getOrderedChildIdsAsReferences();
    if (!_.isEqual(orderBeforeSort, orderAfterSort)){
      if (!this.treeConfig.loading){
        this.treeConfig.changeSubject.next({
          type: 'reference-reordered',
          relation: 'children',
          kind: this.kind,
          id: this._item.id,
          proxy: this
        });
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  childrenAreManuallyOrdered() {
    return (this._item.itemIds && this._item.itemIds.length > 0);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  toggleChildrenAreManuallyOrdered() {
    if(this.childrenAreManuallyOrdered()) {
      this.makeChildrenAutoOrdered();
    } else {
      this.makeChildrenManualOrdered();
    }
}

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  makeChildrenManualOrdered() {
    if (!this.childrenAreManuallyOrdered()){
      // Need to make this change on the proxied item
      this.item.itemIds = this.getOrderedChildIds();
      this.sortChildren();
      this.calculateTreeHash();
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  updateChildrenManualOrder() {
    if (this.childrenAreManuallyOrdered()){
      console.log('::: Updating child order');
      this._item.itemIds = this.getOrderedChildIds();
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  makeChildrenAutoOrdered() {
    if (this.childrenAreManuallyOrdered()){
      // Need to make this change on the proxied item
      delete this.item.itemIds;
      this.sortChildren();
      this.calculateTreeHash();
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getOrderedChildIds() {
    var childIds = [];
    for (var i = 0; i < this.children.length; i++) {
      childIds.push(this.children[i]._item.id);
    }
    return childIds;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getOrderedChildIdsAsReferences() {
    var childIdRefs = [];
    for (var i = 0; i < this.children.length; i++) {
      childIdRefs.push({ id: this.children[i]._item.id});
    }
    return childIdRefs;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  updateVCStatus (itemStatus : Array<string>, withNotification : boolean = true) {

    let currentStatus = this._vcStatus.statusArray;

    if (itemStatus !== currentStatus) {
      this._vcStatus.updateStatus(itemStatus);
      if (withNotification){
        TreeConfiguration.getWorkingTree().getChangeSubject().next({
          type: 'update',
          proxy: this
        });
      }
    }

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  get vcStatus () : VersionStatus  {
    return this._vcStatus;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  updateItem(modelKind, withItem) {
//    console.log('!!! Updating ' + modelKind + ' - ' + this._item.id);

    let validationResult = ItemProxy.validateItemContent(modelKind, withItem, this.treeConfig);

    if (!validationResult.valid) {
      // Store the validationResult if there is an erro
      this.validationError = validationResult;
    } else {
      // Remove any prior validationError
      delete this.validationError;
    }

    // Determine if item kind changed
    var newKind = modelKind;

    if (newKind !== this.kind) {
      if (this.kind === 'Internal-Lost'){
        // Update is really the new item that was created due to order of arrival
        let newItem = new ItemProxy(newKind, withItem);
        return;
      }
      console.log('::: Proxy kind changed from ' + this.kind + ' to ' + newKind);
      this.setItemKind(newKind);
    }

    // Determine if itemIds array changed
    var itemIdsChanged = (withItem.itemIds !== this._item.itemIds);

    if (withItem.parentId && withItem.parentId.hasOwnProperty('id')){
      // parentId supplied as a reference object
      withItem.parentId = withItem.parentId.id;
    }

    // Copy the withItem into the current proxy
    let modifications = this.copyAttributes(withItem);
    this.clearDirtyFlags();

    // console.log('%%% Modifications');
    // console.log(modifications);

    this.calculateDerivedProperties();
    this.updateReferences();


    // Ensure sort order is maintained
    if (this.parentProxy){
      this.parentProxy.sortChildren();
    }

    if (itemIdsChanged){
      this.sortChildren();
    }


    if (this.children.length === 0){
      this._item.children = [];
    }

    // Determine if the parent changed
    var oldParentId = '';
    if (this.parentProxy) {
      oldParentId = this.parentProxy._item.id;
    }

    var newParentId = withItem.parentId || 'ROOT';

    if (newParentId === 'ROOT' && this._item.id === 'ROOT' ){
      // Prevent infinite loop when the ROOT is passed as part of sync
      newParentId = oldParentId;
    }

    if (oldParentId !== newParentId) {
      console.log('::: Parent Id changed from ' + oldParentId + ' to ' +
          newParentId);

      var newParentProxy;
      if (newParentId === '') {
        newParentProxy = this.treeConfig.root;
      } else {
        newParentProxy = this.treeConfig.proxyMap[newParentId];
      }

      if (!newParentProxy) {
        newParentProxy = ItemProxy.createMissingProxy('Item', 'id', newParentId, this.treeConfig);
      }

      newParentProxy.addChild(this);
    }

    this.calculateTreeHash();

    if (this.analysis) {
        // delete the analysis in case some of the requisite data was updated
        delete this.analysis;
    }

    if(!this.treeConfig.loading){
      this.treeConfig.changeSubject.next({
        type: 'update',
        kind: this.kind,
        id: this._item.id,
        proxy: this
      });
    }

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  notifyDirtyStatus() {
    if (!this.treeConfig.loading) {
      let clonedFields;
      if (this.dirtyFields) {
        clonedFields = JSON.parse(JSON.stringify(this.dirtyFields));
      }
      this.treeConfig.changeSubject.next({
        type: 'dirty',
        kind: this.kind,
        id: this._item.id,
        dirty: this.dirty,
        dirtyFields: clonedFields,
        proxy: this
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  deleteItem(deleteDescendants: boolean = false) {
    var byId = this._item.id;

    // console.log('::: Deleting proxy for ' + byId);

    var attemptToDeleteRestrictedNode = (
      (this._item.id === this.treeConfig.lostAndFound._item.id) ||
      (this._item.id === this.treeConfig.root._item.id));

    // Unlink from parent
    if (this.parentProxy && !attemptToDeleteRestrictedNode) {
      this.parentProxy.removeChild(this);
    }

    // Unlink from all referred items
    this.removeAllReferences();

    if (deleteDescendants){
      // Delete children depth first (after visit)
      this.visitChildren(null, null, (childProxy) => {
        childProxy.deleteItem(deleteDescendants);
      });
      if (attemptToDeleteRestrictedNode){
        // console.log('::: -> Not removing restricted node:' + this._item.name);
      } else {
        // console.log('::: -> Removing all references');
        if (!this.treeConfig.loading){
          this.treeConfig.changeSubject.next({
            type: 'delete',
            kind: this.kind,
            id: this._item.id,
            proxy: this
          });
        }
        delete this.treeConfig.proxyMap[byId];
      }
    } else {
      // Remove this item and leave any children under Lost+Found
      if (this.children.length !== 0){
        if (!attemptToDeleteRestrictedNode){
          // console.log('::: -> Node still has children');
          if (!this.treeConfig.loading) {
            this.treeConfig.changeSubject.next({
              type: 'delete',
              kind: this.kind,
              id: this._item.id,
              proxy: this
            });
          }
          ItemProxy.createMissingProxy('Item', 'id', byId, this.treeConfig);
        }
      } else {
        if (attemptToDeleteRestrictedNode){
          // console.log('::: -> Not removing ' + this._item.name);
        } else {
          // console.log('::: -> Removing all references');
          if (!this.treeConfig.loading){
            this.treeConfig.changeSubject.next({
              type: 'delete',
              kind: this.kind,
              id: this._item.id,
              proxy: this
            });
          }
          delete this.treeConfig.proxyMap[byId];
        }
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  public toString(): string {
    return this._item.name;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  public static createMissingProxy(forKind, forKey, forId, treeConfig) {
    // TODO: This function should be reverted to private after solving delete detection
    // TODO: Clients should not be directly creating missing proxies for deleted items.
    var lostProxy = new ItemProxy('Internal-Lost', {
      id : forId,
      name : 'Lost Item: ' + forKind + ' with ' + forKey + ' of ' + forId,
      description : 'Found node(s) referencing this node.',
      parentId : 'LOST+FOUND',
      loadPending: true
    }, treeConfig);
    lostProxy.internal = true;

    return lostProxy;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  private copyAttributes(fromItem) {
    let modifications = {};

    // Copy attributes proxy
    for ( var fromKey in fromItem) {
      if (fromItem.hasOwnProperty(fromKey) && (fromKey.charAt(0) !== '$') &&
          !_.isEqual(fromItem[fromKey], this._item[fromKey])) {
        // console.log('!!! Updating ' + fromKey);
        modifications[fromKey] = {
          from: this._item[fromKey],
          to: fromItem[fromKey]
        };
        this._item[fromKey] = fromItem[fromKey];
      }
    }

    let dataModel = this.model;

    // Check for unexpected values
    for ( var toKey in this._item) {
      let isDerivedAttribute = (dataModel && dataModel._item.classProperties && dataModel._item.classProperties[toKey]
        && dataModel._item.classProperties[toKey].definition.derived);
      if (!isDerivedAttribute && toKey !== '__deletedProperty' && (toKey.charAt(0) !== '$')
          && this._item.hasOwnProperty(toKey)
          && (fromItem[toKey] === null || !fromItem.hasOwnProperty(toKey)))
      {
        // console.log('!!! Deleted Property: ' + toKey + ' in ' + this._item.name);
        if (!this._item.__deletedProperty) {
          this._item.__deletedProperty = {};
        }
        modifications[toKey] = {
          from: this._item[toKey],
          to: fromItem[toKey]
        };
        this._item.__deletedProperty[toKey] = this._item[toKey];
        delete this._item[toKey];
      }
    }
    return modifications;
  }

}


