import * as  _ from 'underscore';

export type TreeHashValueType = string;
export type ItemIdType = string;

export class TreeHashEntryDifference {
  match : boolean;
  treeHashChanged? : {fromTreeId: TreeHashValueType, toTreeId: TreeHashValueType};
  kindChanged? : {fromKind:string, toKind: string};
  contentChanged? : {fromOID: TreeHashValueType, toOID: TreeHashValueType};
  parentChanged? : {fromId: ItemIdType, toId: ItemIdType};
  childrenAdded?  : Array<{id: ItemIdType, treeId: TreeHashValueType}>;
  childrenDeleted? : Array<{id: ItemIdType, treeId: TreeHashValueType}>;
  childrenModified? : Array<{id:ItemIdType, fromTreeId: TreeHashValueType, toTreeId: TreeHashValueType}>;
  childrenReordered? : Array<{index:number, fromId: ItemIdType, toId: ItemIdType}>;
};

export class TreeHashEntry {
  public kind : string;
  public oid : TreeHashValueType;
  public childTreeHashes : { [ id : string ] : TreeHashValueType };
  public treeHash : TreeHashValueType;
  public parentId? : ItemIdType;

  static diff(left: TreeHashEntry, right: TreeHashEntry) : TreeHashEntryDifference {
    let diff : TreeHashEntryDifference = {match: _.isEqual(left,right)};

    if (!diff.match){
      // Determine the differences

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
