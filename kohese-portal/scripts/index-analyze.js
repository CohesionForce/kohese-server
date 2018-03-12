var fs=require('fs');
var _=require('underscore');

var ItemProxy=require('../common/src/item-proxy.js');

var kdbFS = require('../server/kdb-fs.js');

var kdbCache = require('../server/kdb-cache.js');
 
var cacheDetails = {
    commit: {},
    itemData: {},
    object: {}
};

var rewriteEverything = true;

//////////////////////////////////////////////////////////////////////////

function processCommit(commitId, commitData) {
  
  var commitFilename = commitData.time + '_' + commitId + '.json';
  
  var newCommitData = {
      meta: _.clone(commitData),
      tree: {}
  };
  
  newCommitData.tree = kdbCache.cachedTree(commitData.treeId);
  
  if (rewriteEverything){
    kdbFS.storeJSONDoc('kdb/cache/kdb-object/commit/' + commitFilename, newCommitData);    
  }
    
//  cacheDetails.commit[commitId] = newCommitData;
//
//  var idList = Object.keys(tmpCommit.objects).sort();
//
//  idList.forEach((itemId) => {
//    var itemData = tmpCommit.objects[itemId];
//    var kind = itemData.kind;
//    var oid = itemData.oid;
//
////    console.log(itemId + ':' + item.kind + ':' + item.oid);
//    var itemCache = cacheDetails.itemData[itemId];
//    
//    if (!itemCache){
//      itemCache = cacheDetails.itemData[itemId] = {};
//    }
//    itemCache[commitId] = itemData;
//    
//    var objectCache = cacheDetails.object[oid];
//    if (objectCache){
//      objectCache.refCount++;
//    } else {
//      objectCache = {
//        refCount: 1
//      };
//      cacheDetails.object[oid] = objectCache;
//    }
//
//  });
}


//////////////////////////////////////////////////////////////////////////

kdbFS.createDirIfMissing('kdb/cache');
kdbFS.createDirIfMissing('kdb/cache/kdb-object');
kdbFS.createDirIfMissing('kdb/cache/kdb-object/itemData');
kdbFS.createDirIfMissing('kdb/cache/kdb-object/commit');
kdbFS.createDirIfMissing('kdb/cache/kdb-object/commit-deltas');
kdbFS.createDirIfMissing('kdb/cache/kdb-object/object');

kdbCache.loadCachedObjects();

var commitList = kdbCache.getCommits();

console.log('::: Processing Commit History');
for (var commitId in commitList) {
  var commitData = commitList[commitId];
  console.log('::: Processing commit ' + commitId);
  console.log(commitData);
  processCommit(commitId, commitData);
}

//console.log('::: Writing Cache Details');
//
////Write Item Data
//console.log('::: Writing Item Details');
//for (var itemIdx in cacheDetails.itemData){
////  console.log('==> ' + itemIdx);
//  var itemCache = cacheDetails.itemData[itemIdx];
//  if (rewriteEverything){
//  kdbFS.storeJSONDoc('kdb/cache/itemData/' + itemIdx + '.json', itemCache);
//  }
//}
//
////Write Object Data
//console.log('::: Writing Object Details');
//for (var oidIdx in cacheDetails.object){
////  console.log('--> ' + oidIdx);
//  var objectCache = cacheDetails.object[oidIdx];
//  if (rewriteEverything){
//  kdbFS.storeJSONDoc('kdb/cache/object/' + oidIdx + '.json', objectCache);
//  }
//}
//
//var commitList = kdbFS.loadJSONDoc('kdb/cache/commit.list');
//
//var firstCommitId = commitList.pop();
//var secondCommitId = commitList.pop();
//
//var firstCommit = cacheDetails.commit[firstCommitId];
//
//while (secondCommitId ){
//  console.log('::: Processing deltas for ' + secondCommitId);
//  var secondCommit = cacheDetails.commit[secondCommitId];
//  var delta = ItemProxy.compareTreeHashMap(firstCommit.treeHash, secondCommit.treeHash);
//  var commitDelta = {
//      meta: secondCommit.meta,
//      delta: delta
//  };
//  kdbFS.storeJSONDoc('kdb/cache/commit-deltas/' + secondCommit.meta.time + '_' + secondCommitId + '.json', commitDelta);
//  
//  // Prepare for next iteration
//  firstCommit = secondCommit;
//  secondCommitId = commitList.pop();
//}
//


