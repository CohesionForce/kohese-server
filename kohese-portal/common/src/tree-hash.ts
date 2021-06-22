/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
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


import * as  _ from 'underscore';

export type ObjectHashValueType = string;
export type TreeHashValueType = string;
export type ItemIdType = string;

export class TreeHashMapDifference {
  match : boolean;
  summary: {
    roots: {
      added: Array<ItemIdType>,
      deleted: Array<ItemIdType>,
      common: Array<ItemIdType>
    },
    kindChanged: {
      [id:string] : {
        fromKind : string,
        toKind:  string
      }
    },
    contentChanged: {
      [id:string] : {
        fromOID: ObjectHashValueType,
        toOID:  ObjectHashValueType
      }
    },
    parentChanged: {
      [id:string] : {
        fromParentId : ItemIdType,
        toParentId:  ItemIdType
      }
    },
    itemAdded: {
      [id:string] : ObjectHashValueType
    },
    itemDeleted: {
      [id:string] : ObjectHashValueType
    },
    itemMissing: {
      leftMissing: Array<ItemIdType>,
      rightMissing: Array<ItemIdType>
    }
  };
  details: {
    [id:string] : TreeHashEntryDifference
  }
};

export class TreeHashMap {
  [id:string] : TreeHashEntry

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  static diff(left : TreeHashMap, right : TreeHashMap) : TreeHashMapDifference {

    let leftRoots : Array<ItemIdType> = [ Object.keys(left)[0] ];
    for (let itemId in left){
      let entry :TreeHashEntry = left[itemId];

      switch (entry.kind){
        case "Repository":
        case "Internal":
          leftRoots.push(itemId);
      }
    }

    let rightRoots : Array<ItemIdType> = [ Object.keys(right)[0] ];
    for (let itemId in right){
      let entry :TreeHashEntry = right[itemId];

      switch (entry.kind){
        case "Repository":
        case "Internal":
        rightRoots.push(itemId);
      }
    }

    leftRoots = _.uniq(leftRoots);
    rightRoots = _.uniq(rightRoots);
    let sortedLeftRoots = _.clone(leftRoots).sort();
    let sortedRightRoots = _.clone(rightRoots).sort();
    let addedRoots = _.difference(sortedRightRoots, sortedLeftRoots);
    let deletedRoots = _.difference(sortedLeftRoots, sortedRightRoots);
    let commonRoots = _.intersection(leftRoots, rightRoots);


    let compareStack : Array<ItemIdType> = _.clone(commonRoots).reverse();

    let result : TreeHashMapDifference = {
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

    while (compareStack.length){
      let diffId = compareStack.pop();
      try {

        let leftVersion = left[diffId];
        let rightVersion = right[diffId];

        if (!leftVersion){
          result.summary.itemMissing.leftMissing.push(diffId);
          result.match = false;
        }
        if(!rightVersion){
          result.summary.itemMissing.rightMissing.push(diffId);
          result.match = false;
        }
        if(!leftVersion || !rightVersion){
          continue;
        }

        let diff = TreeHashEntry.diff(leftVersion, rightVersion);

        if (!diff.match){
          result.details[diffId] = diff;
          result.match = false;
        }

        if (diff.kindChanged){
          result.summary.kindChanged[diffId] = {
            fromKind :diff.kindChanged.fromKind,
            toKind: diff.kindChanged.toKind
          };
        }

        if (diff.contentChanged){
          result.summary.contentChanged[diffId] = {
            fromOID: diff.contentChanged.fromOID,
            toOID: diff.contentChanged.toOID
          };
        }

        if (diff.parentChanged){
          result.summary.parentChanged[diffId] = {
            fromParentId :diff.parentChanged.fromId,
            toParentId: diff.parentChanged.toId
          };
        }

        if (diff.childrenAdded){
          let childrenThatMoved : Array<ItemIdType> = [];
          diff.childrenAdded.forEach((addedChild) => {

            // Recursively add deleted children that have not been moved
            let childStack : Array<{id:ItemIdType, treeId:TreeHashValueType}> = [ addedChild ];
            while (childStack.length > 0){

              let addedEntry = childStack.pop();
              let addedItem = right[addedEntry.id];

              if (left[addedEntry.id]){
                // Child was moved, add it to the list to get a diff for
                childrenThatMoved.push(addedEntry.id);
              } else {
                // Child was added
                result.summary.itemAdded[addedEntry.id] = addedEntry.treeId;
                let childEntry = right[addedEntry.id];
                result.details[addedEntry.id] = {
                  match: false,
                  left: undefined,
                  right: childEntry,
                  treeHashChanged: {
                    fromTreeId: undefined,
                    toTreeId: childEntry.treeHash
                  },
                  kindChanged: {
                    fromKind: undefined,
                    toKind: childEntry.kind
                  },
                  contentChanged: {
                    fromOID: undefined,
                    toOID: childEntry.oid
                  }
                }

              }

              // Now check it's children
              let childIds = Object.keys(addedItem.childTreeHashes);
              if (childIds.length > 0){
                for(let idx in childIds){
                  let childId = childIds[idx];
                  childStack.push({id: childId, treeId: addedItem.childTreeHashes[childId]})
                }
              }
            }
          });

          // Add any new children that have been moved to the compare stack
          childrenThatMoved.reverse();
          childrenThatMoved.forEach((childId) => {
            compareStack.push(childId);
          });
        }

        if (diff.childrenDeleted){
          diff.childrenDeleted.forEach((deletedChild) => {

            // Recursively add deleted children that have not been moved
            let childStack : Array<{id:ItemIdType, treeId:TreeHashValueType}> = [ deletedChild ];
            while (childStack.length > 0){

              let deletedEntry = childStack.pop();
              let deletedItem = left[deletedEntry.id];

              if (right[deletedEntry.id]){
                // Child was moved, it will be added to diff list where it is added
              } else {
                result.summary.itemDeleted[deletedEntry.id] = deletedEntry.treeId;
                let childEntry = left[deletedEntry.id];
                result.details[deletedEntry.id] = {
                  match: false,
                  left: childEntry,
                  right: undefined,
                  treeHashChanged: {
                    fromTreeId: childEntry.treeHash,
                    toTreeId: undefined
                  },
                  kindChanged: {
                    fromKind: childEntry.kind,
                    toKind: undefined
                  },
                  contentChanged: {
                    fromOID: childEntry.oid,
                    toOID: undefined
                  }
                }


                // Now check it's children
                let childIds = Object.keys(deletedItem.childTreeHashes);
                if (childIds.length > 0){
                  for(let idx in childIds){
                    let childId = childIds[idx];
                    childStack.push({id: childId, treeId: deletedItem.childTreeHashes[childId]})
                  }
                }
              }
            }
          });
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

    return result;
  }
}

export class TreeHashEntryDifference {
  match: boolean;
  left?: TreeHashEntry;
  right?: TreeHashEntry;
  treeHashChanged?: {fromTreeId: TreeHashValueType, toTreeId: TreeHashValueType};
  kindChanged?: {fromKind:string, toKind: string};
  contentChanged?: {fromOID: TreeHashValueType, toOID: TreeHashValueType};
  parentChanged?: {fromId: ItemIdType, toId: ItemIdType};
  childrenAdded?: Array<{id: ItemIdType, treeId: TreeHashValueType}>;
  childrenDeleted?: Array<{id: ItemIdType, treeId: TreeHashValueType}>;
  childrenModified?: Array<{id:ItemIdType, fromTreeId: TreeHashValueType, toTreeId: TreeHashValueType}>;
  childrenReordered?: Array<{index:number, fromId?: ItemIdType, toId?: ItemIdType}>;
};

export class TreeHashEntry {
  public kind : string;
  public oid : TreeHashValueType;
  public childTreeHashes : { [ id : string ] : TreeHashValueType };
  public treeHash : TreeHashValueType;
  public parentId? : ItemIdType;

  static diff(left: TreeHashEntry, right: TreeHashEntry) : TreeHashEntryDifference {
    let diff : TreeHashEntryDifference = {match: _.isEqual(left,right)};

    if (!left){
      console.log('$$$ Left is undefined: ');
      console.log(right);
    }

    if (!right){
      console.log('$$$ Right is undefined: ');
      console.log(left);
    }

    if (!diff.match){
      // Determine the differences
      diff.left = _.clone(left);
      diff.right = _.clone(right);

      diff.treeHashChanged = {
        fromTreeId: left.treeHash,
        toTreeId: right.treeHash
      }

      if (left.kind !== right.kind){
        diff.kindChanged = {
          fromKind: left.kind,
          toKind: right.kind
        };
      }

      if(left.oid !== right.oid){
        diff.contentChanged = {
          fromOID: left.oid,
          toOID: right.oid
        }
      }

      if(left.parentId !== right.parentId){
        diff.parentChanged = {
          fromId: left.parentId,
          toId: right.parentId
        }
      }

      if(!_.isEqual(left.childTreeHashes, right.childTreeHashes)){
        // Found structural difference at child level
        var leftChildren = left.childTreeHashes;
        var rightChildren = right.childTreeHashes;
        var leftChildIds = Object.keys(leftChildren);
        var rightChildIds = Object.keys(rightChildren);
        var leftChildIdsSorted = Object.keys(leftChildren).sort();
        var rightChildIdsSorted = Object.keys(rightChildren).sort();
        var commonChildIds = _.intersection(leftChildIdsSorted, rightChildIdsSorted);

        let addedChildren = _.difference(rightChildIdsSorted, leftChildIdsSorted);
        let deletedChildren = _.difference(leftChildIdsSorted, rightChildIdsSorted);

        if (addedChildren.length) {
          diff.childrenAdded = [];
          addedChildren.forEach((childId) => {
            diff.childrenAdded.push({
              id: childId,
              treeId: rightChildren[childId]
            });
          });
        }

        if (deletedChildren.length){
          diff.childrenDeleted = [];
          deletedChildren.forEach((childId) => {
            diff.childrenDeleted.push({
              id: childId,
              treeId: leftChildren[childId]
            });
          });
        }

        // Check for different tree hashes
        var changedChildren = {};
        commonChildIds.forEach((childId) => {
          var leftTreeId = leftChildren[childId];
          var rightTreeId = rightChildren[childId];
          if (leftTreeId !== rightTreeId){
            if (!diff.childrenModified) {
              diff.childrenModified = [];
            }
            diff.childrenModified.push({
              id: childId,
              fromTreeId: leftTreeId,
              toTreeId: rightTreeId
            });
          }
        });

        // Check for different order
        var reorderedChildren = {};
        for (var idx = 0; idx < leftChildIds.length; idx++){
          if(leftChildIds[idx] !== rightChildIds[idx]){
            if(!diff.childrenReordered){
              diff.childrenReordered = [];
            }
            diff.childrenReordered.push({
              index: idx,
              fromId: leftChildIds[idx],
              toId: rightChildIds[idx]
            });
          }
        }
      }
    }
    return diff;
  }
}
