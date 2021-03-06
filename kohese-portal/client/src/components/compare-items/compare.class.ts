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


// Angular

// Other External Dependencies
import * as _ from 'underscore';

// Kohese
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { Comparison, ChangeType } from './comparison.class';
import { ItemProxyComparison } from './item-proxy-comparison.class';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { ItemCache } from '../../../../common/src/item-cache';
import { TreeHashMap, TreeHashEntryDifference, TreeHashMapDifference, ItemIdType } from '../../../../common/src/tree-hash';


export class Compare {

  public static async compareCommits(baseCommitId: string, changeCommitId: string,
    dynamicTypesService: DynamicTypesService, deferPropertyDiffs : boolean = false): Promise<Array<Comparison>> {
    let comparisons: Array<ItemProxyComparison> = [];
    let cache: ItemCache = ItemCache.getItemCache();
    let baseCommit = await cache.getCommit(baseCommitId);
    let changeCommit = await cache.getCommit(changeCommitId);

    if (baseCommit && changeCommit) {
      let diff: TreeHashMapDifference;
      let changeCommitParents = await changeCommit.getParentCommits();
      if (baseCommit === changeCommitParents[0]){
        diff = await changeCommit.newDiff();
      } else {
        console.log('$$$ Base commit is not a parent: ' + baseCommitId + ' - ' + changeCommitId);
        let baseTreeHashMap: TreeHashMap = await baseCommit.getTreeHashMap();
        let changeTreeHashMap: TreeHashMap = await changeCommit.getTreeHashMap();
        diff = TreeHashMap.diff(baseTreeHashMap, changeTreeHashMap);
      }

      if (!diff.match) {
        // Construct Comparisons for Every Item with a Difference
        for (let itemId in diff.details) {
          let diffEntry: TreeHashEntryDifference = diff.details[itemId];

          let baseBlobKind;
          let baseBlobOID;
          let baseBlob;
          if (diffEntry.left) {
            baseBlobKind = diffEntry.left.kind;
            baseBlobOID = diffEntry.left.oid;
            baseBlob = await cache.getBlob(baseBlobOID);
          }

          let changeBlobKind;
          let changeBlobOID;
          let changeBlob;
          if (diffEntry.right) {
            changeBlobKind = diffEntry.right.kind;
            changeBlobOID = diffEntry.right.oid;
            changeBlob = await cache.getBlob(changeBlobOID);
          }

          let beforeItemDiff = Date.now();
          let comparison: ItemProxyComparison = await Compare.compareItems(
            itemId,
            baseBlobKind,
            baseBlob,
            itemId,
            changeBlobKind,
            changeBlob,
            dynamicTypesService,
            deferPropertyDiffs);
          let afterItemDiff = Date.now();
          let itemDiffDelta = (afterItemDiff-beforeItemDiff)/1000;
          if (itemDiffDelta > 1.0) {
            // TODO: Need to determine how to reduce time required for large item diffs
            console.log('### Processed diff for commit: ' + changeCommitId + ' - itemId: ' + itemId + ' - baseOID: ' + baseBlobOID + ' - changeOID ' + changeBlobOID + ' - took: ' + itemDiffDelta);
          }
          comparisons.push(comparison);

          if (diff.summary.itemAdded[itemId]) {
            comparison.changeTypes.push(ChangeType.ITEM_ADDED);
          }

          if (diff.summary.itemDeleted[itemId]) {
            comparison.changeTypes.push(ChangeType.ITEM_REMOVED);
          }

          if (diffEntry.contentChanged) {
            comparison.changeTypes.push(ChangeType.CONTENT_CHANGED);
          }

          if (diffEntry.kindChanged) {
            comparison.changeTypes.push(ChangeType.TYPE_CHANGED);
          }

          if (diffEntry.parentChanged) {
            comparison.changeTypes.push(ChangeType.PARENT_CHANGED);
          }

          if (diffEntry.childrenModified) {
            comparison.changeTypes.push(ChangeType.CHILD_MODIFIED);
          }

          if (diffEntry.childrenAdded) {
            comparison.changeTypes.push(ChangeType.CHILD_ADDED);
            for (let childEntry of diffEntry.childrenAdded) {
              // Look in the summary
              let parentChanged = diff.summary.parentChanged[childEntry.id];
              let childAddedTreeHashDiff = diff.details[childEntry.id];
              let childBlobAdded = await ItemCache.getItemCache().getBlob(childAddedTreeHashDiff.right.oid);
              if (parentChanged) {
                // Indicate child moved
                let oldParent = parentChanged.fromParentId ? parentChanged.fromParentId : 'ROOT';
                let oldParentOID = diff.details[oldParent].left.oid;
                let oldParentBlob = await ItemCache.getItemCache().getBlob(oldParentOID);
                comparison.childrenMoved.push({
                  id: childEntry.id,
                  name: childBlobAdded.name,
                  fromParentId: oldParentBlob.id,
                  fromParentName: oldParentBlob.name,
                  toParentId: itemId,
                  toParentName: changeBlob ? changeBlob.name : baseBlob.name
                });
              } else {
                // Indicate which child was added
                comparison.childrenAdded.push({
                  id: childEntry.id,
                  name: childBlobAdded.name
                });
              }
            }
          }

          if (diffEntry.childrenDeleted) {
            comparison.changeTypes.push(ChangeType.CHILD_REMOVED);
            for (let childEntry of diffEntry.childrenDeleted) {
              // Look in the summary
              let parentChanged = diff.summary.parentChanged[childEntry.id];
              let childRemovedTreeHashDiff = diff.details[childEntry.id];
              let childBlobRemoved = await ItemCache.getItemCache().getBlob(childRemovedTreeHashDiff.left.oid)
              if (parentChanged) {
                // Indicate child moved; Only need the side to which it was moved.
                let newParent = parentChanged.toParentId ? parentChanged.toParentId : 'ROOT';
                let newParentOID = diff.details[newParent].right.oid;
                let newParentBlob = await ItemCache.getItemCache().getBlob(newParentOID);
                comparison.childrenMoved.push({
                  id: childEntry.id,
                  name: childBlobRemoved.name,
                  fromParentId: itemId,
                  fromParentName: changeBlob ? changeBlob.name : baseBlob.name,
                  toParentId: newParentBlob.id,
                  toParentName: newParentBlob.name,
                });
              } else {
                // Indicate which child was deleted
                comparison.childrenRemoved.push({
                  id: childEntry.id,
                  name: childBlobRemoved.name
                });
              }
            }
          }

          if (diffEntry.childrenReordered) {
            comparison.changeTypes.push(ChangeType.CHILDREN_REORDERED);
          }
        }

        // Determine the Path to Each Item After All Items Have Been Processed
        for (let j: number = 0; j < comparisons.length; j++) {
          let comparison: ItemProxyComparison = comparisons[j];
          let path: Array<Comparison> = [];
          let parentId: string = comparison.changeObject ? comparison.changeObject.parentId : comparison.baseObject.parentId;
          while (parentId) {
            let k: number = 0;
            while (k < comparisons.length) {
              let commitComparison: ItemProxyComparison = comparisons[k];
              if (commitComparison.changeObject && (commitComparison.changeObject.id === parentId)) {
                // Associate with changed parent
                path.push(commitComparison);
                parentId = commitComparison.changeObject.parentId;
                break;
              } else if (commitComparison.baseObject && (commitComparison.baseObject.id === parentId)) {
                // Associate with deleted parent
                path.push(commitComparison);
                parentId = commitComparison.baseObject.parentId;
                break;
              }
              k++;
            }

            if (k === comparisons.length) {
              break;
            }
          }

          // Paths intially built from the bottom-up. Reversed for correct order.
          path.reverse();
          comparison.path = path;
        }
      }
    }

    comparisons.sort((oneComparison: ItemProxyComparison, anotherComparison:
      ItemProxyComparison) => {
      let leftName = oneComparison.changeObject ? oneComparison.changeObject.name : oneComparison.baseObject.name;
      let rightName = anotherComparison.changeObject ? anotherComparison.changeObject.name : anotherComparison.baseObject.name;
      return leftName - rightName;
    });

    return comparisons;
  }

  public static compareItems(
    baseId: ItemIdType, baseBlobKind: string, baseBlob: any,
    changeId: string, changeBlobKind: string, changeBlob: any,
    dynamicTypesService: DynamicTypesService, deferPropertyDiffs : boolean = false): Promise<ItemProxyComparison> {
      return new Promise<ItemProxyComparison>(async (resolve: (comparison: ItemProxyComparison) => void, reject: () => void) => {

        let baseItem: any;
        if (baseBlob) {
          baseItem = JSON.parse(JSON.stringify(baseBlob));
          // TODO: Should not be storing kind in baseBlob
          baseItem.kind = baseBlobKind;
        }

        let changeItem: any;
        if (changeBlob) {
          changeItem = JSON.parse(JSON.stringify(changeBlob));
          // TODO: Should not be storing kind in changeBlob
          changeItem.kind = changeBlobKind;
        }


        let comparison: ItemProxyComparison = new ItemProxyComparison(baseItem, changeItem, dynamicTypesService);
        comparison.adjustPropertyValue = async (propertyValue: string, comparisonObject: any) => {
          // TODO: Need to remove restriction for only comparing items with UUID as id
          let uuidValueProperty: boolean = Comparison.UUID_REGULAR_EXPRESSION.test(propertyValue);
          if (uuidValueProperty) {
            let item: any;

            // TODO: Needs to be adjusted to use the item id lookup for the correct tree configuration
            let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(propertyValue);
            if (!proxy) {
              proxy = TreeConfiguration.getStagedTree().getProxyFor(propertyValue);
            }

            if (proxy) {
              item = proxy.item;
            }

            propertyValue = 'Reference to ' + (item ? item.name : 'Missing ' + 'Item Version: ' + propertyValue) + ' (' + propertyValue + ')';
          }

          return propertyValue;
        };

        if(!_.isEqual(baseItem, changeItem)){
          // Only compare the items if they are not the same
          await comparison.compare(deferPropertyDiffs);
        }
        resolve(comparison);
      });
  }
}
