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
function loadAndDiffCurrent() {
  try {
    // Load the KDB
    global["koheseKDB"] = kdb;
    let HEAD_Commit_THM;
    let indexCommitsAndExit = false;
    kdb.initialize(baseRepoPath, indexCommitsAndExit).then(function() {
      console.log("::: Finished cache update for: " + baseRepoPath);

      console.log("$$$ TEST CODE $$$");
      let rootProxy = ItemProxy.getWorkingTree().getRootProxy();
      let itemCache : ItemCache = TreeConfiguration.getItemCache();

      let headCommitId = itemCache.getRef('HEAD');
      let headCommit = itemCache.getCommit(headCommitId);

      let prevConfig;
      let treeConfig;

      let prevTHM;
      let currentTHM;
      try {
        let prevCommit = headCommit.parents[0];
        console.log("::: Loading previous commit: " + prevCommit);
        prevConfig = new TreeConfiguration(prevCommit);
        itemCache.loadProxiesForCommit(
          prevCommit,
          prevConfig
        );
        prevConfig.loadingComplete();

        prevTHM = itemCache.getTreeHashMap(prevCommit);
      } catch (err) {
        console.log("*** Error");
        console.log(err);
      }

      try {
        console.log("::: Loading HEAD commit: " + headCommitId);
        treeConfig = new TreeConfiguration(headCommitId);
        itemCache.loadProxiesForCommit(
          headCommitId,
          treeConfig
        );
        treeConfig.loadingComplete();
        currentTHM = itemCache.getTreeHashMap(headCommitId);
        HEAD_Commit_THM = _.clone(currentTHM);
      } catch (err) {
        console.log("*** Error");
        console.log(err);
      }

      // console.log("$$$ Working ----------------------------------------");
      // rootProxy.dumpProxy();
      // console.log(JSON.stringify(rootProxy.treeHashEntry, null, "  "));
      // console.log("$$$ Config ----------------------------------------");
      // console.log(
      //   JSON.stringify(treeConfig.getRootProxy().treeHashEntry, null, "  ")
      // );

      let PREV_THM = prevConfig.getAllTreeHashes();
      let HEAD_THM = treeConfig.getAllTreeHashes();
      let WORKING_THM = TreeConfiguration.getWorkingTree().getAllTreeHashes();
      console.log("::: Comparison of PREV to HEAD");
      let thmCompare = TreeHashMap.compare(PREV_THM, HEAD_THM);
      console.log(JSON.stringify(thmCompare, null, '  '));

      console.log('$$$ Compare using new diff');
      let newCompare = TreeHashMap.diff(prevTHM, currentTHM);
      console.log(JSON.stringify(newCompare, null, '  '));

      console.log('$$$ Compare HEAD to Working');
      let headToWorkingDiff = TreeHashMap.diff(HEAD_THM, WORKING_THM);
      console.log(JSON.stringify(headToWorkingDiff.summary, null, '  '));
    });
  } catch (err) {
    console.log("*** Error");
    console.log(err);
  }
}


function compareDiff_c282fb(){
  try {
    let indexCommitsAndExit = true;
    kdb.initialize(baseRepoPath, indexCommitsAndExit).then(function() {
      console.log("::: Finished cache update for: " + baseRepoPath);

      let itemCache : ItemCache = TreeConfiguration.getItemCache();

      console.log("::: Evaluating diff for commit: c282fb161979b120314ecb613a282411302f4e9d");
      let errorTHM = itemCache.getTreeHashMap('c282fb161979b120314ecb613a282411302f4e9d');
      let priorTHM = itemCache.getTreeHashMap('82694888fae22340a5f37006f6c405d7cd8ddef7');
      let errorDiff = TreeHashMap.diff(priorTHM, errorTHM);
      console.log(JSON.stringify(errorDiff.summary, null, '  '));

    });

  } catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

function evaluateAllCommits() {
  try {
    let indexCommitsAndExit = true;
    kdb.initialize(baseRepoPath, indexCommitsAndExit).then(function() {
      console.log("::: Finished cache update for: " + baseRepoPath);

      let itemCache : ItemCache = TreeConfiguration.getItemCache();
      itemCache.detectMissingData();
    });

  } catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

function evaluateEachCommit() {
  try {
    let indexCommitsAndExit = true;
    kdb.initialize(baseRepoPath, indexCommitsAndExit).then(function() {
      console.log("::: Finished cache update for: " + baseRepoPath);

      let itemCache : ItemCache = TreeConfiguration.getItemCache();

      let commitMap = itemCache.getCommits();

      for (let commitId in commitMap){
        itemCache.detectMissingData(commitId);
      }
    });

  } catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

function evaluateCommit(selectedCommitId) {
  try {
    let indexCommitsAndExit = true;
    kdb.initialize(baseRepoPath, indexCommitsAndExit).then(function() {
      console.log("::: Finished cache update for: " + baseRepoPath);

      let itemCache : ItemCache = TreeConfiguration.getItemCache();
      itemCache.detectMissingData(selectedCommitId);
    });

  } catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

function loadConfigForEachCommit() {
  try {
    let indexCommitsAndExit = true;
    kdb.initialize(baseRepoPath, indexCommitsAndExit).then(function() {
      console.log("::: Finished cache update for: " + baseRepoPath);

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
    });

  } catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

function indexAndExit() {
  try {
    let indexCommitsAndExit = true;
    kdb.initialize(baseRepoPath, indexCommitsAndExit).then(function() {
      console.log("::: Finished cache update for: " + baseRepoPath);

    });

  } catch (err) {
    console.log("*** Error");
    console.log(err);

  }
}

//////////////////////////////////////////////////////////////////////////
// Main Processing
//////////////////////////////////////////////////////////////////////////

// loadAndDiffCurrent();
// compareDiff_c282fb();
// indexAndExit();
// evaluateAllCommits();
// evaluateEachCommit();
// evaluateCommit('01846aea16b25b0eb2c929543b2705fcbfa78b96');
// evaluateCommit('9127262235d201e40f7abf693d081770b5311570');
loadConfigForEachCommit();
