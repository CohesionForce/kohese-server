import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { Comparison, ChangeType } from './comparison.class';
import { ItemProxyComparison } from './item-proxy-comparison.class';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { ItemCache } from '../../../../common/src/item-cache';
import { TreeHashMap,
  TreeHashEntryDifference } from '../../../../common/src/tree-hash';

export class Compare {
  public static async compareCommits(baseCommitId: string, changeCommitId: string,
    dynamicTypesService: DynamicTypesService): Promise<Array<Comparison>> {
    let comparisons: Array<ItemProxyComparison> = [];
    let cache: ItemCache = TreeConfiguration.getItemCache();
    let diff: any = TreeHashMap.diff(await cache.getTreeHashMap(baseCommitId),
      await cache.getTreeHashMap(changeCommitId));
    if (!diff.match) {
      for (let id in diff.details) {
        let comparison: ItemProxyComparison = await Compare.compareItems(id,
          baseCommitId, id, changeCommitId, dynamicTypesService);
        comparisons.push(comparison);
        
        let diffEntry: TreeHashEntryDifference = diff.details[id];
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

    comparisons.sort((oneComparison: ItemProxyComparison, anotherComparison:
      ItemProxyComparison) => {
      return oneComparison.changeObject.name - anotherComparison.changeObject.
        name;
    });

    return comparisons;
  }
  
  public static compareItems(baseId: string, baseCommitId: string, changeId:
    string, changeCommitId: string, dynamicTypesService: DynamicTypesService):
    Promise<ItemProxyComparison> {
    return new Promise<ItemProxyComparison>(async (resolve: (comparison:
      ItemProxyComparison) => void, reject: () => void) => {
      let itemCache: ItemCache = TreeConfiguration.getItemCache();
      let baseItem: any;
      if (baseCommitId === 'Unstaged') {
        let baseProxy: ItemProxy = TreeConfiguration.getWorkingTree().
          getProxyFor(baseId);
        baseItem = baseProxy.item;
        baseItem.kind = baseProxy.kind;
      } else if (baseCommitId === 'Staged') {
        let baseProxy: ItemProxy = TreeConfiguration.getStagedTree().
          getProxyFor(baseId);
        baseItem = baseProxy.item;
        baseItem.kind = baseProxy.kind;
      } else {
        let baseTreeHashMap: TreeHashMap = await itemCache.getTreeHashMap(
          baseCommitId);
        baseItem = await itemCache.getBlob(baseTreeHashMap[baseId].oid);
        if (baseItem) {
          baseItem = JSON.parse(JSON.stringify(baseItem));
        } else {
          baseItem = {
            id: baseId,
            name: 'Missing Item Version: ' + baseId
          };
        }
        baseItem.kind = baseTreeHashMap[baseId].kind;
      }
      
      let changeItem: any;
      if (changeCommitId === 'Unstaged') {
        let changeProxy: ItemProxy = TreeConfiguration.getWorkingTree().
          getProxyFor(changeId);
        changeItem = changeProxy.item;
        changeItem.kind = changeProxy.kind;
      } else if (changeCommitId === 'Staged') {
        let changeProxy: ItemProxy = TreeConfiguration.getStagedTree().
          getProxyFor(changeId);
        changeItem = changeProxy.item;
        changeItem.kind = changeProxy.kind;
      } else {
        let changeTreeHashMap: TreeHashMap = await itemCache.getTreeHashMap(
          changeCommitId);
        changeItem = await itemCache.getBlob(changeTreeHashMap[changeId].oid);
        if (changeItem) {
          changeItem = JSON.parse(JSON.stringify(changeItem));
        } else {
          changeItem = {
            id: changeId,
            name: 'Missing Item Version: ' + changeId
          };
        }
        changeItem.kind = changeTreeHashMap[changeId].kind;
      }
      
      let comparison: ItemProxyComparison = new ItemProxyComparison(baseItem,
        changeItem, dynamicTypesService);
      comparison.adjustPropertyValue = async (propertyValue: string, comparisonObject:
        any) => {
        let uuidValueProperty: boolean = Comparison.UUID_REGULAR_EXPRESSION.
          test(propertyValue);
        if (uuidValueProperty) {
          let item: any;
          if (comparisonObject === baseItem) {
            if (baseCommitId === 'Unstaged') {
              item = TreeConfiguration.getWorkingTree().getProxyFor(
                propertyValue).item;
            } else if (baseCommitId === 'Staged') {
              item = TreeConfiguration.getStagedTree().getProxyFor(
                propertyValue).item;
            } else {
              let treeHashMap: TreeHashMap = await itemCache.getTreeHashMap(
                baseCommitId);
              if (treeHashMap[propertyValue]) {
                item = await itemCache.getBlob(treeHashMap[propertyValue].oid);
              }
            }
          } else {
            if (changeCommitId === 'Unstaged') {
              item = TreeConfiguration.getWorkingTree().getProxyFor(
                propertyValue).item;
            } else if (changeCommitId === 'Staged') {
              item = TreeConfiguration.getStagedTree().getProxyFor(
                propertyValue).item;
            } else {
              let treeHashMap: TreeHashMap = await itemCache.getTreeHashMap(
                changeCommitId);
              if (treeHashMap[propertyValue]) {
                item = await itemCache.getBlob(treeHashMap[propertyValue].oid);
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
  
      await comparison.compare();
      resolve(comparison);
    });
  }
}
