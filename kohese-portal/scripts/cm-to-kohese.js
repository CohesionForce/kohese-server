/** Parses a provided markdown file and renders it into kohese items, then
 *  sends them to a local kohese server via rest interface.
 *  
 *  User must set the file, rootId, and accesToken below.
 */
var fs = require('fs');
var util = require('util');
var commonmark = require('commonmark');
var http = require('http');

var render = require('./cm-to-kohese-helper.js');

var koheseItems = []; 

////////// User parameters - See also http options

text=fs.readFileSync("basic.md", {encoding: 'utf8', flag: 'r'});
var rootId = '';
var accessToken = '';

//////////

var reader = new commonmark.Parser();
var parsed = reader.parse(text);
var walker = parsed.walker();
var event;

var parentStack = [];
var koheseItem = {name: null, id: null, description: null, 
				parentId: null, level: null, tempId: null};
var tempIdCounter = 1;

while(event = walker.next()) {
	if(event.entering && event.node.type === 'heading') {
		// Entering a new header, check if an item is ready to be pushed
		if(koheseItem.tempId !== null) {
			koheseItem.description = render.getBuffer();
			koheseItems.push(koheseItem);
		}

		koheseItem = {name: null, id: null, description: '', parentId: null, level: null, tempId: null};
		render.clearBuffer();
		koheseItem.level = event.node.level;
		koheseItem.tempId = tempIdCounter;
		tempIdCounter++;
		
		// Check parent stack to get correct parent IDs
		while(parentStack.length > 0 && event.node.level <= parentStack[parentStack.length - 1].level) {
			parentStack.pop();
		}
		if(parentStack.length === 0) {
			koheseItem.parentId = rootId;
			parentStack.push({level: event.node.level, id: koheseItem.tempId});
			// Temporary id, to be replaced with kohese uuid
		} else {
			koheseItem.parentId = parentStack[parentStack.length - 1].id;
			parentStack.push({level: event.node.level, id: koheseItem.tempId});
		}

		//Enter text as name, if it exists
		event = walker.next();
		if(event.entering && event.node.type === 'text') {
			koheseItem.name = event.node.literal;
		} else {
			koheseItem.name = 'BLANK';
		}
	}

	else if(render[event.node.type]) {
		render[event.node.type](event.node, event.entering);
	}
	
	else if(!event.entering && event.node.type === 'document') {
		//Push a straggling kohese item
		if(koheseItem.tempId !== null) {
			koheseItem.description = render.getBuffer();
			koheseItems.push(koheseItem);
		}
	}
	else if(event.node.type !== 'document' && event.node.type !== 'heading') {
		//Already handling document and heading events
		console.log('!!! Unknown/Unhandled event: ' + event.node.type + ' - Entering: ' + event.entering);
	}
}

var topLevel = koheseItems[koheseItems.length - 1].level;
var filteredItems = [];

for(var i=0; i <= topLevel; i++) {
	filteredItems[i] = koheseItems.filter(function(item) {
		return item.level === i;
	});
} //filteredItems[i] = array of items at level i


function postItems(level) {
	if(level > topLevel) {
		console.log('Done posting items!');
		return;
	}
	
	if(filteredItems[level] === [] || filteredItems[level] === undefined) {
		console.log('No items to post at level ' + level);
		postItems(level + 1);
	}
	
	console.log('Posting ' + filteredItems[level].length + ' items');
	
	var cleanItems = [];
	for(var i=0; i < filteredItems[level].length; i++) {
		cleanItems.push({name: filteredItems[level][i].name, description: filteredItems[level][i].description, parentId: filteredItems[level][i].parentId});
	}
	
	var options = {
			host: 'localhost',
			port: 3000,
			path: '/api/Items/',
			method: 'POST',
			headers: {
				'Authorization': accessToken,
				'Content-Type': 'application/json;charset=UTF-8',
				'Content-Length': Buffer.byteLength(JSON.stringify(cleanItems))
			}
	};
	
	var postRequest = http.request(options, postCallback);
	postRequest.write(JSON.stringify(cleanItems));
	postRequest.end();
	
	function postCallback(response) {
		console.log('POST at level ' + level + ' has status ' + response.statusCode);
		var output = '';
		response.on('data', function (chunk) {
			output += chunk;
		});
		response.on('end', function() {
			output = JSON.parse(output);
			//Set actual item id from Kohese
			for(var i=0; i < filteredItems[level].length; i++) {
				filteredItems[level][i].id = output[i].id;
			}
			resolveParentIds(level);
			postItems(level + 1);
		});
	};
}

function resolveParentIds(level) {
	//Given a level which has proper IDs, this should navigate further
	//levels and place parentIDs appropriately.
	if(level + 1 > topLevel) {
		//No further levels to resolve parent IDs
		return;
	}
	if(filteredItems[level] === undefined || filteredItems[level] === []) {
		//No parent IDs that need to be resolved
		return;
	}
	
	var tempIds = [];
	var parentIds = [];
	for(var i = 0; i < filteredItems[level].length; i++) {
		tempIds[i] = filteredItems[level][i].tempId;
		parentIds[i] = filteredItems[level][i].id;
	}
		
	for(var i = level + 1; i <= topLevel; i++) {
		for(var j = 0; j < filteredItems[i].length; j++) {
			var foundId = tempIds.indexOf(filteredItems[i][j].parentId);
			if(foundId !== -1) {
				filteredItems[i][j].parentId = parentIds[foundId];
			}
		}
	}
};
postItems(1);