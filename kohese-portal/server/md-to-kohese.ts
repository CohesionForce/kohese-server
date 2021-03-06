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


/** Parses a provided markdown file and renders it into kohese items, then
 *  sends them to a local kohese server via rest interface.
 *
 *  User must set the file and rootItem parameters below.
 */
import * as fs from 'fs';
var commonmark = require('commonmark');
var renderFunc = require('./md-to-kohese-helper');
import { ItemProxy } from '../common/src/item-proxy';

function mdToKohese(filePath: string, parent: any, producePreamble: boolean):
  Array<any> {
  try {
    return convertMarkdownToItems(fs.readFileSync(filePath, 'utf8'), parent,
      producePreamble);
  } catch(err) {
    console.log('Error reading input file ' + filePath);
    return [];
  }
}
module.exports.mdToKohese = mdToKohese;

function convertMarkdownToItems(markdown: string, parent: any, producePreamble:
  boolean): Array<any> {
  var parsed = new commonmark.Parser().parse(markdown);
  var walker = parsed.walker();

  var item = new ItemProxy('Item', parent).item;

  var addedIds = [{
    id: item.id,
    name: item.name
  }];
  var lineage = [item.id];

  var tmpIdCounter = 0;
  var koheseItem;
  var readyToUpsert = false;
  var itemMap = {};
  itemMap[item.id] = item;

  var render = renderFunc();
  var event = walker.next();
  while(event) {
    // console.log('Event: ' + event.node.type + ' Entering: ' + event.entering);
    if(event.entering && event.node.type === 'document') {
      event = walker.next();
      // Check if document begins with heading. If not, make an item.
      if(!(event.entering && event.node.type === 'heading') &&
        producePreamble) {
        koheseItem = {
            name: 'Preamble',
            description: '',
            parentId: lineage[0],
            modifiedBy: parent.modifiedBy,
            modifiedOn: parent.modifiedOn,
            createdBy: parent.modifiedBy,
            createdOn: parent.modifiedOn,
            itemIds: []
        };
        readyToUpsert = true;
      }
    }

    if(event.entering && event.node.type === 'heading') {
      // Entering a new header, check if an item is ready to be pushed
      if(readyToUpsert) {
        upsert(koheseItem, render, addedIds, lineage, itemMap);
        readyToUpsert = false;
      }

      // Handle increasing jumps in level that are greater than one
      var parentId = undefined;
      for (var i = event.node.level - 1; !parentId && (i >= 0); i--) {
        parentId = lineage[i];
      }

      koheseItem = {
          name: '',
          description: '',
          parentId: parentId,
          modifiedBy: parent.modifiedBy,
          modifiedOn: parent.modifiedOn,
          createdBy: parent.modifiedBy,
          createdOn: parent.modifiedOn,
          itemIds: [],
          tmpId: ++tmpIdCounter
      };
      lineage[event.node.level] = koheseItem.tmpId;
      readyToUpsert = true;

      render.clearBuffer();
      event = walker.next();

      // Throw away everything that isn't text before leaving the heading.
      while(event.node.type !== 'heading') {
        if(event.entering && event.node.type === 'text') {
          koheseItem.name += event.node.literal;
        }
        event = walker.next();
      }

      if(koheseItem.name === '') {
        koheseItem.name = 'No Heading Title Found';
      }
    } else if(render[event.node.type]) {
      render[event.node.type](event.node, event.entering);
    } else if(!event.entering && event.node.type === 'document') {
      // Push a straggling kohese item
      if(readyToUpsert) {
        upsert(koheseItem, render, addedIds, lineage, itemMap);
        readyToUpsert = false;
      }
    } else if(event.node.type !== 'document' && event.node.type !== 'heading') {
      // Already handling document and heading events
      console.log('!!! Unknown/Unhandled event: ' + event.node.type +
          ' - Entering: ' + event.entering);
    }

    event = walker.next();
  }

  for (var id in itemMap) {
    if (itemMap[id].itemIds.length > 0) {
      var proxy = ItemProxy.getWorkingTree().getProxyFor(id);
      proxy.updateItem(proxy.kind, itemMap[id]);
    }
  }

  return addedIds;
}
module.exports.convertMarkdownToItems = convertMarkdownToItems;

function upsert(koheseItem, render, idList, lineageMap, itemMap) {
  koheseItem.description = render.getBuffer();
  var item;
  if (!koheseItem.tmpId) {
    item = new ItemProxy('Item', koheseItem).item;
    idList.push(item.id);
    itemMap[item.parentId].itemIds.push(item.id);
  } else {
    for (var i = 0; i < lineageMap.length; i++) {
      if (lineageMap[i] === koheseItem.tmpId) {
        delete koheseItem.tmpId;
        item = new ItemProxy('Item', koheseItem).item;
        idList.push({
          id: item.id,
          name: item.name
        });
        lineageMap[i] = item.id;

        for (var id in itemMap) {
          if (JSON.stringify(id) === JSON.stringify(koheseItem.parentId)) {
            itemMap[id].itemIds.push(item.id);
            break;
          }
        }

        itemMap[item.id] = item;

        break;
      }
    }
  }
}
