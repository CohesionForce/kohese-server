/**
 *
 */

'use strict';

import * as   _ from 'underscore';
import { ItemProxy } from './item-proxy';
import { TreeHashEntry, TreeHashMap, TreeHashValueType } from './tree-hash';


// TODO set back to false and/or remove disable check below
const disableObjectFreeze = false;

export class KoheseCommit {
  time: number;
  author: string;
  message: string;
  parents?: Array<string>;
  repoTreeRoots: { [ key : string ] : TreeHashEntry };
}

type KoheseTree = TreeHashEntry;

type Blob = any;

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//
// The ItemCache is the super class that will support cache management on both the server and the client.
// The ItemCache will support retrieval of all historical data as well as the current working tree and
// staged content.
//
// ItemCache uses the Object.freeze capability to restrict the modification of any cached
// information.  Any attempt to modify cached data will result in an exception.  As the item
// class management capability is rolled out, there will be a way to perform a copy of the data
// prior to modification.
//
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

export class ItemCache {

  public refs;
  public tags;
  public kCommitMap : { [ oid : string ]: KoheseCommit};
  public kTreeMap : { [ oid : string ]: KoheseTree};
  public blobMap : { [ oid : string ]: Blob};

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  constructor() {

    this.refs = {};
    this.tags = {};
    this.kCommitMap = {};
    this.kTreeMap = {};
    this.blobMap = {};

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getObjectMap(){
    return {
      refs : this.refs,
      tags : this.tags,
      kCommitMap: this.kCommitMap,
      kTreeMap: this.kTreeMap,
      blobMap: this.blobMap
    };
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  setObjectMap(objectMap){
    if (objectMap.refs){
      this.refs = objectMap.refs;
    }
    if (objectMap.tags){
      this.tags = objectMap.tags;
    }
    if (objectMap.kCommitMap){
      this.kCommitMap = objectMap.kCommitMap;
    }
    if (objectMap.kTreeMap){
      this.kTreeMap = objectMap.kTreeMap;
    }
    if (objectMap.blobMap){
      this.blobMap = objectMap.blobMap;
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRefs(){
    return this.refs;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheRef(ref, oid){
    this.refs[ref] = oid;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getRef(ref){
    return this.refs[ref];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getTags(){
    return this.tags;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheTag(tag, oid){
    this.tags[tag] = oid;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getTag(tag){
    return this.tags[tag];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getCommits(){
    return this.kCommitMap;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheCommit(oid : string, commit : KoheseCommit){
    Object.freeze(commit);
    this.kCommitMap[oid] = commit;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getCommit(oid : string){
    return this.kCommitMap[oid];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheTree(oid, tree){
    Object.freeze(tree);
    this.kTreeMap[oid] = tree;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getTreeHashMap(forCommit : string) : TreeHashMap {
    var treeHashMap = {};

    let commit = this.getCommit(forCommit);

    let treeHashEntryStack : Array<{id:string, treeId:TreeHashValueType}> = [];
    let reversedRootIds = Object.keys(commit.repoTreeRoots).reverse();
    for (let repoIdx in reversedRootIds){
      let repoId = reversedRootIds[repoIdx];
      treeHashEntryStack.push({id:repoId, treeId:commit.repoTreeRoots[repoId].treeHash});
    }

    while (treeHashEntryStack.length > 0) {
      let mapEntry = treeHashEntryStack.pop();
      let treeHashEntry = this.getTree(mapEntry.treeId)

      if (treeHashEntry) {
        treeHashMap [mapEntry.id] = treeHashEntry;

        let reversedChildIds = Object.keys(treeHashEntry.childTreeHashes).reverse();
        for (let childIdx in reversedChildIds){
          let childId = reversedChildIds[childIdx];
          let treeId = treeHashEntry.childTreeHashes[childId];
          switch (treeId){
            case "Repository-Mount":
            case "Internal":
              // Ignore
              break;
            default:
              treeHashEntryStack.push({id:childId, treeId: treeId});
          }
        }
      } else {
        console.log('!!! Can not find treeHashEntry for: ' + JSON.stringify(mapEntry));
      }
    }

    return treeHashMap;
  }



  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getTree(oid){
    return this.kTreeMap[oid];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  cacheBlob(oid, blob){
    if(!disableObjectFreeze){
      Object.freeze(blob);
    }
    this.blobMap[oid] = blob;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  getBlob(oid){
    return this.blobMap[oid];
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfCommits(){
    return _.size(this.kCommitMap);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfTrees(){
    return _.size(this.kTreeMap);
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  numberOfBlobs(){
    return _.size(this.blobMap);
  }

  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  //// Proxy loading methods
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadProxiesForCommit(commitId, treeConfig){
    let commit = this.getCommit(commitId);

    console.log('$$$ Loading commit: ');
    console.log(JSON.stringify(commit, [ 'time', 'author', 'message', 'parents' ], '  '));

    for(let repoId in commit.repoTreeRoots){
      let repoTreeHashEntry = commit.repoTreeRoots[repoId];
      this.loadProxiesForTree(repoId, repoTreeHashEntry, treeConfig);
    }

    console.log('$$$ Loading complete');

  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  loadProxiesForTree(treeId, treeHashEntry, treeConfig){
    // console.log('$$$ Processing tree: ' + treeId);
    // console.log(treeHashEntry);
    let kind = treeHashEntry.kind;

    switch(kind){
      case 'Internal':
      case 'Internal-Lost':
      case 'Internal-Model':
      case 'Internal-View-Model':
        // console.log('::: Only processing children for internal kind: ' + kind);
        break;
      default:
        let item = this.getBlob(treeHashEntry.oid);
        if (item){
          // eslint-disable-next-line no-unused-vars
          let treeProxy : ItemProxy = new ItemProxy(kind,  item, treeConfig);
        } else {
          console.log('*** Could not find item for: ' + kind + ' - with item id - ' + treeId);
          console.log(treeHashEntry);
        }
    }

    for(let childId in treeHashEntry.childTreeHashes){
      // console.log('$$$ Child: ' + childId);
      let childTreeHash = treeHashEntry.childTreeHashes[childId];
      if ((childTreeHash !== 'Repository-Mount') &&
        (childTreeHash !== 'Internal')) {
        let childTreeHashEntry = this.getTree(childTreeHash);
        this.loadProxiesForTree(childId, childTreeHashEntry, treeConfig);
      }
    }
  }
}
