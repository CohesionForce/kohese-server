/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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


import { ItemCache } from './item-cache';

export class CacheAnalysis {

  private cache : ItemCache;
  private blobEvaluated = {};
  private treeEvaluated = {};
  private rootEvaluated = {};
  private commitParentEvaluated = {};
  private commitEvaluated = {};
  private missingCacheData = {
    found: false,
    blob: {},
    tree: {},
    root: {},
    commit: {}
  };
  // private reference = {
  //   blob: {},
  //   tree: {},
  //   root: {},
  //   commit: {}
  // };

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor (itemCache : ItemCache) {
    this.cache = itemCache;
  }

  //////////////////////////////////////////////////////////////////////////
  async evaluateBlob (itemId, kind, oid) {
    if (!this.blobEvaluated[oid]){
      // console.log('::: Evaluating blob for ' + itemId);
      if (!await this.cache.getBlob(oid)){
        // console.log('*** Missing blob for tree (%s) of kind (%s) with oid (%s)', itemId, kind, oid);
        this.missingCacheData.blob[oid] = {
          itemId: itemId,
          kind: kind,
          oid: oid
        };
        this.missingCacheData.found = true;
      }
      this.blobEvaluated[oid] = true;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  async evaluateTreeEntry (itemId, tree) {
    if (!tree){
      console.log('*** Missing tree for ' + itemId);
    }
    if (tree && !this.treeEvaluated[tree.treeHash]){
      // console.log('::: Evaluating tree for ' + itemId + ' - ' + tree.treeHash);
      await this.evaluateBlob(itemId, tree.kind, tree.oid);

      // // Add reference of blob by tree
      // if (!this.reference.blob[tree.oid]){
      //   this.reference.blob[tree.oid] ={tree: {}};
      // }
      // this.reference.blob[tree.oid].tree[tree.treeHash] = {ref: 'tree'};

      for (let childId in tree.childTreeHashes) {
        let childTreeHash = tree.childTreeHashes[childId];
        switch (childTreeHash){
          case 'Repository-Mount':
          case 'Internal':
            break;
          default:
            let childTree = await this.cache.getTree(childTreeHash);
            if (childTree) {
              await this.evaluateTreeEntry(childId, childTree);

              // // Add reference of childTree by tree
              // if (!this.reference.tree[childTree.treeHash]){
              //   this.reference.tree[childTree.treeHash] ={tree: {}};
              // }
              // if (!this.reference.tree[childTree.treeHash].tree){
              //   this.reference.tree[childTree.treeHash].tree ={};
              // }
              // this.reference.tree[childTree.treeHash].tree[tree.treeHash] = {ref: 'tree'};

            } else {
              if (!this.treeEvaluated[childTreeHash]) {
                // console.log('*** Missing tree for tree (%s) with treeHash (%s)', childId, childTreeHash);
                this.missingCacheData.tree[childTreeHash] = {
                  itemId: childId,
                  treeHash: childTreeHash
                };
                this.missingCacheData.found = true;
                this.treeEvaluated[childTreeHash] = true;
              }
            }
        }
      }
      this.treeEvaluated[tree.treeHash] = true;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  async evaluateRoot(rootId, root) {
    if (root && !this.rootEvaluated[root.treeHash]){
      // console.log('::: Evaluating root:  ' + rootId + ' - ' + root.treeHash);

      let rootTree = await this.cache.getTree(root.treeHash);

      if (rootTree) {
        await this.evaluateTreeEntry(rootId, rootTree);
      } else {
        if (!this.rootEvaluated[root.treeHash]) {
          // console.log('*** Missing tree for root (%s) with treeHash (%s)', rootId, root.treeHash);
          this.missingCacheData.root[root.treeHash] = {
            rootId: rootId,
            treeHash: root.treeHash
          };
          this.missingCacheData.found = true;

          // Evaluate with the root tree data instead
          await this.evaluateTreeEntry(rootId, root);
        }
      }
      this.rootEvaluated[root.treeHash] = true;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  async evaluateTreeRoots(repoTreeRoots) {
    for (let rootId in repoTreeRoots){
      let root = repoTreeRoots[rootId];

      await this.evaluateRoot(rootId, root);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  async evaluateCommit(commitId, commit) {
    // console.log('::: Evaluating commit:  ' + commitId);

    await this.evaluateTreeRoots(commit.repoTreeRoots);

    // Check for missing parent commits
    // console.log('::: Checking for parent commits: ' + commit.parents);
    if (commit.parents) {
      for (let parentCommitId of commit.parents) {
        if (!this.commitParentEvaluated[parentCommitId]) {
          // console.log('::: Checking for commit parent: ' + parentCommitId);
          let parentCommit = await this.cache.getCommit(parentCommitId);
          if (!parentCommit) {
            // console.log('*** Missing commit: ' + parentCommitId);
            this.missingCacheData.commit[parentCommitId] = {
              commitId: parentCommitId
            };
            this.missingCacheData.found = true;
          }
          this.commitParentEvaluated[parentCommitId] = true;
        }
      }
    }

    this.commitEvaluated[commitId] = true;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectMissingWorkspaceData(selectedWorkspaceId?) {
    let workspaceMap = this.cache.getWorkspaces();
    for (let [workspaceId, workspace] of Array.from(workspaceMap.entries())) {
      if (!selectedWorkspaceId || (selectedWorkspaceId && (workspaceId === selectedWorkspaceId))){
        await this.evaluateTreeRoots(workspace);
      }
    };

    return this.getMissingData();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectMissingRefData() {
    let refMap = this.cache.getRefs();
    for (let [refId, commitId] of Array.from(refMap.entries())) {
      let commit = await this.cache.getCommit(commitId);
      if (!commit){
        this.missingCacheData.commit[commitId] = {
          commitId: commitId
        };
        this.missingCacheData.found = true;
      } else {
        await this.evaluateCommit(commitId, commit);
      }
    };

    return this.getMissingData();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectMissingCommitData(selectedCommitId?) {
    let kCommitMap = this.cache.getCommits();
    for (let [commitId, commit] of Array.from(kCommitMap.entries())) {
      if (!selectedCommitId || (selectedCommitId && (commitId === selectedCommitId))){
        await this.evaluateCommit(commitId, commit);
      }
    };

    return this.getMissingData();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectMissingTreeRootData(selectedTreeRoots) {
    await this.evaluateTreeRoots(selectedTreeRoots);
    return this.getMissingData();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectMissingTreeData(selectedTreeId?) {
    let kTreeMap = this.cache.getTrees();
    for (let treeId in kTreeMap) {
      if (!selectedTreeId || (selectedTreeId && (treeId === selectedTreeId))){
        let tree = kTreeMap.get(treeId);

        await this.evaluateTreeEntry(treeId, tree);
      }
    };
    return this.getMissingData();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  private markBlobsAsEvaluated() {
    let blobMap = this.cache.getBlobs();
    for (let oid in blobMap) {
      this.blobEvaluated[oid] = true;
    };
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async detectAllMissingData(){
    this.markBlobsAsEvaluated();
    await this.detectMissingTreeData();
    await this.detectMissingCommitData();
    await this.detectMissingWorkspaceData();
    await this.detectMissingRefData();
    return this.getMissingData();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  private resetMissingDataIndicators() {
    this.missingCacheData.found = false;

    // Clean out progress indicators
    for(let oid in this.missingCacheData.blob){
      delete this.blobEvaluated[oid];
      delete this.missingCacheData.blob[oid];
    }

    for(let treehash in this.missingCacheData.tree){
      delete this.treeEvaluated[treehash];
      delete this.missingCacheData.tree[treehash];
    }

    for(let rootTreehash in this.missingCacheData.root){
      delete this.rootEvaluated[rootTreehash];
      delete this.missingCacheData.root[rootTreehash];
    }

    for(let commitId in this.missingCacheData.commit){
      delete this.commitEvaluated[commitId];
      delete this.missingCacheData.commit[commitId];
    }

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  async reevaluateMissingData() {
    console.log('%%% Reevaluate missing cache data');
    let missingCacheData = JSON.parse(JSON.stringify(this.missingCacheData));

    this.resetMissingDataIndicators();

    // Begin re-evaluation
    for(let oid in missingCacheData.blob){
      let blobInfo = missingCacheData.blob[oid];
      // console.log('%%% Reevaluate blob: ' + oid);
      await this.evaluateBlob(blobInfo.itemId, blobInfo.kind, blobInfo.oid);
    }

    for(let treehash in missingCacheData.tree){
      let treeInfo = missingCacheData.tree[treehash];
      let tree = await this.cache.getTree(treehash);
      if (tree){
        // console.log('%%% Reevaluate tree: ' + treehash);
        await this.evaluateTreeEntry(treeInfo.itemId, tree);
      } else {
        // Tree is still missing
        console.log('%%% Tree still missing: ' + treehash);
        this.missingCacheData.tree[treehash] = treeInfo;
        this.missingCacheData.found = true;
      }
    }

    for(let rootTreehash in missingCacheData.root){
      let rootInfo = missingCacheData.root[rootTreehash];
      let root = await this.cache.getTree(rootTreehash);
      if (root){
        // console.log('%%% Reevaluate root: ' + rootTreehash);
        await this.evaluateRoot(rootInfo.rootId, root);
      } else {
        // Root is still missing
        console.log('%%% Root is still missing: ' + rootTreehash);
        this.missingCacheData.root[rootTreehash] = rootInfo;
        this.missingCacheData.found = true;
      }
    }

    for(let commitId in missingCacheData.commit){
      let commitInfo = missingCacheData.commit[commitId];
      let commit = await this.cache.getCommit(commitId);
      if (commit){
        // console.log('%%% Reevaluate commit: ' + commitId);
        await this.evaluateCommit(commitInfo.commitId, commit);
      } else {
        // Root is still missing
        console.log('%%% Commit is still missing: ' + commitId);
        this.missingCacheData.commit[commitId] = commitInfo;
        this.missingCacheData.found = true;
      }
    }


    return this.getMissingData();
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getMissingData() {
    let missingData = JSON.parse(JSON.stringify(this.missingCacheData));
    // Delete unneessary result categories
    if (Object.keys(missingData.blob).length === 0) {
      delete missingData.blob;
    }

    if (Object.keys(missingData.tree).length === 0) {
      delete missingData.tree;
    }

    if (Object.keys(missingData.root).length === 0) {
      delete missingData.root;
    }

    if (Object.keys(missingData.commit).length === 0) {
      delete missingData.commit;
    }

    return missingData;
  }
}
