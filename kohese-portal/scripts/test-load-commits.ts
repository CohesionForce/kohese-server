'use strict';
import { ItemProxy } from '../common/src/item-proxy';
import { ItemCache } from '../common/src/item-cache';
import { CacheAnalysis } from '../common/src/cache-analysis';
import { KoheseCommit } from '../common/src/kohese-commit';
import { TreeConfiguration } from '../common/src/tree-configuration';
import { TreeHashMap, ItemIdType } from '../common/src/tree-hash';
import _ from 'underscore';
import * as JsDiff from 'diff';

// let heapdump = require ('heapdump');

var kdb = require('../server/kdb.js');

// Paths may be provided via arguments when starting via -kdb=PATH
var baseRepoPath = 'kohese-kdb';
for (var i = 2; i < process.argv.length; i++) {
  var arg = process.argv[i].split('=');
  if (arg[0] === '-kdb' && arg[1] !== '') {
    baseRepoPath = arg[1];
    break;
  }
}

//////////////////////////////////////////////////////////////////////////
// Test Cases
//////////////////////////////////////////////////////////////////////////
async function diffCommitAndPrev(refCommitId) {
  try {
    let itemCache : ItemCache = ItemCache.getItemCache();

    let refCommit = await itemCache.getCommit(refCommitId);
    let prevCommitId = refCommit.parents[0];

    console.log('::: Ref Commit: ' + refCommitId);
    console.log('::: Prev Commit: ' + prevCommitId);

    await compareCommits(prevCommitId, refCommitId);

  } catch (err) {
    console.log('*** Error');
    console.log(err);
  }
}

//////////////////////////////////////////////////////////////////////////
async function diffHeadAndPrev() {
  try {

    let itemCache : ItemCache = ItemCache.getItemCache();

    let headCommitId = await itemCache.getRef('HEAD');
    diffCommitAndPrev(headCommitId);

  } catch (err) {
    console.log('*** Error');
    console.log(err);
  }
}

//////////////////////////////////////////////////////////////////////////
async function compareCommitDiff(refCommit : KoheseCommit) {
  try {
    let prevCommitId = refCommit.parents[0];

    if (prevCommitId){
      console.log('$$$ Evaluating differences for commit: ' + refCommit.commitId);
      let diff = await refCommit.oldDiff();
      let newDiff = await refCommit.newDiff();
      if (!_.isEqual(diff, newDiff)){
        console.log('*** New diff did not match: ' + refCommit.commitId);
      }
    }

  } catch (err) {
    console.log('*** Error');
    console.log(err);
    console.log(err.stack);
  }
}

//////////////////////////////////////////////////////////////////////////
async function compareCommits(earlierCommit, laterCommit){
  try {
    let itemCache : ItemCache = ItemCache.getItemCache();

    console.log('::: Evaluating diff between commits: ' +earlierCommit + ' - ' + laterCommit);
    let beforeTime = Date.now();
    let laterTHM = await itemCache.getTreeHashMap(laterCommit);
    let afterFirstTHM = Date.now();
    deltaMessage("Time to get first THM", beforeTime, afterFirstTHM);
    let earlierTHM = await itemCache.getTreeHashMap(earlierCommit);
    let afterSecondTHM = Date.now();
    deltaMessage("Time to get second THM", afterFirstTHM, afterSecondTHM);
    let diff = TreeHashMap.diff(earlierTHM, laterTHM);
    let afterDiff = Date.now();
    deltaMessage("Time to perform diff", afterSecondTHM, afterDiff);
    deltaMessage('Total compare time', beforeTime, afterDiff);
    console.log(JSON.stringify(diff, null, '  '));
  } catch (err) {
    console.log('*** Error');
    console.log(err);
  }
}

//////////////////////////////////////////////////////////////////////////
async function compareDiff_c282fb(){
  try {
    let itemCache : ItemCache = ItemCache.getItemCache();

    console.log('::: Evaluating diff for commit: c282fb161979b120314ecb613a282411302f4e9d');
    let errorTHM = await itemCache.getTreeHashMap('c282fb161979b120314ecb613a282411302f4e9d');
    let priorTHM = await itemCache.getTreeHashMap('82694888fae22340a5f37006f6c405d7cd8ddef7');
    let errorDiff = TreeHashMap.diff(priorTHM, errorTHM);
    console.log(JSON.stringify(errorDiff.summary, null, '  '));

  } catch (err) {
    console.log('*** Error');
    console.log(err);

  }
}


//////////////////////////////////////////////////////////////////////////
function printMissingCacheData(missingCacheData) {
  if (missingCacheData.found){
    console.log('^^^ Missing cache data');
    console.log(JSON.stringify(missingCacheData, null, '  '));
  }
}

//////////////////////////////////////////////////////////////////////////
async function evaluateAllCommits() {
  console.log('^^^ Begin evaluating all commits');
  let startTime = Date.now();
  try {
    let itemCache : ItemCache = ItemCache.getItemCache();
    let cacheAnalysis = new CacheAnalysis(itemCache);
    let missingCommitData = await cacheAnalysis.detectMissingCommitData();
    printMissingCacheData(missingCommitData);
  } catch (err) {
    console.log('*** Error');
    console.log(err);

  }
  let finishTime = Date.now();

  console.log('^^^ Finish evaluating all commits: ' + (finishTime-startTime)/1000);
}

//////////////////////////////////////////////////////////////////////////
async function evaluateEachTree() {
  try {
    let itemCache : ItemCache = ItemCache.getItemCache();

    let treeMap = itemCache.getTrees();

    for (let treeId in treeMap){
      let cacheAnalysis = new CacheAnalysis(itemCache);
      let missingData = await cacheAnalysis.detectMissingTreeData(treeId);
      printMissingCacheData(missingData);
    }
  } catch (err) {
    console.log('*** Error');
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
async function evaluateEachCommit() {
  try {
    let itemCache : ItemCache = ItemCache.getItemCache();

    let commitMap = itemCache.getCommits();

    for (let commitId of Array.from(commitMap.keys())){
      let cacheAnalysis = new CacheAnalysis(itemCache);
      let missingData = await cacheAnalysis.detectMissingCommitData(commitId);
      printMissingCacheData(missingData);
    }
  } catch (err) {
    console.log('*** Error');
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
async function diffEachCommit() {
  try {
    let itemCache : ItemCache = ItemCache.getItemCache();

    let beforeTime = Date.now();
    let commitMap = itemCache.getCommits();

    for (let commitId of Array.from(commitMap.keys())){
      let commit : KoheseCommit = await itemCache.getCommit(commitId);
      await compareCommitDiff(commit);
    }

    let afterTime = Date.now();

    itemCache.saveAllPendingWrites();
    deltaMessage('Time to diff all commits', beforeTime, afterTime);

  } catch (err) {
    console.log('*** Error');
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
async function evaluateCommit(selectedCommitId) {
  try {
    let itemCache : ItemCache = ItemCache.getItemCache();
    let cacheAnalysis = new CacheAnalysis(itemCache);
    let missingData = await cacheAnalysis.detectMissingCommitData(selectedCommitId);
    printMissingCacheData(missingData);

  } catch (err) {
    console.log('*** Error');
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
async function evaluateBlob(oid) {
  try {
    let itemCache : ItemCache = ItemCache.getItemCache();
    let blob = await itemCache.getBlob(oid);
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
      'origin': 'TBD',
      'mounted': true,
      'id': '2852f690-66ce-11e5-82ed-75f294dafaa2',
      'name': 'Kohese',
      'description': 'Kohese Project',
      'parentId': '1965e4e0-db21-11e5-89b9-2dc8a2699c19',
      'createdBy': 'admin',
      'createdOn': 1443547133043,
      'modifiedBy': 'dphillips',
      'modifiedOn': 1474052723333,
      'itemIds': []
    };

    newOID = ItemProxy.gitDocumentOID(anotherTest);;
    console.log('::: Raw OID: ' + newOID);

  } catch (err) {
    console.log('*** Error');
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
async function loadCommit(selectedCommitId) {
  try {
    let itemCache : ItemCache = ItemCache.getItemCache();
    let treeConfig = new TreeConfiguration(selectedCommitId);

    await itemCache.loadProxiesForCommit(selectedCommitId, treeConfig);
    await treeConfig.loadingComplete();

    let savedTH = await itemCache.getTreeHashMap(selectedCommitId);
    let restoredTH = await treeConfig.getAllTreeHashes();

    let diff = TreeHashMap.diff(savedTH, restoredTH);

    console.log('::: Difference is: ');
    console.log(JSON.stringify(diff, null, '  '));

    console.log('::: Tree is:');
    let root : ItemProxy = treeConfig.getRootProxy();
    root.dumpProxy();

  } catch (err) {
    console.log('*** Error');
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
async function loadConfigForEachCommit() {
  try {
    let itemCache : ItemCache = ItemCache.getItemCache();

    let commitMap = itemCache.getCommits();

    for (let commitId of Array.from(commitMap.keys())){
      console.log('::: Loading TreeConfiguration for commit: ' + commitId);
      let treeConfig = new TreeConfiguration(commitId);
      await itemCache.loadProxiesForCommit(commitId, treeConfig);
      treeConfig.loadingComplete();
      let heapUsed = process.memoryUsage().heapUsed;
      console.log('==> Memory used: ' + heapUsed);
//        treeConfig.reset();
      treeConfig.deleteConfig();

      heapUsed = process.memoryUsage().heapUsed;
      console.log('==> After reset: ' + heapUsed);
      try {
        global.gc();
      } catch (e) {
        console.log('You must run program with "--expose-gc"');
      }
      heapUsed = process.memoryUsage().heapUsed;
      console.log('==> After GC:    ' + heapUsed);
//        heapdump.writeSnapshot(Date.now() + '.heapsnapshot');
    }

  } catch (err) {
    console.log('*** Error');
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
function deltaMessage(message, before, after) {
  console.log('^^^ ' + message + ': ' + (after-before)/1000);
}

import * as jsSHA_Import from 'jssha';

//
// Adjust for the differences in CommonJS and ES6 for jssha
//
let jsSHA;
if (typeof(jsSHA_Import) === 'object') {
  jsSHA = (<any>jsSHA_Import).default;
} else {
  jsSHA = jsSHA_Import;
}

//////////////////////////////////////////////////////////////////////////
function calcBlobOID(forText) {

  // This function calculates a OID that is equivalaent to the one calculated
  // natively by git.for the contents of a blob

  var length = forText.length;
  var shaObj = new jsSHA('SHA-1', 'TEXT');
  shaObj.update('blob ' + length + '\0' + forText);
  var oid = shaObj.getHash('HEX');

  return oid;
}

//////////////////////////////////////////////////////////////////////////
function replaceImage(inString: string) : String {
  let newString = new String(inString);
  let base64RegEx = /(\!\[[^\]]*\])(\(data:image\/[a-zA-Z]*;base64,)([^\)]*)(\))/;
  let hasImage = newString.match(base64RegEx);
  while (hasImage) {
    let imageOID = calcBlobOID(hasImage[3]);
    newString = newString.replace(base64RegEx,'$1(koid://' + imageOID + ')');
    hasImage = newString.match(base64RegEx);
  }
  return newString;
}

//////////////////////////////////////////////////////////////////////////
async function diffItemVersions(itemId) {
  let itemCache = ItemCache.getItemCache();

  console.log("::: Diff Item Versions for: " + itemId);
  let history = await itemCache.getHistoryWithNewStyle(itemId);
  // console.log(JSON.stringify(history, null, '  '));

  for (let versionDiff of history){
    let beforeTime = Date.now();

    if (versionDiff.oldTreeEntry && versionDiff.newTreeEntry){
      let oldOid = versionDiff.oldTreeEntry.oid;
      let newOid = versionDiff.newTreeEntry.oid;
      let oldBlob = await itemCache.getBlob(oldOid);
      let newBlob = await itemCache.getBlob(newOid);
  
      let blobCompare = ItemCache.compareObjects(oldBlob, newBlob);
    
      // console.log('::: Blob Diff');
      // console.log(JSON.stringify(blobCompare, null, '  '));
  
      for (let field in blobCompare.details.changed) {
        console.log('::: Field Changed: ' + field);
        let leftValue = blobCompare.details.changed[field].left;
        let rightValue = blobCompare.details.changed[field].right;
  
        leftValue = replaceImage(leftValue);
        rightValue = replaceImage(rightValue);
        let fieldDiff = JsDiff.diffWords(leftValue, rightValue);
        fieldDiff = JSON.parse(JSON.stringify(fieldDiff));
        console.log(fieldDiff);
      }  
    }
  
    let afterTime = Date.now();
    console.log('::: Diff time:  ' + itemId + ' - ' + (afterTime-beforeTime)/1000);  
  }
}

//////////////////////////////////////////////////////////////////////////
async function simulateClientSync() {

  let itemCache = ItemCache.getItemCache();
  let beforeGetHead = Date.now();
  let HEAD = await itemCache.getRef('HEAD');
  let afterGetHead = Date.now();
  deltaMessage('Time to get HEAD', beforeGetHead, afterGetHead);

  await itemCache.analysis.detectAllMissingData();
  let afterDetectAllMissingData = Date.now();
  deltaMessage('Time to detect all missing data', afterGetHead, afterDetectAllMissingData);

  let headTree = new TreeConfiguration(HEAD);
  await itemCache.loadProxiesForCommit(HEAD, headTree);
  let afterLoadHead = Date.now();
  deltaMessage('Time to load head', afterDetectAllMissingData, afterLoadHead);

  await headTree.loadingComplete();
  let afterCalcTreehashes = Date.now();
  deltaMessage('Time to calculate treehashes', afterLoadHead, afterCalcTreehashes);
  deltaMessage('Time to perform sync simulation', beforeGetHead, afterCalcTreehashes);

}

//////////////////////////////////////////////////////////////////////////
async function fullSystemDiff() {
  let itemCache : ItemCache = ItemCache.getItemCache();
  let historyMap = await itemCache.getHistoryMap();

  console.log("::: Begin full system diff");

  let beforeTime = Date.now();
  for (let itemId of Object.keys(historyMap)) {
    await diffItemVersions(itemId);
  }
  let afterTime = Date.now();
  console.log('::: Full diff time: ' + (afterTime-beforeTime)/1000);
}

//////////////////////////////////////////////////////////////////////////
// Main Processing
//////////////////////////////////////////////////////////////////////////


let indexCommitsAndExit = true;

try {
  kdb.initialize(baseRepoPath, indexCommitsAndExit).then(async function() {
    try {
      console.log('::: Finished cache update for: ' + baseRepoPath);

      /////////////////////
      // Logic to be tested
      /////////////////////

      // loadConfigForEachCommit();
      // await evaluateCommit('01846aea16b25b0eb2c929543b2705fcbfa78b96');
      // await evaluateCommit('9127262235d201e40f7abf693d081770b5311570');

      // await evaluateCommit('17e608d0f28e2c8c690c24a8a5f78253b817a3de');
      // await loadCommit('17e608d0f28e2c8c690c24a8a5f78253b817a3de');

      // await evaluateBlob('f780e55001b8ddf6798c0b38922497e0531f423e');
      // await evaluateCommit('fdf75ab379e28c4a541403e79e41c808090ecebf');

      // await compareDiff_c282fb();

      // Note:  This one is missing added items from details
      // await compareCommits('1b7aabf0a845269a078ff6ad2da9a5683c6728da', '17e608d0f28e2c8c690c24a8a5f78253b817a3de');

      // await evaluateAllCommits();
      // await evaluateEachCommit();
      // await evaluateEachTree();
      // await diffHeadAndPrev();

      // await simulateClientSync();

      // await diffEachCommit();

      await fullSystemDiff();

    } catch (err) {
      console.log('*** Error');
      console.log(err);
      console.log(err.stack);
    }
  });

} catch (err) {
  console.log('*** Error');
  console.log(err);
  console.log(err.stack);
}
