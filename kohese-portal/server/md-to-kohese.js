/** Parses a provided markdown file and renders it into kohese items, then
 *  sends them to a local kohese server via rest interface.
 *  
 *  User must set the file and rootItem parameters below.
 */
var fs = require('fs');
var util = require('util');
var commonmark = require('commonmark');
var http = require('http');
var renderFunc = require('./md-to-kohese-helper.js');

var accessToken;

function mdToKohese(filePath, rootItem) {
  var text;

  try {
    text = fs.readFileSync(filePath, {encoding: 'utf8', flag: 'r'});
  } catch(err) {
    console.log('Error reading input file ' + filePath);
    return;
  }
  
  var parsed = new commonmark.Parser().parse(text);
  var walker = parsed.walker();

  var item = global.app.models["Item"].upsert(rootItem, {}, function () {});
  var addedIds = [item.id];
  var lineage = [item.id];
  
  var tmpIdCounter = 0;
  var koheseItem;
  var readyToUpsert = false;

  var render = renderFunc();
  var event;
  while(event = walker.next()) {
    // console.log('Event: ' + event.node.type + ' Entering: ' + event.entering);
    if(event.entering && event.node.type === 'document') {
      event = walker.next();
      // Check if document begins with heading. If not, make an item.
      if(!(event.entering && event.node.type === 'heading')) {
        koheseItem = {
            name: "Preamble",
            description: "",
            parentId: lineage[0],
            itemIds: [],
            tmpId: ++tmpIdCounter
        };
        readyToUpsert = true;
      }
    }

    if(event.entering && event.node.type === 'heading') {
      // Entering a new header, check if an item is ready to be pushed
      if(readyToUpsert) {
        koheseItem.description = render.getBuffer();
        for (var i = 0; i < lineage.length; i++) {
          if (lineage[i] === koheseItem.tmpId) {
            delete koheseItem.tmpId;
            item = global.app.models["Item"].upsert(koheseItem, {},
                function () {});
            addedIds.push(item.id);
            lineage[i] = item.id;
            readyToUpsert = false;
            break;
          }
        }
      }

      // Handle increasing jumps in level that are greater than one
      var parent;
      for (var i = event.node.level - 1; (!parent && i >= 0); i--) {
        parent = lineage[i];
      }
      
      koheseItem = {
          name: "",
          description: "",
          parentId: parent,
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

      if(koheseItem.name === "") {
        koheseItem.name = 'No Heading Title Found';
      }
    } else if(render[event.node.type]) {
      render[event.node.type](event.node, event.entering);
    } else if(!event.entering && event.node.type === 'document') {
      // Push a straggling kohese item
      if(readyToUpsert) {
        koheseItem.description = render.getBuffer();
        for (var i = 0; i < lineage.length; i++) {
          if (lineage[i] === koheseItem.tmpId) {
            delete koheseItem.tmpId;
            item = global.app.models["Item"].upsert(koheseItem, {},
                function () {});
            addedIds.push(item.id);
            lineage[i] = item.id;
            readyToUpsert = false;
            break;
          }
        }
      }
    } else if(event.node.type !== 'document' && event.node.type !== 'heading') {
      // Already handling document and heading events
      console.log('!!! Unknown/Unhandled event: ' + event.node.type
          + ' - Entering: ' + event.entering);
    }
  }
  
  return addedIds;
}
module.exports = mdToKohese;