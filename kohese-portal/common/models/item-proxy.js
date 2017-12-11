/**
 * 
 */

'use strict'; //Required for use of 'class'
var _ = require('underscore');
var SHA = require('jssha');
var uuidV1 = require('uuid/v1');

var tree = {};
tree.proxyMap = {};
tree.repoMap = {};
tree.modelMap = {
    'Internal': {},
    'Internal-Lost': {},
    'Internal-Model': {},
    'Internal-State': {}
};
tree.loading = true;

//////////////////////////////////////////////////////////////////////////
// Create ItemProxy from an existing Item
//////////////////////////////////////////////////////////////////////////

class ItemProxy {

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor(kind, forItem) {
    var itemId = forItem.id;
    
    if (!itemId){
      itemId = forItem.id = uuidV1();
      console.log('::: Allocating new id: ' + itemId);
    }
    
    var validation = ItemProxy.validateItemContent(kind, forItem);
    
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
    
    var proxy = tree.proxyMap[itemId];
    if (!proxy) {
//      console.log('::: IP: Creating ' + forItem.id + ' - ' + forItem.name + ' - ' + kind);
      proxy = this;
      proxy.children = [];
      proxy.descendantCount = 0;
      tree.proxyMap[itemId] = proxy;
    }

    if (proxy.item && 
        (proxy.kind !== 'Internal') && 
        (proxy.kind !== 'Internal-Lost') && 
        (proxy.kind !== 'Internal-Model')){
      // Item already exists, so update it instead
      proxy.updateItem(kind, forItem);
      return proxy;
    }
    
    proxy.kind = kind;
    proxy.item = forItem;
    
    if(!tree.modelMap[kind]){
      tree.modelMap[kind] = createMissingProxy(kind);
    }
    proxy.model = tree.modelMap[kind];

    if (kind === 'Repository') {
      tree.repoMap[itemId] = proxy;
    }
    
    if (kind === 'Internal-Model') {
      tree.modelMap[itemId] = proxy;
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
    
    if (proxy.children){
      proxy.sortChildren();
    }

    proxy.calculateTreeHash();

    return proxy;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static resetItemRepository() {
    
    console.log('::: Resetting Item Repository');
    var rootProxy = ItemProxy.getRootProxy();

    tree.loading = true;

    rootProxy.visitChildren(null, null, (childProxy) => {
      childProxy.deleteItem();
    });
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
  static loadingComplete() {
    tree.loading = false;
    ItemProxy.calculateAllTreeHashes();
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
  checkPropertyOrder(){
    if (this.model && this.model.item && this.model.item.orderedProperties) {
      var newItem = {};
      var oldKeys = Object.keys(this.item);
      for (var keyIdx in this.model.item.orderedProperties){
        var key = this.model.item.orderedProperties[keyIdx];
        if (this.item[key]){
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
  static validateItemContent(kind, itemContent){
    
    var model = tree.modelMap[kind];
    
    var validationResult = {
      valid: true,
      missingProperties: []
    };
    
    if (model && model.item && model.item.requiredProperties) {
      model.item.requiredProperties.forEach((property) => {
        if (!itemContent.hasOwnProperty(property)) {
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
  document() {
    this.checkPropertyOrder();
    return JSON.stringify(this.item, null, '  ');
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
    shaObj.update('blob ' + forText.length + '\0' + forText);
    
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
    var doc = this.document();
    shaObj.update('blob ' + doc.length + '\0' + doc);
    
    this.oid = shaObj.getHash('HEX');
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  calculateTreeHash(deferred) {

    // TODO: Should only have to do this when content is updated
    this.calculateOID();

    // Don't calculateTreeHash during initial load
    if (!this.item || tree.loading){
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
      if(childProxy.kind === 'Repository'){
        treeHashEntry.childTreeHashes[childProxy.item.id] = 'Repository-Mount';
      } else {
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
    if (!deferred){
      if (this.parentProxy){
        this.parentProxy.calculateTreeHash();
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static calculateAllTreeHashes() {
    const deferred = true;
    tree.root.visitTree(null, null, (proxy) => {
      proxy.calculateTreeHash(deferred);
    });
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static compareTreeHashMap(fromTHMap, toTHMap){
    
    var fromIds = Object.keys(fromTHMap).sort();
    var toIds = Object.keys(toTHMap).sort();
    var allIds = _.union(fromIds, toIds);
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
          var allChildIds = _.union(fromChildIdsSorted, toChildIdsSorted);
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
    this.visitTree({excludeKind : ['Repository']}, (proxy) => {
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
      repoTreeHashes[repoIdx] = repoProxy.getTreeHashMap();
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
        ' - ' + this.kind);

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
            if (childProxy.item.name < this.children[childIdx].item.name){
              insertAt = childIdx;
              break;
            }
          }

          this.children.splice(insertAt, 0, childProxy);
          childProxy.parentProxy = this;    	
    } else {
        this.children.push(childProxy);
        childProxy.parentProxy = this;
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
    console.log('!!! Updating ' + modelKind + ' - ' + this.item.id);
    
    var validation = ItemProxy.validateItemContent(modelKind, withItem);
    
    if (!validation.valid){
      // TODO Need to remove this bypass logic which is needed to load some existing data
      if(tree.loading){
        console.log('*** Error: Invalid data item');
        console.log('Kind: ' + modelKind);
        console.log(withItem);
        console.log(validation);        
      } else {
        throw ({
          error: 'Not-Valid',
          validation: validation
        });
      }
    }

    // Determine if item kind changed
    var newKind = modelKind;

    if (newKind !== this.kind) {
      console.log('::: Proxy kind changed from ' + this.kind + ' to ' + newKind);
      this.kind = newKind;
    }

    // Determine if itemIds array changed
    var itemIdsChanged = (withItem.itemIds !== this.item.itemIds);

    // Copy the withItem into the current proxy
    copyAttributes(withItem, this.item);

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
        delete tree.proxyMap[byId];
      }
    } else {
      // Remove this item and leave any children under Lost+Found
      if (this.children.length !== 0) {
        if (!attemptToDeleteRestrictedNode){
//          console.log('::: -> Node still has children');
          createMissingProxy(byId);          
        }
      } else {
        if (attemptToDeleteRestrictedNode){
//          console.log('::: -> Not removing ' + this.item.name);                  
        } else {
//          console.log('::: -> Removing all references');
          delete tree.proxyMap[byId];
        }
      }      
    }

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static getModelDefinitions(){
    var rootModelProxy = ItemProxy.getProxyFor('Model-Definitions');
    return rootModelProxy.modelDefMap;
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static loadModelDefinitions(modelDefMap) {
    var rootModelDef = {
        id: 'Model-Definitions',
        name: 'Model Definitions'
    };
    var rootModelProxy = new ItemProxy('Internal-Model', rootModelDef);
    rootModelProxy.modelDefMap = modelDefMap;
    
    for(var modelKey in modelDefMap){
      var model = modelDefMap[modelKey];
      model.id = modelKey;
      if (model.base === 'PersistedModel'){
        delete model.base;
      }
      if (model.base){
        model.parentId = model.base;
      } else {
        model.parentId = rootModelDef.id;
      }
      var proxy = new ItemProxy('Internal-Model', model);
      tree.modelMap[modelKey] = proxy;
    }
    
    // Create the key ordering for descendant models
    var models = rootModelProxy.getDescendants();
        
    for(var index in models){
      var modelProxy = models[index];
//      console.log('::: Loading Model ' + model.item.name);
      // TODO this might eventually need to be moved to proxy
      var properties = modelProxy.parentProxy.item.orderedProperties || [];
      modelProxy.item.orderedProperties = Object.keys(modelProxy.item.properties).concat(properties);
      
      modelProxy.item.requiredProperties = _.clone(modelProxy.parentProxy.item.requiredProperties) || [];

      for (var property in modelProxy.item.properties){
        var propertySettings = modelProxy.item.properties[property];
        if (propertySettings.required){
          modelProxy.item.requiredProperties.push(property);
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


//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function createMissingProxy(forId) {
  var lostProxy = new ItemProxy('Internal-Lost', {
    id : forId,
    name : 'Lost Item: ' + forId,
    description : 'Found children nodes referencing this node as a parent.',
    parentId : 'LOST+FOUND'
  });

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
      console.log('!!! Deleted Property: ' + toKey);
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
