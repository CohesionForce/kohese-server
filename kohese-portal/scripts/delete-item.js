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


/** Loads local KDB then deletes an item and its children based on user interaction.
 *  Usage: node scripts/delete-item.js itemId
 *
 *  Note: Must be ran from kohese-portal directory.
 *  May need to restart local server to reflect changes.
 */
var prompt = require('prompt');
prompt.start();

var itemId;

if(process.argv[2]) {
	itemId = process.argv[2];
} else {
	console.log('Error: No item id provided.');
	process.exit();
}

var KDB = require('../server/kdb.js');

var baseItem = KDB.ItemProxy.getWorkingTree().getProxyFor(itemId)
if (baseItem === undefined) {
	console.log('Error: Provided ID not found.');
	process.exit();
}

baseItem.dumpProxy();

console.log('Note: The specified item has ' + baseItem.getDescendants().length + ' children.');

var delPrompt = {properties: {deleteAns: {
    description: 'Delete the item and all its descendants? (Y/N): ',
	pattern: /^[YNyn]{1}$/,
	message: 'Please enter Y or N',
	required: true}}};

prompt.get(delPrompt, function (err, result) {
	if(err) {
		process.exit();
	}
	if(result.deleteAns === 'n' || result.deleteAns === 'N') {
		console.log('Cancelling delete...');
		process.exit();
	} else if (result.deleteAns === 'y' || result.deleteAns === 'Y'){
		console.log('Now deleting item ' + baseItem.item.id + ' and all of its descendants...');

		var descendants = baseItem.getDescendants();
		// Order is important as we don't want to delete items with children.
		// Going through the descendant list backwards means we start from
		// the bottom of the tree.
		var toBeDeleted = descendants.pop();
		while(toBeDeleted) {
			if(toBeDeleted.children.length !== 0) {
				console.log('Error: Unexpected children');
				process.exit();
			}

			// Calling the proxy delete isn't enough as it only deletes
			// the local in-memory copy. We need to delete it from the disk!
			//toBeDeleted.deleteItem();
			KDB.removeModelInstance(toBeDeleted.kind, toBeDeleted.item.id);
			toBeDeleted = descendants.pop();
		}

		KDB.removeModelInstance(baseItem.kind, baseItem.item.id);

		console.log('Done deleting items!');
	}
});
