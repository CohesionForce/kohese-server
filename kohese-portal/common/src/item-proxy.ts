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
if (typeof(jsSHA_Import) === "object") {
  jsSHA = (<any>jsSHA_Import).default;
} else {
  jsSHA = jsSHA_Import;
}

// Adjust for the differences in CommonJS and ES6 for uuid
let uuidV1;
if (typeof(uuidV1_Import) === "object") {
  uuidV1 = uuidV1_Import.default;
} else {
  uuidV1 = uuidV1_Import;
}

class RelationIdMap {
  public references : {};
  public referencedBy : {};
}

//////////////////////////////////////////////////////////////////////////
// Create ItemProxy from an existing Item
//////////////////////////////////////////////////////////////////////////

export class ItemProxy {

  public static oidCalcCount = 0;
  public static theCalcCount = 0;
  // private static shaObj = new jsSHA('SHA-1', 'TEXT');

  public model;
  public state;
  public item;
  public treeConfig : TreeConfiguration;
  public kind;
  public references;
  public relations;
  public internal : boolean = false;

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
  public dirty : boolean = false;
  private _vcStatus : VersionStatus = new VersionStatus();
  public history;
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
      } else if ('KoheseView' === kind) {
        forItem.id = 'view-' + forItem.name.toLowerCase();
      } else {
        forItem.id = uuidV1();
      }

      itemId = forItem.id;
      console.log('::: Allocating new id: ' + itemId);
    } else {
      // console.log('::: Constructor called for ' + itemId);
    }

    ItemProxy.validateItemContent(kind, forItem, treeConfig);

    let proxy : ItemProxy = treeConfig.proxyMap[itemId];

    if (!proxy) {
    //  console.log('::: IP: Creating ' + forItem.id + ' - ' + forItem.name + ' - ' + kind);
      proxy = this;
      proxy.treeConfig = treeConfig;
      proxy.children = [];
      proxy.relations = {
        references: {
          Item: {
            parent: null,
            children: proxy.children
          }
        },
        referencedBy: {}
      };
      proxy.descendantCount = 0;
      proxy.treeConfig.proxyMap[itemId] = proxy;
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

    if (proxy.item &&
        (!proxy.item.loadPending) &&
        (proxy.kind !== 'Internal') &&
        (proxy.kind !== 'Internal-Lost') &&
        (proxy.kind !== 'Internal-Model')){
      // Item already exists, so update it instead
      proxy.updateItem(kind, forItem);
      return proxy;
    }

    let loadPending;
    if (proxy && proxy.item){
      loadPending = proxy.item.loadPending;
    }


    proxy.item = {};
    copyAttributes(forItem, proxy);

    proxy.setItemKind(kind);

    if (kind === 'Repository') {
      proxy.treeConfig.repoMap[itemId] = proxy;
    }

    if (kind === 'Internal') {
      // Don't continue
      return proxy;
    }

    if (proxy.item.parentId && proxy.item.parentId === '') {
      delete proxy.item.parentId;
    }

    var parentId = proxy.item.parentId || 'ROOT';

    if (parentId.hasOwnProperty('id')){
      // parentId supplied as a reference object
      parentId = parentId.id;
      forItem.parentId = parentId;
    }

    var parent = proxy.treeConfig.proxyMap[parentId];

    if (!parent) {
      // Create the parent before it is found
      parent = createMissingProxy('Item', 'id', parentId, proxy.treeConfig);
    }

    parent.addChild(proxy);

    if (loadPending && (proxy.item.parentId !== 'LOST+FOUND') && (this.kind !==
      'Internal') && (this.kind !== 'Internal-Model') && (this.kind !==
      'Internal-View-Model')) {
      // Remove load pending since the item has now been loaded
      delete proxy.item.loadPending;
      this.internal = false;
    }

    if (proxy.children){
      proxy.sortChildren();
    }

    proxy.calculateTreeHash();
    proxy.caclulateDerivedProperties();
    proxy.updateReferences();

    if(!proxy.treeConfig.loading){
      proxy.treeConfig.changeSubject.next({
        type: 'create',
        kind: proxy.kind,
        id: proxy.item.id,
        proxy: proxy
      });
    }

    return proxy;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static validateItemContent (kind, forItem, treeConfig) {
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
            console.log('*** Error: Invalid data item');
            console.log('Kind: ' + kind);
            console.log(forItem);
            console.log(validation);
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
  caclulateDerivedProperties(){
    if (this.model && this.model.item){
      if (this.model.item.stateProperties){
        let seperatorRequired = false;
        this.state = '';
        for(let statePropertyIdx in this.model.item.stateProperties){
          let stateProperty = this.model.item.stateProperties[statePropertyIdx];
          if(seperatorRequired){
            this.state += '/';
          }
          this.state += this.item[stateProperty];
          seperatorRequired = true;
        }
      }
      if (this.model.item.calculatedProperties.length){
        for (let cpIdx in this.model.item.calculatedProperties){
          // TODO Need to expand calculation with complex calculations
          let propertyName = this.model.item.calculatedProperties[cpIdx];
          let property = this.model.item.properties[propertyName];
          let calculation = property.calculated;

          // Note:  This only supports assignment calculations
          this.item[propertyName] = this.item[calculation];
        }
      }
      if (this.model.item.idProperties){
        for (let idIdx in this.model.item.idProperties){
          let idName = this.model.item.idProperties[idIdx];
          let idKind = this.model.item.classProperties[idName].definedInKind;
          this.treeConfig.addIdMap(idKind, idName, this);
        }
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
    // console.log('$$$ Updating References for: ' + this.item.id);
    let oldReferences = this.getRelationIdMap().references || {};
    if (this.model && this.model.item && this.model.item.relationProperties){
      for(let relationPropertyIdx in this.model.item.relationProperties){
        let relationProperty = this.model.item.relationProperties[relationPropertyIdx];
        let relationPropertyDefn = this.model.item.classProperties[relationProperty].definition;

        let foreignKeyDefn;
        if (typeof relationPropertyDefn.relation === 'object'){
          foreignKeyDefn = relationPropertyDefn.relation;
        }

        if (this.item){
          let relationValue = this.item[relationProperty];
          let oldRelationIds = [];
          let newRelationIds = [];
          if (oldReferences &&
              oldReferences[this.kind] &&
              oldReferences[this.kind][relationProperty])
          {
            oldRelationIds = oldReferences[this.kind][relationProperty];
          }
          if (relationValue){
            let relationList = [];
            let isSingle = true;
            if(Array.isArray(relationValue)){
              isSingle = false;

              // Check for reference style
              let updatedRelationValue = [];
              let valueUpdated = false;
              for(let idx in relationValue){
                let thisRelationValue = relationValue[idx];
                if (!foreignKeyDefn && !thisRelationValue.hasOwnProperty('id')){
                  valueUpdated = true;
                  // console.log('%%% Updating reference style for ' + relationProperty + ' from ' + thisRelationValue);
                  thisRelationValue = {id: thisRelationValue};
                  // console.log(thisRelationValue);
                }
                updatedRelationValue.push(thisRelationValue);
              }

              if(valueUpdated){
                // console.log('==================');
                // console.log(JSON.stringify(this.item, null, '  '));
                // console.log('%%% Updating reference style for ' + relationProperty);
                // console.log(JSON.stringify(relationValue, null, '  '));
                // console.log(JSON.stringify(updatedRelationValue, null, '  '));
                this.item[relationProperty] = updatedRelationValue;
                // console.log('-----------------');
                // console.log(JSON.stringify(this.item, null, '  '));
              }
              relationList = updatedRelationValue;
            } else {
              isSingle = true;

              // Check for reference style
              if(!foreignKeyDefn && !relationValue.hasOwnProperty('id')){
                // Update the property to have the correct reference style
                // console.log('==================');
                // console.log(JSON.stringify(this.item, null, '  '));
                // console.log('%%% Updating reference style for ' + relationProperty + ' from ' + relationValue);
                relationValue = {id: relationValue};
                this.item[relationProperty] = relationValue;
                // console.log(relationValue);
                // console.log('-----------------');
                // console.log(JSON.stringify(this.item, null, '  '));
              }

              relationList = [ relationValue ];
            }

            for(let relIdx in relationList){
              let refId = relationList[relIdx];
              if (refId.hasOwnProperty('id')){
                refId = refId.id;
              }

              let refProxy;
              if (foreignKeyDefn){
                refProxy = this.treeConfig.getProxyByProperty(foreignKeyDefn.kind, foreignKeyDefn.foreignKey, refId);
                if (!refProxy){
                  createMissingProxy(foreignKeyDefn.kind, foreignKeyDefn.foreignKey, refId, this.treeConfig);
                  refProxy = this.treeConfig.getProxyFor(refId);
                }
              } else {
                refProxy = this.treeConfig.getProxyFor(refId);
                if(!refProxy){
                  createMissingProxy('Item', 'id', refId, this.treeConfig);
                  refProxy = this.treeConfig.getProxyFor(refId);
                }
              }
              if (refProxy){
                newRelationIds.push(refProxy.item.id);
                this.addReference(refProxy, relationProperty, isSingle);
              }
            }

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
                let oldRefProxy = this.treeConfig.getProxyFor(oldRefId);
                if (oldRefProxy){
                  this.removeReference(oldRefProxy, relationProperty, isSingle);
                } else {
                  console.log('*** Could not find ref for ' + oldRefId);
                  console.log(oldRelationIds);
                }
              }
            }
          }
        }
      }
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
          id: toProxy.item.id,
          proxy: toProxy
        });
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  removeReference(toProxy, forProperty, isSingle){
    // Remove reference to the referencing proxy
    if (!this.relations.references[this.kind]){
      this.relations.references[this.kind] = {};
    }

    if (isSingle){
      if (this.relations.references[this.kind][forProperty] === toProxy){
        // console.log('%%% Removing reference to ' + toProxy.item.id);
        delete this.relations.references[this.kind][forProperty];
      }
    } else {
      if (!this.relations.references[this.kind][forProperty]){
        this.relations.references[this.kind][forProperty] = [];
      }

      let proxyIdx = this.relations.references[this.kind][forProperty].indexOf(toProxy);
      if (proxyIdx > -1){
        // console.log('%%% Removing reference from array for ' + toProxy.item.id);
        this.relations.references[this.kind][forProperty].splice(proxyIdx, 1);
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
      // console.log('%%% Removing reference from array for ' + toProxy.item.id);
      toProxy.relations.referencedBy[this.kind][forProperty].splice(proxyIdx, 1);
      if(!this.treeConfig.loading){
        this.treeConfig.changeSubject.next({
          type: 'reference-removed',
          relation: 'forProperty',
          kind: this.kind,
          id: toProxy.item.id,
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
          for(let index = 0; index < relationList.length; index++){
            this.removeReference(relationList[index], relationKey, false);
          }
        } else {
          if (relationList){
            this.removeReference(relationList, relationKey, true);
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
      this.treeConfig.proxyHasDeferredModelAssociation[this.item.id] = this;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  checkPropertyOrder(){
    if (this.model && this.model.item && this.model.item.propertyStorageOrder) {
      var newItem : any = {};
      var oldKeys = Object.keys(this.item);
      for (var keyIdx in this.model.item.propertyStorageOrder){
        var key = this.model.item.propertyStorageOrder[keyIdx];
        if (this.item.hasOwnProperty(key)) {
          newItem[key] = this.item[key];
        }
      }
      if (this.item.itemIds){
        newItem.itemIds = this.item.itemIds;
      }
      var newKeys = Object.keys(newItem);
      if (!_.isEqual(oldKeys, newKeys)){
        this.item = newItem;
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  validateItem(){

    return ItemProxy.validateItemContent(this.kind, this.item, this.treeConfig);

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  document() {
    this.checkPropertyOrder();
    return JSON.stringify(this.item, null, '  ');
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cloneItem() {
    this.checkPropertyOrder();
    let clone = JSON.parse(JSON.stringify(this.item));
    return clone;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cloneItemAndStripDerived() {
    let clone = this.cloneItem();

    // Determine if derived properiteis need to be stripped
    if (!this.internal && this.model && this.model.item.derivedProperties && this.model.item.derivedProperties.length) {
      let derivedProperties = this.model.item.derivedProperties;
      for(let idx in derivedProperties){
        let key = derivedProperties[idx];
        delete clone[key];
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
    if (!this.item){
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
  calculateTreeHash(deferredRollup : boolean = false) {

    // Don't calculateTreeHash during initial load
    if (!this.item || (this.treeConfig.loading && !deferredRollup)){
      this.deferTreeHash = true;
      return;
    }

    // TODO: Should only have to do this when content is updated
    this.calculateOID();

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
          treeHashEntry.childTreeHashes[childProxy.item.id] = 'Repository-Mount';
          break;
        case 'Internal':
          treeHashEntry.childTreeHashes[childProxy.item.id] = 'Internal';
          break;
        default:
          if(childProxy.deferTreeHash){
            this.deferTreeHash = true;
            return;
          }
          treeHashEntry.childTreeHashes[childProxy.item.id] = childProxy.treeHash;
      }
    }

    var shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.update(JSON.stringify(treeHashEntry));
    this.treeHash =  shaObj.getHash('HEX');
    ItemProxy.theCalcCount++;

    treeHashEntry.treeHash = this.treeHash;
    if (this.deferTreeHash){
      delete this.deferTreeHash;
    }

    // Add the parentId to the treeHash entry
    if (this.item.parentId){
      treeHashEntry.parentId = this.item.parentId;
    }

    this.treeHashEntry = treeHashEntry;

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
        while (thisIteration = iterator.next()){
          iterationCount++;
          if (thisIteration.done){
            resolve(iterationCount);
            return;
          }
          proxy = thisIteration.value;
          proxy.calculateTreeHash(deferredRollup);
          if (deferCalc && (iterationCount % yieldAtIteration === 0)) {
            setTimeout(performTreeHashCalculations, msToYield);
            return;
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
      treeHashMap [proxy.item.id] = proxy.treeHashEntry;
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

    while (proxy && proxy.kind !== 'Repository' && proxy.item.id !== 'ROOT'){
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
      if (child.item.name === name) {
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

        for ( var childIdx in proxy.children) {
          var childProxy = proxy.children[childIdx];
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

    for ( var childIdx in this.children) {
      var childProxy = this.children[childIdx];
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
  dumpProxy(indent : string = undefined) {
    var thisIndent = '';
    var childIndent = '|-';
    if (indent) {
      thisIndent = indent;
      childIndent = '| ' + thisIndent;
    }

    console.log('=== ' + thisIndent + this.item.id + ' - ' + this.item.name +
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
    console.log(this.item.name);
    console.log(this.item.description);

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
              relationIdMap[refTypeKey][kindKey][relationKey].push(relationList[index].item.id);
            }
          } else {
            if (relationList){
              relationIdMap[refTypeKey][kindKey][relationKey] = relationList.item.id;
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
//      console.log('::: IP: Child ' + childProxy.item.name + ' already associated with ' + this.item.name);
      return;
    }
//    console.log('::: IP: Adding child ' + childProxy.item.name + ' to ' + this.item.name);

    // Determine if this node is already attached to another parent
    if (childProxy.parentProxy) {
      childProxy.parentProxy.removeChild(childProxy);
    }

    // update display of lostAndFound node if this is the first child
    if (this === this.treeConfig.lostAndFound && this.treeConfig.lostAndFound.children.length === 0) {
      this.treeConfig.root.addChild(this.treeConfig.lostAndFound);
    }

    // Determine where to insert the new child
    var insertAt = this.children.length;
    if (!this.item.itemIds){
        for (var childIdx in this.children){
            if (childProxy.item.name < this.children[childIdx].item.name ||
               ((childProxy.item.name === this.children[childIdx].item.name) &&
                 (childProxy.item.id < this.children[childIdx].item.id))) {
              insertAt = childIdx;
              break;
            }
          }

          this.children.splice(insertAt, 0, childProxy);
          childProxy.parentProxy = this;
          childProxy.relations.references.Item.parent = this;
    } else {
        this.children.push(childProxy);
        childProxy.parentProxy = this;
        childProxy.relations.references.Item.parent = this;
        this.sortChildren();
    }
    // update descendant count
    var deltaCount = 1 + childProxy.descendantCount;
    this.descendantCount += deltaCount;

    var ancestorProxy = this.parentProxy;
    while (ancestorProxy){
      ancestorProxy.descendantCount += deltaCount;
      ancestorProxy = ancestorProxy.parentProxy;
    }

    if(!this.treeConfig.loading){
      this.treeConfig.changeSubject.next({
        type: 'reference-added',
        relation: 'children',
        kind: this.kind,
        id: this.item.id,
        proxy: this
      });
    }

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  removeChild(childProxy) {
    // console.log('::: IP: Removing child ' + proxy.item.name + ' from ' +
    // this.item.name);
    this.children = _.reject(this.children, function(proxy : ItemProxy) {
      return childProxy.item.id === proxy.item.id;
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

    if(!this.treeConfig.loading){
      this.treeConfig.changeSubject.next({
        type: 'reference-removed',
        relation: 'children',
        kind: this.kind,
        id: this.item.id,
        proxy: this
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  sortChildren() {
    let orderBeforeSort = this.getOrderedChildIds();
    if (!this.item.itemIds || this.item.itemIds.length === 0){
      this.children.sort(function(a, b){
        if (a.item.name > b.item.name) return 1;
        if (a.item.name < b.item.name) return -1;
        if (a.item.name === b.item.name) {
          if (a.item.id > b.item.id) return 1;
          if (a.item.id < b.item.id) return -1;
        }
        return 0;
      });
    } else {
    	// Sort by itemIds list if it is present
    	var itemIds = this.item.itemIds;

    	this.children.sort(function(a, b){
    		var aIndex = itemIds.indexOf(a.item.id);
    		var bIndex = itemIds.indexOf(b.item.id);
    		if (aIndex < 0) {
          aIndex = itemIds.length;
    		}
        if (bIndex < 0) {
          bIndex = itemIds.length;
          // Detect when both items are not in the list
          if (aIndex === bIndex) {
            if (a.item.name > b.item.name){
              aIndex++;
            } else if (a.item.name < b.item.name) {
              bIndex++;
            } else {
              // Names are the same, so sort on the id
              if (a.item.id > b.item.id) aIndex++;
              if (a.item.id < b.item.id) bIndex++;
            }
          }
        }

        if (aIndex > bIndex) return 1;
        if (aIndex < bIndex) return -1;
        return 0;
      });
    }
    let orderAfterSort = this.getOrderedChildIds();
    if (!_.isEqual(orderBeforeSort, orderAfterSort)){
      if (!this.treeConfig.loading){
        this.treeConfig.changeSubject.next({
          type: 'reference-reordered',
          relation: 'children',
          kind: this.kind,
          id: this.item.id,
          proxy: this
        });
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  childrenAreManuallyOrdered() {
    return (this.item.itemIds && this.item.itemIds.length > 0);
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
      this.item.itemIds = this.getOrderedChildIds();
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  makeChildrenAutoOrdered() {
    if (this.childrenAreManuallyOrdered()){
      this.item.itemIds = [];
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
      childIds.push(this.children[i].item.id);
    }
    return childIds;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  updateVCStatus (itemStatus : Array<string>) {

    this._vcStatus.updateStatus(itemStatus);

    TreeConfiguration.getWorkingTree().getChangeSubject().next({
      type: 'update',
      proxy: this
    });

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
//    console.log('!!! Updating ' + modelKind + ' - ' + this.item.id);

    ItemProxy.validateItemContent(modelKind, withItem, this.treeConfig);

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
    var itemIdsChanged = (withItem.itemIds !== this.item.itemIds);

    if (withItem.parentId && withItem.parentId.hasOwnProperty('id')){
      // parentId supplied as a reference object
      withItem.parentId = withItem.parentId.id;
    }

    // Copy the withItem into the current proxy
    let modifications = copyAttributes(withItem, this);
    // console.log('%%% Modifications');
    // console.log(modifications);

    this.caclulateDerivedProperties();
    this.updateReferences();


    // Ensure sort order is maintained
    if(this.parentProxy){
      this.parentProxy.sortChildren();
    }
    if(itemIdsChanged){
      this.sortChildren();
    }

    // Determine if the parent changed
    var oldParentId = '';
    if (this.parentProxy) {
      oldParentId = this.parentProxy.item.id;
    }

    var newParentId = withItem.parentId || 'ROOT';

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
        newParentProxy = createMissingProxy('Item', 'id', newParentId, this.treeConfig);
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
        id: this.item.id,
        proxy: this
      });
    }

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  deleteItem(deleteDescendants: boolean) {
    var byId = this.item.id;

    // console.log('::: Deleting proxy for ' + byId);

    var attemptToDeleteRestrictedNode = (
      (this.item.id === this.treeConfig.lostAndFound.item.id) ||
      (this.item.id === this.treeConfig.root.item.id));

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
        // console.log('::: -> Not removing restricted node:' + this.item.name);
      } else {
        // console.log('::: -> Removing all references');
        if (!this.treeConfig.loading){
          this.treeConfig.changeSubject.next({
            type: 'delete',
            kind: this.kind,
            id: this.item.id,
            proxy: this,
            recursive: deleteDescendants
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
              id: this.item.id,
              proxy: this,
              recursive: deleteDescendants
            });
          }
          createMissingProxy('Item', 'id', byId, this.treeConfig);
        }
      } else {
        if (attemptToDeleteRestrictedNode){
          // console.log('::: -> Not removing ' + this.item.name);
        } else {
          // console.log('::: -> Removing all references');
          if (!this.treeConfig.loading){
            this.treeConfig.changeSubject.next({
              type: 'delete',
              kind: this.kind,
              id: this.item.id,
              proxy: this,
              recursive: deleteDescendants
            });
          }
          delete this.treeConfig.proxyMap[byId];
        }
      }
    }
  }

  public toString(): string {
    return this.item.name;
  }
}





//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function createMissingProxy(forKind, forKey, forId, treeConfig) {
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
function copyAttributes(fromItem, toProxy) {
  let modifications = {};

  // Copy attributes proxy
  for ( var fromKey in fromItem) {
    if (fromItem.hasOwnProperty(fromKey) && (fromKey.charAt(0) !== '$') &&
        !_.isEqual(fromItem[fromKey], toProxy.item[fromKey])) {
      // console.log('!!! Updating ' + fromKey);
      modifications[fromKey] = {
        from: toProxy.item[fromKey],
        to: fromItem[fromKey]
      };
      toProxy.item[fromKey] = fromItem[fromKey];
    }
  }

  // Check for unexpected values
  for ( var toKey in toProxy.item) {
    if (toKey !== '__deletedProperty' && toProxy.item.hasOwnProperty(toKey) &&
        (toKey.charAt(0) !== '$') && (fromItem[toKey] === null || !fromItem.hasOwnProperty(toKey))) {
      // console.log('!!! Deleted Property: ' + toKey + ' in ' + toProxy.item.name);
      if (!toProxy.item.__deletedProperty) {
        toProxy.item.__deletedProperty = {};
      }
      modifications[toKey] = {
        from: toProxy.item[toKey],
        to: fromItem[toKey]
      };
      toProxy.item.__deletedProperty[toKey] = toProxy.item[toKey];
      delete toProxy.item[toKey];
    }
  }
  return modifications;
}
