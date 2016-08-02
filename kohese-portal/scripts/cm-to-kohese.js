/**
 * 
 */
var fs = require('fs');
var util = require('util');
var commonmark = require('commonmark');

var render = require('./cm-to-kohese-helper.js');

var koheseItems = []; 

text=fs.readFileSync("basic.md", {encoding: 'utf8', flag: 'r'});

var reader = new commonmark.Parser();
var parsed = reader.parse(text);
var walker = parsed.walker();
var event;

var parentStack = [];
var rootId = '';
var koheseItem = {name: null, id: null, description: null, parentId: null};

while(event = walker.next()) {
	if(event.entering && event.node.type === 'heading') {
		// Entering a new header, check if an item is ready to be pushed
		if(koheseItem.id !== null) {
			koheseItem.description = render.getBuffer();
			koheseItems.push(koheseItem);
		}

		koheseItem = {name: null, id: null, description: '', parentId: null};
		render.clearBuffer();
		
		// Check parent stack to get correct parent IDs
		while(parentStack.length > 0 && event.node.level <= parentStack[parentStack.length - 1].level) {
			parentStack.pop();
		}
		if(parentStack.length === 0) {
			koheseItem.parentId = rootId;
			koheseItem.id = Math.floor((Math.random() * 1000) + 1)
			parentStack.push({level: event.node.level, id: koheseItem.id});
			// Temporary random id, to be replaced with kohese uuid
		} else {
			koheseItem.parentId = parentStack[parentStack.length - 1].id;
			koheseItem.id = Math.floor((Math.random() * 1000) + 1);
			parentStack.push({level: event.node.level, id: koheseItem.id});
			// Temporary random id, to be replaced with kohese uuid
		}

		//Enter text as name, if it exists
		event = walker.next();
		if(event.entering && event.node.type === 'text') {
			koheseItem.name = event.node.literal;
		} else {
			koheseItem.name = '';
		}
	}

	else if(render[event.node.type]) {
		render[event.node.type](event.node, event.entering);
	}
	
	else if(!event.entering && event.node.type === 'document') {
		//Push a straggling kohese item
		if(koheseItem.id !== null) {
			koheseItem.description = render.getBuffer();
			koheseItems.push(koheseItem);
		}
	}
	else if(event.node.type !== 'document' && event.node.type !== 'heading') {
		//Already handling document and heading events
		console.log('!!! Unknown/Unhandled event: ' + event.node.type + ' - Entering: ' + event.entering);
	}
}

console.log(koheseItems);