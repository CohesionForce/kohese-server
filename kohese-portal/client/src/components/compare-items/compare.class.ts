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
    let baseTreeHashMap: TreeHashMap = await cache.getTreeHashMap(baseCommitId);
    let changeTreeHashMap: TreeHashMap = await cache.getTreeHashMap(changeCommitId);
    let diff: any = TreeHashMap.diff(baseTreeHashMap, changeTreeHashMap);
    if (!diff.match) {
      for (let id in diff.details) {
        let diffEntry: TreeHashEntryDifference = diff.details[id];
        let fromTree = await cache.getTree(diffEntry.treeHashChanged.fromTreeId);
        let baseItem = await cache.getBlob(fromTree.oid);
        if (!baseItem) {
          baseItem = {
            id: id,
            name: 'Missing Item Version: ' + id
          };
        }
        baseItem.kind = baseTreeHashMap[id].kind;

        let toTree = await cache.getTree(diffEntry.treeHashChanged.toTreeId);
        let changeItem = await cache.getBlob(toTree.oid);
        if (!changeItem) {
          changeItem = {
            id: id,
            name: 'Missing Item Version: ' + id
          };
        }
        changeItem.kind = changeTreeHashMap[id].kind;

        let comparison: ItemProxyComparison = new ItemProxyComparison(baseItem,
          changeItem, dynamicTypesService);

        // TODO: Why is an function pointer with an anonymous function being used here
        comparison.adjustPropertyValue = async (propertyValue: string, comparisonObject:
          any) => {
          let uuidValueProperty: boolean = Comparison.UUID_REGULAR_EXPRESSION.
            test(propertyValue);
          let treeHashMap: TreeHashMap = (comparisonObject === baseItem ?
            baseTreeHashMap : changeTreeHashMap);

          // TODO: What is he intent of this section of code?
          if (uuidValueProperty) {
            if (treeHashMap[propertyValue]) {
              let item: any = await cache.getBlob(treeHashMap[propertyValue].oid);
              propertyValue = 'Reference to ' + (item ? item.name : 'Missing ' +
                'Item Version: ' + propertyValue) + ' (' + propertyValue + ')';
            }
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
                  let item: any = await cache.getBlob(treeHashMap[elements[j]].oid);
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

        await comparison.compare();
        comparisons.push(comparison);
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
}
