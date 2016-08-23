/** Parses a provided markdown file and renders it into kohese items, then
 *  sends them to a local kohese server via rest interface.
 *  
 *  User must set the file and rootItem parameters below or via command line:
 *  node md-to-kohese.js rootItem.parentId filepath rootItem.name
 */
var fs = require('fs');
var util = require('util');
var commonmark = require('commonmark');
var http = require('http');
var renderFunc = require('./md-to-kohese-helper.js');

var accessToken;

//This checks to see if this was run via command line rather than required.
var ranFromCommandLine = require.main === module;
if ( ranFromCommandLine ) {

	var filePath, rootItem;
//////////User parameters - See also http options

	filePath = 'scripts/basic.md';
	rootItem = {name: 'Basic Test 1',
			description: '',
			parentId: '',
			itemIds: []};

///////// End User Parameters

//	argv[2] sets root item parentId
	if(process.argv[2]) {
		rootItem.parentId = process.argv[2];
	}

//	argv[3] sets file path
	if(process.argv[3]) {
		filePath = process.argv[3];
	}

	if(process.argv[4]) {
		rootItem.name = process.argv[4];
	} else {
		rootItem.name = filePath;
	}

	mdToKohese(filePath, rootItem);

}

function mdToKohese(filePath, rootItem) {

	
	var text;

	try {
		text = fs.readFileSync(filePath, {encoding: 'utf8', flag: 'r'});
	} catch(err) {
		console.log('Error reading input file ' + filePath);
		process.exit();
	}

	// accessToken may be set if this is being used as a module.
	if(!accessToken) {
		try { 
			accessToken = fs.readFileSync('./scripts/token.jwt');
		} catch(err) {
			console.log('Error reading token file. Please run "node scripts/login.js"');
			process.exit();
		}
	}
	
	postRootItem();
	
/////  Begin callback functions
///////
	function begin() {

		var koheseItems = []; 
		var rootId = rootItem.id;

		var reader = new commonmark.Parser();
		var parsed = reader.parse(text);
		var walker = parsed.walker();
		var event;

		var parentStack = [];
		var koheseItem = {name: null, id: null, description: null, 
				parentId: null, level: null, tempId: null, itemIds: []};
		var tempIdCounter = 1;
		var topLevel = 0;

		var render = renderFunc();
		while(event = walker.next()) {
//			console.log('Event: ' + event.node.type + ' Entering: ' + event.entering);
			if(event.entering && event.node.type === 'document') {
				event = walker.next();
				//Check if document begins with heading. If not, make an item.
				if(!(event.entering && event.node.type === 'heading')) {
					koheseItem.tempId = 0;
					koheseItem.name = 'Preamble';
					koheseItem.level = 1;
					koheseItem.parentId = rootId;
					koheseItem.description = '';
					topLevel = 1;
				}
			}

			if(event.entering && event.node.type === 'heading') {
				// Entering a new header, check if an item is ready to be pushed
				if(koheseItem.tempId !== null) {
					koheseItem.description = render.getBuffer();
					koheseItems.push(koheseItem);
				}

				if(event.node.level > topLevel) {
					topLevel = event.node.level;
				}

				koheseItem = {name: null, id: null, description: '', 
						parentId: null, level: null, tempId: null, itemIds: []};

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

				event = walker.next();

				koheseItem.name = '';

				//Throw away everything before leaving the heading that isn't text.
				while(event.node.type !== 'heading') {
					if(event.entering && event.node.type === 'text') {
						koheseItem.name += event.node.literal;
					}
					event = walker.next();
				}

				if(koheseItem.name === '') {
					koheseItem.name = 'No Heading Title Found';
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
		
//		 If the document did not have any headers, then there is only
//		 one item to post. In which case we should just modify the 
//		 root item.
		if(koheseItems.length === 1 && koheseItems[0].tempId === 0) {
			console.log('Modifying root item since there is one item.');
			rootItem.description = koheseItems[0].description;
			
			var options = {
					host: 'localhost',
					port: 3000,
					path: '/api/Items/',
					method: 'PUT',
					headers: {
						'Authorization': accessToken,
						'Content-Type': 'application/json;charset=UTF-8',
						'Content-Length': Buffer.byteLength(JSON.stringify(rootItem))
					}
			};

			var putRequest = http.request(options, function(response) {
				console.log('Root modify request status ' + response.statusCode);
				if (response.statusCode !== 200) {
					console.log('!!! Unexpected status. Returning...');
					return;
				}
			});

			putRequest.write(JSON.stringify(rootItem));
			putRequest.end();
			return;
		}

		var filteredItems = [];

		for(var i=0; i <= topLevel; i++) {
			filteredItems[i] = koheseItems.filter(function(item) {
				return item.level === i;
			});
		} //filteredItems[i] = array of items at level i

		filteredItems[0][0] = rootItem;


		function postItems(level) {
			if(level > topLevel) {
				console.log('Done posting items!');
				for(var i=0; i <= topLevel; i++) {
					addItemstoParents(i);
				}
				console.log('itemIds list added... Now PUTing...');
				putItems();
				return;
			}
			
			if(filteredItems[level] === undefined || filteredItems[level].length === 0) {
				console.log('No items to post at level ' + level);
				postItems(level + 1);
				return;
			}

			console.log('Posting ' + filteredItems[level].length + ' items at level ' + level);

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
				if (response.statusCode !== 200) {
					console.log('!!! Unexpected status. Returning...');
					return;
				}
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
			if(filteredItems[level] === undefined || filteredItems[level].length === 0) {
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

		function addItemstoParents(level) {
			if(level + 1 > topLevel) {
				return;
			}

			if(filteredItems[level] === undefined || filteredItems[level].length === 0) {
				return;
			}

			var parentIds = [];
			for(var i = 0; i < filteredItems[level].length; i++) {
				parentIds[i] = filteredItems[level][i].id;
			}

			for(var i = level + 1; i <= topLevel; i++) {
				for(var j = 0; j < filteredItems[i].length; j++) {
					var foundId = parentIds.indexOf(filteredItems[i][j].parentId);
					if(foundId !== -1) {
						filteredItems[level][foundId].itemIds.push(filteredItems[i][j].id);
					}
				}
			}
		};

		function putItems() {
			// Cleanse and transform filteredItems into a 1-D array
			var flatItems = [];
			for(var i=0; i <= topLevel; i++) {
				for(var j=0; j < filteredItems[i].length; j++) {
					if(filteredItems[i][j] !== null || filteredItems[i][j] !== undefined) {
						if(filteredItems[i][j].itemIds.length !== 0) {
							flatItems.push({name: filteredItems[i][j].name,
								description: filteredItems[i][j].description,
								id: filteredItems[i][j].id,
								parentId: filteredItems[i][j].parentId,
								itemIds: filteredItems[i][j].itemIds});
						}
					}
				}
			}

			// For some reason you can't modify elements via array, only make them
			for(var i=0; i < flatItems.length; i++) {

				var options = {
						host: 'localhost',
						port: 3000,
						path: '/api/Items/',
						method: 'PUT',
						headers: {
							'Authorization': accessToken,
							'Content-Type': 'application/json;charset=UTF-8',
							'Content-Length': Buffer.byteLength(JSON.stringify(flatItems[i]))
						}
				};

				var putRequest = http.request(options, function(response) {
					if(response.statusCode !== 200) {
						console.log('Unexpected PUT request status ' + response.statusCode);
						return;
					}
				});

				putRequest.write(JSON.stringify(flatItems[i]));
				putRequest.end();
			}
		};

		postItems(1);

	};

	function postRootItem() {
		var options = {
				host: 'localhost',
				port: 3000,
				path: '/api/Items/',
				method: 'POST',
				headers: {
					'Authorization': accessToken,
					'Content-Type': 'application/json;charset=UTF-8',
					'Content-Length': Buffer.byteLength(JSON.stringify(rootItem))
				}
		};

		var putRequest = http.request(options, function(response) {
			console.log('Root Item POST status ' + response.statusCode);
			if (response.statusCode !== 200) {
				console.log('!!! Unexpected status. Returning...');
				return;
			}
			var output = '';
			response.on('data', function (chunk) {
				output += chunk;
			});
			response.on('end', function() {
				output = JSON.parse(output);
				rootItem.id = output.id;
				begin();
			});
		});
		
		putRequest.write(JSON.stringify(rootItem));
		putRequest.end();
	};		
}

module.exports = mdToKohese;