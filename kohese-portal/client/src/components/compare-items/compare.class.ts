import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { Comparison, ChangeType } from './comparison.class';
import { ItemProxyComparison } from './item-proxy-comparison.class';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { ItemCache } from '../../../../common/src/item-cache';
import { TreeHashMap, TreeHashEntryDifference,  TreeHashMapDifference, ObjectHashValueType, ItemIdType} from '../../../../common/src/tree-hash';
import * as _ from 'underscore';

export class Compare {
  public static async compareCommits(baseCommitId: string, changeCommitId: string,
    dynamicTypesService: DynamicTypesService): Promise<Array<Comparison>> {
    let comparisons: Array<ItemProxyComparison> = [];
    let cache: ItemCache = ItemCache.getItemCache();
    let baseCommit = await cache.getCommit(baseCommitId);
    let changeCommit = await cache.getCommit(changeCommitId);

    if (baseCommit && changeCommit) {
      let diff: TreeHashMapDifference;
      let changeCommitParents = await changeCommit.getParentCommits();
      if (baseCommit === changeCommitParents[0]){
        diff = await changeCommit.diff();
      } else {
        console.log('$$$ Base commit is not a parent: ' + baseCommitId + ' - ' + changeCommitId);
        let baseTreeHashMap: TreeHashMap = await baseCommit.getTreeHashMap();
        let changeTreeHashMap: TreeHashMap = await changeCommit.getTreeHashMap();
        diff = TreeHashMap.diff(baseTreeHashMap, changeTreeHashMap);
      }
      let afterDiff = Date.now();

      if (!diff.match) {
        for (let itemId in diff.details) {
          let diffEntry: TreeHashEntryDifference = diff.details[itemId];

          let baseBlobKind = diffEntry.left.kind;
          let baseBlobOID = diffEntry.left.oid;
          let changeBlobKind = diffEntry.right.kind;
          let changeBlobOID = diffEntry.right.oid;
          let beforeItemDiff = Date.now();
          let comparison: ItemProxyComparison = await Compare.compareItems(itemId, baseBlobKind, baseBlobOID, 
            itemId, changeBlobKind, changeBlobOID, dynamicTypesService);
          let afterItemDiff = Date.now();
          let itemDiffDelta = (afterItemDiff-beforeItemDiff)/1000;
          if (itemDiffDelta > 1.0) {
            // TODO: Need to determine how to reduce time required for large item diffs
            console.log('### Processed diff for commit: ' + changeCommitId + ' - itemId: ' + itemId + ' - baseOID: ' + baseBlobOID + ' - changeOID ' + changeBlobOID + ' - took: ' + itemDiffDelta);
          } 
          comparisons.push(comparison);

          if (diffEntry.contentChanged) {
            comparison.changeTypes.push(ChangeType.CONTENT_CHANGED);
          }
      
          if (diffEntry.kindChanged) {
            comparison.changeTypes.push(ChangeType.TYPE_CHANGED);
          }
      
          if (diffEntry.parentChanged) {
            comparison.changeTypes.push(ChangeType.PARENT_CHANGED);
          }
      
          if (diffEntry.childrenAdded) {
            comparison.changeTypes.push(ChangeType.CHILD_ADDED);
          }
      
          if (diffEntry.childrenModified) {
            comparison.changeTypes.push(ChangeType.CHILD_MODIFIED);
          }
      
          if (diffEntry.childrenDeleted) {
            comparison.changeTypes.push(ChangeType.CHILD_REMOVED);
          }
      
          if (diffEntry.childrenReordered) {
            comparison.changeTypes.push(ChangeType.CHILDREN_REORDERED);
          }
        }
        
        for (let j: number = 0; j < comparisons.length; j++) {
          let comparison: ItemProxyComparison = comparisons[j];
          let path: Array<string> = [];
          let parentId: string = comparison.changeObject.parentId;
          while (parentId) {
            let k: number = 0;
            while (k < comparisons.length) {
              let commitComparison: ItemProxyComparison = comparisons[k];
              if (commitComparison.changeObject.id === parentId) {
                path.push(commitComparison.changeObject.name);
                parentId = commitComparison.changeObject.parentId;
                break;
              }
              k++;
            }
  
            if (k === comparisons.length) {
              break;
            }
          }
  
          path.reverse();
          comparison.path = path.join(' \u2192 ');
        }
      }
    }

    comparisons.sort((oneComparison: ItemProxyComparison, anotherComparison:
      ItemProxyComparison) => {
      return oneComparison.changeObject.name - anotherComparison.changeObject.
        name;
    });

    return comparisons;
  }
  
  public static compareItems(baseId: ItemIdType, baseBlobKind: string, baseBlobOID: ObjectHashValueType,
    changeId: string, changeBlobKind: string, changeBlobOID: ObjectHashValueType, dynamicTypesService:
    DynamicTypesService): Promise<ItemProxyComparison> {
    return new Promise<ItemProxyComparison>(async (resolve: (comparison:
      ItemProxyComparison) => void, reject: () => void) => {
      let itemCache: ItemCache = ItemCache.getItemCache();
      let baseItem: any;
      if (baseBlobOID) {
        baseItem = _.clone(await itemCache.getBlob(baseBlobOID));
        if (baseItem) {
          baseItem = JSON.parse(JSON.stringify(baseItem));
        } else {
          baseItem = {
            id: baseId,
            name: 'Missing Item Version: ' + baseId
          };
        }
        // TODO: Should not be storing kind in baseBlob
        baseItem.kind = baseBlobKind;
      } else {
        let baseProxy: ItemProxy = TreeConfiguration.getWorkingTree().
          getProxyFor(baseId);
        if (!baseProxy) {
          baseProxy = TreeConfiguration.getStagedTree().getProxyFor(baseId);
        }
        
        if (baseProxy) {
          baseItem = baseProxy.item;
          baseItem.kind = baseProxy.kind;
        }
      }
      
      let changeItem: any;
      if (changeBlobOID) {
        changeItem = _.clone(await itemCache.getBlob(changeBlobOID));
        if (changeItem) {
          changeItem = JSON.parse(JSON.stringify(changeItem));
        } else {
          changeItem = {
            id: changeId,
            name: 'Missing Item Version: ' + changeId
          };
        }
        // TODO: Should not be storing kind in changeBlob
        changeItem.kind = changeBlobKind;
      } else {
        let changeProxy: ItemProxy = TreeConfiguration.getWorkingTree().
          getProxyFor(changeId);
        if (!changeProxy) {
          changeProxy = TreeConfiguration.getStagedTree().getProxyFor(
            changeId);
        }
        
        if (changeProxy) {
          changeItem = changeProxy.item;
          changeItem.kind = changeProxy.kind;
        }
      }
      
      let comparison: ItemProxyComparison = new ItemProxyComparison(baseItem,
        changeItem, dynamicTypesService);
      comparison.adjustPropertyValue = async (propertyValue: string, comparisonObject:
        any) => {
        // TODO: Need to remove restriction for only comparing items with UUID as id
        let uuidValueProperty: boolean = Comparison.UUID_REGULAR_EXPRESSION.
          test(propertyValue);
        if (uuidValueProperty) {
          let item: any;
          if (comparisonObject === baseItem) {
            if (baseBlobOID) {
              item = await itemCache.getBlob(baseBlobOID);
            } else {
              let proxy: ItemProxy = TreeConfiguration.getWorkingTree().
                getProxyFor(propertyValue);
              if (!proxy) {
                proxy = TreeConfiguration.getStagedTree().getProxyFor(
                  propertyValue);
              }
              
              if (proxy) {
                item = proxy.item;
              }
            }
          } else {
            if (changeBlobOID) {
              item = await itemCache.getBlob(changeBlobOID);
            } else {
              let proxy: ItemProxy = TreeConfiguration.getWorkingTree().
                getProxyFor(propertyValue);
              if (!proxy) {
                proxy = TreeConfiguration.getStagedTree().getProxyFor(
                  propertyValue);
              }
              
              if (proxy) {
                item = proxy.item;
              }
            }
          }
          
          propertyValue = 'Reference to ' + (item ? item.name : 'Missing ' +
            'Item Version: ' + propertyValue) + ' (' + propertyValue + ')';
        } else {
          let elements: Array<string> = propertyValue.split(',');
          uuidValueProperty = true;
          for (let j: number = 0; j < elements.length; j++) {
            if (!Comparison.UUID_REGULAR_EXPRESSION.test(elements[j])) {
              uuidValueProperty = false;
              break;
            }
          }
  
          if (uuidValueProperty) {
            /*let propertyValueReplacement: Array<string> = [];
            for (let j: number = 0; j < elements.length; j++) {
              if (treeHashMap[elements[j]]) {
                let item: any = await itemCache.getBlob(treeHashMap[elements[j]].
                  oid);
                propertyValueReplacement.push('Reference to ' + (item ? item.
                  name : 'Missing Item Version: ' + propertyValue) + ' (' +
                  propertyValue + ')');
              }
            }
    
            propertyValue = propertyValueReplacement.join('\n');*/
          }
        }
  
        return propertyValue;
      };
  
      if(!_.isEqual(baseItem, changeItem)){
        // Only compare the items if they are not the same
        await comparison.compare();
      }
      resolve(comparison);
    });
  }
}
