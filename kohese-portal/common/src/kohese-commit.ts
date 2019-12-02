import * as   _ from 'underscore';
import { TreeHashEntry, TreeHashMap, TreeHashValueType, ItemIdType, TreeHashMapDifference } from './tree-hash';
import { ItemCache } from './item-cache';

export type Workspace = {[id:string] : TreeHashEntry};

export class KoheseCommit {
  // Commit Id
  public commitId: string;
  // Commit Data
  public time: number;
  public author: string;
  public message: string;
  public parents?: Array<ItemIdType>;
  public repoTreeRoots: Workspace;
  // Derived Data
  private treeHashMap?: TreeHashMap;
  private oldDifference?: TreeHashMapDifference;

  //////////////////////////////////////////////////////////////////////////
  constructor (commitId: string, commitData : KoheseCommit){
    this.commitId = commitId;
    this.time = commitData.time;
    this.author = commitData.author;
    this.message = commitData.message;
    if (commitData.parents){
      this.parents = commitData.parents;
    }
    this.repoTreeRoots = commitData.repoTreeRoots;
  }

  //////////////////////////////////////////////////////////////////////////
  public toJSON() {
    return {
      time: this.time,
      author: this.author,
      message: this.message,
      parents: this.parents,
      repoTreeRoots: this.repoTreeRoots,
    }
  }

  //////////////////////////////////////////////////////////////////////////
  async getTreeHashMap() : Promise<TreeHashMap> {

    if (!this.treeHashMap){
      let itemCache = ItemCache.getItemCache();
      this.treeHashMap = {};
      let treeHashEntryStack : Array<{id:string, treeId:TreeHashValueType}> = [];
      let reversedRootIds = Object.keys(this.repoTreeRoots).reverse();
      for (let repoId of reversedRootIds){
        treeHashEntryStack.push({id:repoId, treeId:this.repoTreeRoots[repoId].treeHash});
      }
  
      while (treeHashEntryStack.length > 0) {
        let mapEntry = treeHashEntryStack.pop();
        let treeHashEntry = await itemCache.getTree(mapEntry.treeId)
  
        if (treeHashEntry) {
          this.treeHashMap [mapEntry.id] = treeHashEntry;
  
          let reversedChildIds = Object.keys(treeHashEntry.childTreeHashes).reverse();
          for (let childId of reversedChildIds){
            let treeId = treeHashEntry.childTreeHashes[childId];
            switch (treeId){
              case 'Repository-Mount':
              case 'Internal':
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
    }

    return this.treeHashMap;
  }

  //////////////////////////////////////////////////////////////////////////
  async getParentCommits() : Promise<Array<KoheseCommit>> {
    let itemCache = ItemCache.getItemCache();
    let parentCommitArray : Array<KoheseCommit> = [];

    for(let parentCommitId of this.parents){
      let parentCommit = await itemCache.getCommit(parentCommitId)
      parentCommitArray.push(parentCommit);
    }

    return parentCommitArray;
  }

  //////////////////////////////////////////////////////////////////////////
  async oldDiff() : Promise<TreeHashMapDifference> {

    if (!this.oldDifference){
      let parentCommits = await this.getParentCommits();

      let prevCommit = parentCommits[0];

      let thisCommitTHM : TreeHashMap = await this.getTreeHashMap();
      let parentCommitTHM : TreeHashMap;
      if (prevCommit){
        parentCommitTHM = await prevCommit.getTreeHashMap();
      }  else {
        parentCommitTHM = {};
      }
      this.oldDifference = TreeHashMap.diff(parentCommitTHM, thisCommitTHM);
    }

    return this.oldDifference;
  }

  //////////////////////////////////////////////////////////////////////////
  async newDiff(prevCommit?: KoheseCommit) : Promise<TreeHashMapDifference> {

    let itemCache = ItemCache.getItemCache();

    if (!prevCommit){
      let parentCommits = await this.getParentCommits();
      if(parentCommits[0]){
        prevCommit = parentCommits[0];
      } else {
        prevCommit = <KoheseCommit>{
          commitId: 'invalid',
          time: 0,
          author: 'invalid',
          message: 'invalid',
          repoTreeRoots: {}
        }
      }
    }

    let leftRoots : Array<ItemIdType> = Object.keys(prevCommit.repoTreeRoots);
    let rightRoots : Array<ItemIdType> = Object.keys(this.repoTreeRoots);

    let sortedLeftRoots = _.clone(leftRoots).sort();
    let sortedRightRoots = _.clone(rightRoots).sort();
    let addedRoots = _.difference(sortedRightRoots, sortedLeftRoots);
    let deletedRoots = _.difference(sortedLeftRoots, sortedRightRoots);
    let commonRoots = _.intersection(leftRoots, rightRoots);

    let treeDifference : TreeHashMapDifference = {
      match: _.isEqual(sortedLeftRoots, sortedRightRoots),
      summary: {
        roots: {
          added: addedRoots,
          deleted: deletedRoots,
          common: commonRoots
        },
        kindChanged: {},
        contentChanged: {},
        parentChanged: {},
        itemAdded: {},
        itemDeleted: {},
        itemMissing: {
          leftMissing: [],
          rightMissing: []
        }
      },
      details: {}
    };

    let left = _.clone(prevCommit.repoTreeRoots);
    let right = _.clone(this.repoTreeRoots);

    let gatherStack : Array<ItemIdType> = _.clone(leftRoots.concat(addedRoots));

    while (gatherStack.length){
      let diffId = gatherStack.pop();
      try {

        let leftVersion : TreeHashEntry = left[diffId];
        let rightVersion : TreeHashEntry = right[diffId];

        if (_.isEqual(leftVersion, rightVersion)){
          // Don't need the nodes for items that match
          delete left[diffId];
          delete right[diffId];
          continue;
        }

        if (leftVersion) {
          for (let leftChildId of Object.keys(leftVersion.childTreeHashes)){
            let leftChildTreeHash = leftVersion.childTreeHashes[leftChildId];
            switch (leftChildTreeHash){
              case "Repository-Mount":
              case "Internal":
                // ignore
                break;
              default:
                if(!left[leftChildId]){
                  let leftChildTree = await itemCache.getTree(leftChildTreeHash);
                  let leftChildTreeClone =  _.clone(leftChildTree);
                  left[leftChildId] = leftChildTreeClone;
                  if(_.indexOf(gatherStack, leftChildId) === -1) {
                    gatherStack.push(leftChildId);
                  }  
                }
            }
          }  
        }

        if (rightVersion) {
          for (let rightChildId of Object.keys(rightVersion.childTreeHashes)){
            let rightChildTreeHash = rightVersion.childTreeHashes[rightChildId];
            switch (rightChildTreeHash){
              case "Repository-Mount":
              case "Internal":
                // ignore
                break;
              default:
                if(!right[rightChildId]){
                  let rightChildTree = await itemCache.getTree(rightChildTreeHash);
                  let rightChildTreeClone =  _.clone(rightChildTree);
                  right[rightChildId] = rightChildTreeClone;
                  if(_.indexOf(gatherStack, rightChildId) === -1) {
                    gatherStack.push(rightChildId);
                  }  
                }
            }
          }  
        }

      } catch (err){
        console.log('*** Error: ' + err + ' while processing ' + diffId);
        console.log(err.stack);
      }
    }

    // TODO: Should this be the union of the roots?
    let compareStack : Array<ItemIdType> = _.clone(commonRoots).reverse();

    while (compareStack.length){
      let diffId = compareStack.pop();
      try {

        let leftVersion : TreeHashEntry = left[diffId];
        let rightVersion : TreeHashEntry = right[diffId];

        if (_.isEqual(leftVersion, rightVersion)){
          continue;
        }

        if (!leftVersion){
          treeDifference.summary.itemMissing.leftMissing.push(diffId);
          treeDifference.match = false;
        }
        if(!rightVersion){
          treeDifference.summary.itemMissing.rightMissing.push(diffId);
          treeDifference.match = false;
        }
        if(!leftVersion || !rightVersion){
          continue;
        }

        let diff = TreeHashEntry.diff(leftVersion, rightVersion);

        if (!diff.match){
          treeDifference.details[diffId] = diff;
          treeDifference.match = false;
        }

        if (diff.kindChanged){
          treeDifference.summary.kindChanged[diffId] = {
            fromKind :diff.kindChanged.fromKind,
            toKind: diff.kindChanged.toKind
          };
        }

        if (diff.contentChanged){
          treeDifference.summary.contentChanged[diffId] = {
            fromOID: diff.contentChanged.fromOID,
            toOID: diff.contentChanged.toOID
          };
        }

        if (diff.parentChanged){
          treeDifference.summary.parentChanged[diffId] = {
            fromParentId :diff.parentChanged.fromId,
            toParentId: diff.parentChanged.toId
          };
        }

        if (diff.childrenAdded){
          let childrenThatMoved : Array<ItemIdType> = [];
          for(let addedChild of diff.childrenAdded) {
          
            // Recursively add children for item that moved
            let childStack : Array<{id:ItemIdType, treeId:TreeHashValueType}> = [ addedChild ];
            while (childStack.length > 0){

              let addedEntry = childStack.pop();

              switch (addedEntry.id){
                case "Repository-Mount":
                case "Internal":
                  // Ignore references to a mount or internal root
                  continue;
              }

              let addedItem = right[addedEntry.id];
              if (!addedItem) {
                // Don't need to process
                continue;
              }

              if (left[addedEntry.id]){
                // Child was moved, add it to the list to get a diff for
                childrenThatMoved.push(addedEntry.id);
              } else {
                // Child was added
                treeDifference.summary.itemAdded[addedEntry.id] = addedEntry.treeId;
              }

              // Now check it's children
              let childIds = Object.keys(addedItem.childTreeHashes);
              if (childIds.length > 0){
                for(let childId of childIds){
                  childStack.push({id: childId, treeId: addedItem.childTreeHashes[childId]})
                }
              }
            }
          }

          // Add any new children that have been moved to the compare stack
          childrenThatMoved.reverse();
          childrenThatMoved.forEach((childId) => {
            compareStack.push(childId);
          });
        }

        if (diff.childrenDeleted){
          for(let deletedChild of diff.childrenDeleted) {

            // Recursively add deleted children that have not been moved
            let childStack : Array<{id:ItemIdType, treeId:TreeHashValueType}> = [ deletedChild ];
            while (childStack.length > 0){

              let deletedEntry = childStack.pop();

              switch (deletedEntry.id){
                case "Repository-Mount":
                case "Internal":
                  // Ignore references to a mount or internal root
                  continue;
              }

              let deletedItem = left[deletedEntry.id];
              if (!deletedItem) {
                // Don't need to process
                continue;
              }

              if (right[deletedEntry.id]){
                // Child was moved, it will be added to diff list where it is added
              } else {
                treeDifference.summary.itemDeleted[deletedEntry.id] = deletedEntry.treeId;

                // Now check it's children
                let childIds = Object.keys(deletedItem.childTreeHashes);
                if (childIds.length > 0){
                  for(let childId of childIds){
                    childStack.push({id: childId, treeId: deletedItem.childTreeHashes[childId]})
                  }
                }
              }
            }
          }
        }

        if (diff.childrenModified){
          let childrenModified = _.clone(diff.childrenModified);
          childrenModified.reverse();
          childrenModified.forEach((modifiedChild) => {
            compareStack.push(modifiedChild.id);
          });
        }
      } catch (err){
        console.log('*** Error: ' + err + ' while processing ' + diffId);
        console.log(err.stack);
      }
    }

    return treeDifference;
  }
}
