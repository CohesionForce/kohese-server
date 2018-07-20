"use strict";
import { ItemProxy } from "../common/src/item-proxy";
import { ItemCache } from "../common/src/item-cache";
import { TreeConfiguration } from "../common/src/tree-configuration";
import { TreeHashMap } from "../common/src/tree-hash";
import * as _ from "underscore";
let heapdump = require ('heapdump');

var kdb = require("../server/kdb.js");

//Paths may be provided via arguments when starting via -kdb=PATH
var baseRepoPath;
for (var i = 2; i < process.argv.length; i++) {
  var arg = process.argv[i].split("=");
  if (arg[0] === "-kdb" && arg[1] !== "") {
    baseRepoPath = arg[1];
    break;
  }
}

if (!baseRepoPath) {
  console.log("*** KDB repo must be supplied");
  console.log("usage: node scripts/index-commits.js -kdb=repo-subdir");
  process.exit(1);
}

//////////////////////////////////////////////////////////////////////////
// Test Cases
//////////////////////////////////////////////////////////////////////////
function diffCommitAndPrev(refCommitId) {
  try {
    let itemCache : ItemCache = TreeConfiguration.getItemCache();

    let refCommit = itemCache.getCommit(refCommitId);
    let prevCommitId = refCommit.parents[0];

    console.log('::: Ref Commit: ' + refCommitId);
    console.log('::: Prev Commit: ' + prevCommitId);

    compareCommits(prevCommitId, refCommitId);

} catch (err) {
    console.log("*** Error");
    console.log(err);
  }
}

//////////////////////////////////////////////////////////////////////////
function diffHeadAndPrev() {
  try {

    let itemCache : ItemCache = TreeConfiguration.getItemCache();

    let headCommitId = itemCache.getRef('HEAD');
    diffCommitAndPrev(headCommitId);

} catch (err) {
    console.log("*** Error");
    console.log(err);
  }
}

//////////////////////////////////////////////////////////////////////////
function compareCommits(earlierCommit, laterCommit){
  try {
    let itemCache : ItemCache = TreeConfiguration.getItemCache();

    console.log("::: Evaluating diff between commits: " +earlierCommit + ' - ' + laterCommit);
    let laterTHM = itemCache.getTreeHashMap(laterCommit);
    let earlierTHM = itemCache.getTreeHashMap(earlierCommit);
    let diff = TreeHashMap.diff(earlierTHM, laterTHM);
    console.log(JSON.stringify(diff, null, '  '));
} catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
function compareDiff_c282fb(){
  try {
    let itemCache : ItemCache = TreeConfiguration.getItemCache();

    console.log("::: Evaluating diff for commit: c282fb161979b120314ecb613a282411302f4e9d");
    let errorTHM = itemCache.getTreeHashMap('c282fb161979b120314ecb613a282411302f4e9d');
    let priorTHM = itemCache.getTreeHashMap('82694888fae22340a5f37006f6c405d7cd8ddef7');
    let errorDiff = TreeHashMap.diff(priorTHM, errorTHM);
    console.log(JSON.stringify(errorDiff.summary, null, '  '));

  } catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
function evaluateAllCommits() {
  try {
    let itemCache : ItemCache = TreeConfiguration.getItemCache();
    itemCache.detectMissingCommitData();
} catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
function evaluateEachTree() {
  try {
    let itemCache : ItemCache = TreeConfiguration.getItemCache();

    let treeMap = itemCache.getTrees();

    for (let treeId in treeMap){
      itemCache.detectMissingTreeData(treeId);
    }
} catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
function evaluateEachCommit() {
  try {
    let itemCache : ItemCache = TreeConfiguration.getItemCache();

    let commitMap = itemCache.getCommits();

    for (let commitId in commitMap){
      itemCache.detectMissingCommitData(commitId);
    }
} catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
function diffEachCommit() {
  try {
    let itemCache : ItemCache = TreeConfiguration.getItemCache();

    let currentCommit = itemCache.getRef('HEAD');
} catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
function evaluateCommit(selectedCommitId) {
  try {
    let itemCache : ItemCache = TreeConfiguration.getItemCache();
    itemCache.detectMissingCommitData(selectedCommitId);

  } catch (err) {
    console.log("*** Error");
    console.log(err);

  }
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

//////////////////////////////////////////////////////////////////////////
function evaluateBlob(oid) {
  try {
    let itemCache : ItemCache = TreeConfiguration.getItemCache();
    let blob = itemCache.getBlob(oid);
    console.log('::: Blob: ' + oid);
    console.log(JSON.stringify(blob, null, '  '));

    console.log('::: After loading');
    let treeConfig = new TreeConfiguration('TEST-DATA');
    let proxy = new ItemProxy('Item', blob, treeConfig);
    console.log(JSON.stringify(proxy.item, null, '  '));
    treeConfig.deleteConfig();


    console.log('::: Copy attributes');
    let testObject = {item:{}};
    copyAttributes(blob, testObject)
    delete testObject.item['__deletedProperty'];
    console.log(JSON.stringify(testObject.item, null, '  '));

    let newOID = ItemProxy.gitDocumentOID(blob);
    console.log('::: New OID: ' + newOID);
    newOID = ItemProxy.gitDocumentOID(testObject.item);
    console.log('::: Test OID: ' + newOID);

    let anotherTest = {
      "origin": "TBD",
      "mounted": true,
      "id": "2852f690-66ce-11e5-82ed-75f294dafaa2",
      "name": "Kohese",
      "description": "Kohese Project",
      "parentId": "1965e4e0-db21-11e5-89b9-2dc8a2699c19",
      "createdBy": "admin",
      "createdOn": 1443547133043,
      "modifiedBy": "dphillips",
      "modifiedOn": 1474052723333,
      "itemIds": []
    };

    newOID = ItemProxy.gitDocumentOID(anotherTest);;
    console.log('::: Raw OID: ' + newOID);

  } catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
function loadCommit(selectedCommitId) {
  try {
    let itemCache : ItemCache = TreeConfiguration.getItemCache();
    let treeConfig = new TreeConfiguration(selectedCommitId);

    // itemCache.detectMissingCommitData(selectedCommitId);

    itemCache.loadProxiesForCommit(selectedCommitId, treeConfig);
    treeConfig.calculateAllTreeHashes();

    let savedTH = itemCache.getTreeHashMap(selectedCommitId);
    let restoredTH = treeConfig.getAllTreeHashes();

    let diff = TreeHashMap.diff(savedTH, restoredTH);

    console.log('::: Difference is: ');
    console.log(JSON.stringify(diff, null, '  '));

    console.log('::: Tree is:');
    let root : ItemProxy = treeConfig.getRootProxy();
    root.dumpProxy();

  } catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
function loadConfigForEachCommit() {
  try {
    let itemCache : ItemCache = TreeConfiguration.getItemCache();

    let commitMap = itemCache.getCommits();

    for (let commitId in commitMap){
      console.log('::: Loading TreeConfiguration for commit: ' + commitId);
      let treeConfig = new TreeConfiguration(commitId);
      itemCache.loadProxiesForCommit(commitId, treeConfig);
      treeConfig.loadingComplete();
      let heapUsed = process.memoryUsage().heapUsed;
      console.log("==> Memory used: " + heapUsed);
//        treeConfig.reset();
      treeConfig.deleteConfig();

      heapUsed = process.memoryUsage().heapUsed;
      console.log("==> After reset: " + heapUsed);
      try {
        global.gc();
      } catch (e) {
        console.log("You must run program with '--expose-gc'");
      }
      heapUsed = process.memoryUsage().heapUsed;
      console.log("==> After GC:    " + heapUsed);
//        heapdump.writeSnapshot(Date.now() + '.heapsnapshot');
    }

  } catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
function exportObjectCache() {
  let itemCache : ItemCache = TreeConfiguration.getItemCache();
  console.log('::: Export Object Cache');
  let objectMap = itemCache.getObjectMap();

  let fs = require('fs');
  fs.writeFileSync('./test.objectCache.json', JSON.stringify(objectMap, null, '  '));

}

//////////////////////////////////////////////////////////////////////////
// Main Processing
//////////////////////////////////////////////////////////////////////////


let indexCommitsAndExit = true;

try {
  kdb.initialize(baseRepoPath, indexCommitsAndExit).then(function() {
    console.log("::: Finished cache update for: " + baseRepoPath);

    /////////////////////
    // Logic to be tested
    /////////////////////

    // loadConfigForEachCommit();
    // evaluateCommit('01846aea16b25b0eb2c929543b2705fcbfa78b96');
    // evaluateCommit('9127262235d201e40f7abf693d081770b5311570');

    // evaluateCommit('17e608d0f28e2c8c690c24a8a5f78253b817a3de');
    // loadCommit('17e608d0f28e2c8c690c24a8a5f78253b817a3de');

    // evaluateBlob('f780e55001b8ddf6798c0b38922497e0531f423e');
    // evaluateCommit('fdf75ab379e28c4a541403e79e41c808090ecebf');

    // compareDiff_c282fb();

    // Note:  This one is missing added items from details
    // compareCommits('1b7aabf0a845269a078ff6ad2da9a5683c6728da', '17e608d0f28e2c8c690c24a8a5f78253b817a3de');

    // evaluateAllCommits();
    // evaluateEachCommit();
    // evaluateEachTree();
    diffHeadAndPrev();
    exportObjectCache();

  });

} catch (err) {
  console.log("*** Error");
  console.log(err);

}
