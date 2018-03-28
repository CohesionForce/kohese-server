/**
 *
 */

'use strict'; //Required for use of 'class'
var _ = require('underscore');
var SHA = require('jssha');
var uuidV1 = require('uuid/v1');

var Rx = require('rxjs/Rx');


var tree = {};
tree.proxyMap = {};
tree.repoMap = {};
tree.loading = true;
tree.KoheseModel = null;
tree.proxyHasDeferredModelAssociation = {};

tree.changeSubject = new Rx.Subject();

//////////////////////////////////////////////////////////////////////////
// Create ItemProxy from an existing Item
//////////////////////////////////////////////////////////////////////////

class ItemProxy {

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(kind, withItem) {
    var forItem = JSON.parse(JSON.stringify(withItem));
    var itemId = forItem.id;

    if (!itemId){
      itemId = forItem.id = uuidV1();
      console.log('::: Allocating new id: ' + itemId);
    }

    ItemProxy.validateItemContent(kind, forItem);

    let proxy = tree.proxyMap[itemId];

    if (!proxy) {
//      console.log('::: IP: Creating ' + forItem.id + ' - ' + forItem.name + ' - ' + kind);
      proxy = this;
      proxy.children = [];
      proxy.relations = {
        Item: {
          parent: null,
          children: proxy.children
        }
      };
      proxy.descendantCount = 0;
      tree.proxyMap[itemId] = proxy;
    }

    switch (kind){
      case 'Internal':
      case 'Internal-Lost':
      case 'Internal-Model':
      case 'Internal-View-Model':
      case 'Internal-State':
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

    proxy.item = forItem;
    proxy.setItemKind(kind);

    if (kind === 'Repository') {
      tree.repoMap[itemId] = proxy;
    }

    if (kind === 'Internal') {
      // Don't continue
      return proxy;
    }

    if (proxy.item.parentId && proxy.item.parentId === '') {
      delete proxy.item.parentId;
    }

    var parentId = proxy.item.parentId || 'ROOT';

    var parent = tree.proxyMap[parentId];

    if (!parent) {
      // Create the parent before it is found
      parent = createMissingProxy(parentId);
    }

    parent.addChild(proxy);

    if (loadPending && (proxy.item.parentId !== 'LOST+FOUND')){
      // Remove load pending since the item has now been loaded
      delete proxy.item.loadPending;
      delete proxy.internal;
    }

    if (proxy.children){
      proxy.sortChildren();
    }

    proxy.calculateTreeHash();
    proxy.caclulateDerivedProperties();

    if(!tree.loading){
      tree.changeSubject.next({
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
  static registerKoheseModelClass(KoheseModel) {
    tree.KoheseModel = KoheseModel;

    for (let id in tree.proxyHasDeferredModelAssociation){
      let proxy = tree.proxyHasDeferredModelAssociation[id];
      proxy.setItemKind(proxy.kind);
      proxy.caclulateDerivedProperties();
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  caclulateDerivedProperties(){
    if (this.model && this.model.item && this.model.item.stateProperties){
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
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static resetItemRepository() {

    console.log('::: Resetting Item Repository');
    let rootProxy = ItemProxy.getRootProxy();

    tree.loading = true;

    tree.changeSubject.next({
      type: 'loading'
    });

    rootProxy.visitChildren(null, null, (childProxy) => {
      childProxy.deleteItem();
    });

    // Re-insert rootModelProxy
    // eslint-disable-next-line no-unused-vars
    let rootModelProxy = new ItemProxy(tree.rootModelProxy.kind, tree.rootModelProxy.item);
    // eslint-disable-next-line no-unused-vars
    let rootViewModelProxy = new ItemProxy(tree.rootViewModelProxy.kind, tree.rootViewModelProxy.item);


    if (tree.KoheseModel){
      tree.KoheseModel.removeLoadedModels();
    }

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getRootProxy() {
    // console.log('::: IP: Getting Root Proxy');
    return tree.root;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getChangeSubject() {
    return tree.changeSubject;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static loadingComplete() {
    tree.loading = false;
    ItemProxy.calculateAllTreeHashes();
    tree.changeSubject.next({
      type: 'loaded'
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getAllItemProxies() {
    var itemProxyList = [];
    for ( var key in tree.proxyMap) {
      itemProxyList.push(tree.proxyMap[key]);
    }
    return itemProxyList;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getProxyFor(id) {

    // console.log('::: IP: Getting proxy for ' + id);
	if(id === '') {
		return tree.root;
	}
    return tree.proxyMap[id];

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  setItemKind(kind){
    this.kind = kind;

    if (tree.KoheseModel){
      this.model = tree.KoheseModel.getModelProxyFor(kind);
      if (this.internal && !this.model.internal) {
        // Item was previously created in lost and found
        delete this.internal;
      }
    } else {
      tree.proxyHasDeferredModelAssociation[this.item.id] = this;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  checkPropertyOrder(){
    if (this.model && this.model.item && this.model.item.propertyStorageOrder) {
      var newItem = {};
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

    return ItemProxy.validateItemContent(this.kind, this.item);

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static validateItemContent (kind, forItem) {
    let validation = {
      valid : true
    };

    if (tree.KoheseModel) {
      let modelProxy = tree.KoheseModel.getModelProxyFor(kind);
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
          if(tree.loading){
            console.log('*** Error: Invalid data item');
            console.log('Kind: ' + kind);
            console.log(forItem);
            console.log(validation);
          } else {
            throw ({
              error: 'Not-Valid',
              validation: validation
            });

          }
        }
      }
    }
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
  static gitDocumentOID(forDoc) {
    var shaObj = new SHA('SHA-1', 'TEXT');

    var forText = JSON.stringify(forDoc, null, '  ');

    var length = forText.length;
//    console.log(forText);
//    console.log('\n');
    shaObj.update('blob ' + length + '\0' + forText);

    var oid = shaObj.getHash('HEX');

//    for(var l = length - 5; l < length +5; l++){
//      shaObj.update('blob ' + l + '\0' + forText);
//      var newOid = shaObj.getHash('HEX');
//      console.log('>>> ' + l + ' - ' + newOid);
//    }

    return oid;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static gitFileOID(forFile) {
    var shaObj = new SHA('SHA-1', 'TEXT');


    var length = forFile.length;
//    console.log(forText);
//    console.log('\n');
    shaObj.update('blob ' + length + '\0' + forFile);

    var oid = shaObj.getHash('HEX');

//    for(var l = length - 5; l < length +5; l++){
//      shaObj.update('blob ' + l + '\0' + forText);
//      var newOid = shaObj.getHash('HEX');
//      console.log('>>> ' + l + ' - ' + newOid);
//    }

    return oid;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  calculateOID() {
    // Skip placeholder nodes that haven't been loaded yet
    if (!this.item){
      return;
    }

    var shaObj = new SHA('SHA-1', 'TEXT');
    var doc = this.strippedDocument();
    shaObj.update('blob ' + doc.length + '\0' + doc);

    this.oid = shaObj.getHash('HEX');
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  calculateTreeHash(deferredRollup) {

    // TODO: Should only have to do this when content is updated
    this.calculateOID();

    // Don't calculateTreeHash during initial load
    if (!this.item || (tree.loading && !deferredRollup)){
      this.deferTreeHash = true;
      return;
    }

    var treeHashEntry = {
        kind: this.kind,
        oid: this.oid,
        childTreeHashes: {}
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

    var shaObj = new SHA('SHA-1', 'TEXT');
    shaObj.update(JSON.stringify(treeHashEntry));
    this.treeHash =  shaObj.getHash('HEX');

    treeHashEntry.treeHash = this.treeHash;
    if(this.deferTreeHash){
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
  calculateRepoTreeHashes() {
    const deferredRollup = true;
    this.visitTree({excludeKind : ['Repository', 'Internal']}, null, (proxy) => {
      proxy.calculateTreeHash(deferredRollup);
    });
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static calculateAllTreeHashes() {
    for (let repoId in tree.repoMap){
      let repoProxy = tree.repoMap[repoId];
      repoProxy.calculateRepoTreeHashes();
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static compareTreeHashMap(fromTHMap, toTHMap){

    var fromIds = Object.keys(fromTHMap).sort();
    var toIds = Object.keys(toTHMap).sort();
    // var allIds = _.union(fromIds, toIds);
    var commonIds = _.intersection(fromIds, toIds);

    if(!fromTHMap){
      console.log('*** From is undefined');
    }

    var thmCompare = {
      match: _.isEqual(fromTHMap, toTHMap),
      addedItems: _.difference(toIds, fromIds),
      changedItems: [],
      deletedItems: _.difference(fromIds, toIds),
      childMismatch: {}
  };

    commonIds.forEach((key) => {
      var fromNode = fromTHMap[key];
      var toNode = toTHMap[key];

      if (!_.isEqual(fromNode.treeHash, toNode.treeHash)) {

        if (fromNode.oid !== toNode.oid){
          thmCompare.changedItems.push(key);
        } else {
          // Found structural difference at child level
          var fromChildren = fromNode.childTreeHashes;
          var toChildren = toNode.childTreeHashes;
          var fromChildIds = Object.keys(fromChildren);
          var toChildIds = Object.keys(toChildren);
          var fromChildIdsSorted = Object.keys(fromChildren).sort();
          var toChildIdsSorted = Object.keys(toChildren).sort();
          // var allChildIds = _.union(fromChildIdsSorted, toChildIdsSorted);
          var commonChildIds = _.intersection(fromChildIdsSorted, toChildIdsSorted);

          var childMismatch = {};
          childMismatch.addedChildren = _.difference(toChildIdsSorted, fromChildIdsSorted);
          childMismatch.deletedChildren = _.difference(fromChildIdsSorted, toChildIdsSorted);


          // Check for different tree hashes
          var changedChildren = {};
          commonChildIds.forEach((childId) => {
            var fromOID = fromChildren[childId];
            var toOID = toChildren[childId];

            if (fromOID !== toOID){
              changedChildren[childId] ={
                  from: fromOID,
                  to: toOID
              };
       }
          });
          childMismatch.changedChildren = changedChildren;

          // Check for different order
          var reorderedChildren = {};
          for (var idx = 0; idx < fromChildIds.length; idx++){
            if(fromChildIds[idx] !== toChildIds[idx]){
              reorderedChildren[idx] = {
                  from: fromChildIds[idx],
                  to: toChildIds[idx]
              };
            }
          }
          childMismatch.reorderedChildren = reorderedChildren;

          thmCompare.childMismatch[key] = childMismatch;
        }
      }

    });

    return thmCompare;

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getAllTreeHashes() {
    var proxyTreeHashes = {};
    tree.root.visitTree(null,(proxy) => {
      proxyTreeHashes[proxy.item.id] = proxy.treeHashEntry;
    });

    return proxyTreeHashes;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getTreeHashMap() {
    var treeHashMap = {};
    this.visitTree({excludeKind : ['Repository', 'Internal']}, (proxy) => {
      treeHashMap [proxy.item.id] = proxy.treeHashEntry;
    });
    return treeHashMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getRepoTreeHashes() {
    var repoTreeHashes = {};

    for(var repoIdx in tree.repoMap){
      var repoProxy = tree.repoMap[repoIdx];
      repoTreeHashes[repoIdx] = repoProxy.treeHashEntry;
    }
    return repoTreeHashes;
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
    return depth;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getRepositories(){
    var repoList = [];
    for(var id in tree.proxyMap){
      var proxy = tree.proxyMap[id];
      if (proxy.kind === 'Repository'){
        repoList.push(proxy);
      }
    }
    return repoList;
  }

//  static getRepositories2(){
//    var repoList = [tree.rootProxy];
//    tree.rootProxy.visit(null, );
//  }
//
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
   * Depth First - only supply before function
   *
   * Breadth First - Visits Top Nodes First
   *
   * Include Origin - Operate on the parent node
   *
   */
  visitTree(flags, doBefore, doAfter){

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
  visitChildren(flags, doBefore, doAfter){

    var childFlags = flags || {};
    childFlags.includeOrigin = false;

    this.visitTree(childFlags, doBefore, doAfter);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  visitDescendants(performAction) {
    // Visit Breadth First
    var proxyStack = [];

    proxyStack.push(this);

    var descendant = proxyStack.pop();
    while (descendant) {
      performAction(descendant);
      for (var childIdx = descendant.children.length - 1; childIdx > -1; childIdx--) {
        proxyStack.push(descendant.children[childIdx]);
      }
      descendant = proxyStack.pop();
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static dumpAllProxies() {
    for ( var proxyId in tree.proxyMap) {
      var proxy = tree.proxyMap[proxyId];
      console.log('::: Dumping ' + proxy.item.id + ' - ' + proxy.item.name +
          ' - ' + proxy.kind);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  dumpProxy(indent) {
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
  getDocument(showUndefined) {

    var outputBuffer = '';
    var document = this;

    var displayItem = function(proxy){

      var depth = proxy.getDepthFromAncestor(document);
      var hdr = '';

      for(var idx = 0; idx < depth; idx++){
        hdr += '#';
      }

      if (depth === 0){
        // Top Node
        if (proxy.item.description || showUndefined) {
          outputBuffer += '**' + proxy.item.name + '**  \n' + proxy.item.description + '\n\n';
        } else {
          outputBuffer += '**' + proxy.item.name + '**\n\n';
        }
      } else {
        //Child Node
        if (proxy.item.description || showUndefined) {
          outputBuffer += hdr + ' ' + proxy.item.name + '\n' + proxy.item.description + '\n\n';
        } else {
          outputBuffer += hdr + ' ' + proxy.item.name + '\n\n';
        }
      }

    };

    this.visitDescendants(displayItem);

    return outputBuffer;

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
  getRelationIdMap(){
    console.log(this.relations);
    let relationIdMap = {};
    for(let kindKey in this.relations)
    {
      relationIdMap[kindKey] = {};

      let relationsForKind = this.relations[kindKey];
      for(let relationKey in relationsForKind){
        let relationList = relationsForKind[relationKey];
        if (Array.isArray(relationList)){
          relationIdMap[kindKey][relationKey] = [];
          for(let index = 0; index < relationList.length; index++){
            relationIdMap[kindKey][relationKey].push(relationList[index].item.id);
          }
        } else {
          if (relationList){
            relationIdMap[kindKey][relationKey] = relationList.item.id;
          } else {
            relationIdMap[kindKey][relationKey] = null;
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
          childProxy.relations.Item.parent = this;
    } else {
        this.children.push(childProxy);
        childProxy.parentProxy = this;
        childProxy.relations.Item.parent = this;
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

    // update display of lostAndFound node
    if (this === tree.lostAndFound && tree.lostAndFound.children.length === 1) {
      tree.root.addChild(tree.lostAndFound);
    }

    if(!tree.loading){
      tree.changeSubject.next({
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
    this.children = _.reject(this.children, function(proxy) {
      return childProxy.item.id === proxy.item.id;
    });

    delete childProxy.parentProxy;
    childProxy.relations.Item.parent = null;

    // update descendant count
    var deltaCount = 1 + childProxy.descendantCount;
    this.descendantCount -= deltaCount;

    var ancestorProxy = this.parentProxy;
    while (ancestorProxy){
      ancestorProxy.descendantCount -= deltaCount;
      ancestorProxy = ancestorProxy.parentProxy;
    }

    // update display of lostAndFound node
    if (this === tree.lostAndFound && tree.lostAndFound.children.length === 0) {
      tree.root.removeChild(tree.lostAndFound);
    }

    if (this.kind === 'Internal-Lost' && this.children.length === 0) {
      this.deleteItem();
    }

    this.calculateTreeHash();

    if(!tree.loading){
      tree.changeSubject.next({
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
            }
          }
        }

        if (aIndex > bIndex) return 1;
        if (aIndex < bIndex) return -1;
        return 0;
      });

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
  updateItem(modelKind, withItem) {
//    console.log('!!! Updating ' + modelKind + ' - ' + this.item.id);

    ItemProxy.validateItemContent(modelKind, withItem);

    // Determine if item kind changed
    var newKind = modelKind;

    if (newKind !== this.kind) {
      console.log('::: Proxy kind changed from ' + this.kind + ' to ' + newKind);
      this.setItemKind(newKind);
    }

    // Determine if itemIds array changed
    var itemIdsChanged = (withItem.itemIds !== this.item.itemIds);

    // Copy the withItem into the current proxy
    copyAttributes(withItem, this.item);
    this.caclulateDerivedProperties();


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
        newParentProxy = tree.root;
      } else {
        newParentProxy = tree.proxyMap[newParentId];
      }

      if (!newParentProxy) {
        newParentProxy = createMissingProxy(newParentId);
      }

      newParentProxy.addChild(this);
    }

    this.calculateTreeHash();

    if (this.analysis) {
        // delete the analysis in case some of the requisite data was updated
        delete this.analysis;
    }

    if(!tree.loading){
      tree.changeSubject.next({
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
  deleteItem(deleteDescendants) {
    var byId = this.item.id;

//    console.log('::: Deleting proxy for ' + byId);

    var attemptToDeleteRestrictedNode = (
        (this.item.id === tree.lostAndFound.item.id) ||
        (this.item.id === tree.root.item.id));

    // Unlink from parent
    if (this.parentProxy && !attemptToDeleteRestrictedNode) {
      this.parentProxy.removeChild(this);
    }

    if (deleteDescendants){
      // Delete children depth first (after visit)
      this.visitChildren(null, null, (childProxy) => {
        childProxy.deleteItem(deleteDescendants);
      });
      if (attemptToDeleteRestrictedNode){
//        console.log('::: -> Not removing ' + this.item.name);
      } else {
//        console.log('::: -> Removing all references');
        if(!tree.loading){
          tree.changeSubject.next({
            type: 'delete',
            kind: this.kind,
            id: this.item.id,
            proxy: this
          });
        }
        delete tree.proxyMap[byId];
      }
    } else {
      // Remove this item and leave any children under Lost+Found
      if (this.children.length !== 0) {
        if (!attemptToDeleteRestrictedNode){
//          console.log('::: -> Node still has children');
          if(!tree.loading){
            tree.changeSubject.next({
              type: 'delete',
              kind: this.kind,
              id: this.item.id,
              proxy: this
            });
          }
          createMissingProxy(byId);
        }
      } else {
        if (attemptToDeleteRestrictedNode){
//          console.log('::: -> Not removing ' + this.item.name);
        } else {
//          console.log('::: -> Removing all references');
          if(!tree.loading){
            tree.changeSubject.next({
              type: 'delete',
              kind: this.kind,
              id: this.item.id,
              proxy: this
            });
          }
          delete tree.proxyMap[byId];
        }
      }
    }

  }


}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
tree.root = new ItemProxy('Internal', {
  id: 'ROOT',
  name : 'Root of Knowledge Tree'
});
tree.repoMap['ROOT'] = tree.root;

tree.lostAndFound = new ItemProxy('Internal', {
  id : 'LOST+FOUND',
  name : 'Lost-And-Found',
  description : 'Collection of node(s) that are no longer connected.'
});
tree.repoMap['LOST+FOUND'] = tree.lostAndFound;

tree.rootModelProxy = new ItemProxy('Internal-Model', {
  id: 'Model-Definitions',
  name: 'Model Definitions'
});

tree.rootViewModelProxy = new ItemProxy('Internal-View-Model', {
  id: 'View-Model-Definitions',
  name: 'View Model Definitions'
});


//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function createMissingProxy(forId) {
  var lostProxy = new ItemProxy('Internal-Lost', {
    id : forId,
    name : 'Lost Item: ' + forId,
    description : 'Found node(s) referencing this node.',
    parentId : 'LOST+FOUND',
    loadPending: true
  });
  lostProxy.internal = true;

  return lostProxy;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function copyAttributes(fromItem, toItem) {

  // Copy attributes proxy
  for ( var fromKey in fromItem) {
    if (fromItem.hasOwnProperty(fromKey) && (fromKey.charAt(0) !== '$') &&
        !_.isEqual(fromItem[fromKey], toItem[fromKey])) {
      console.log('!!! Updating ' + fromKey);
      toItem[fromKey] = fromItem[fromKey];
    }
  }

  // Check for unexpected values
  for ( var toKey in toItem) {
    if (toKey !== '__deletedProperty' && toItem.hasOwnProperty(toKey) &&
        (toKey.charAt(0) !== '$') && !fromItem.hasOwnProperty(toKey)) {
      console.log('!!! Deleted Property: ' + toKey + ' in ' + toItem.name);
      if (!toItem.__deletedProperty) {
        toItem.__deletedProperty = {};
      }
      toItem.__deletedProperty[toKey] = toItem[toKey];
      delete toItem[toKey];
    }
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
module.exports = ItemProxy;
