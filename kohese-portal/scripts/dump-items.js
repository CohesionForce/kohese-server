/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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



var forItemId="db13bfc0-ae41-11e5-af49-9b039241499e";
console.log("::: Begin dumping for " + forItemId);
var KDB = require('../server/kdb.js');

var document = KDB.ItemProxy.getWorkingTree().getProxyFor(forItemId);

console.log("KUID,Parent KUID,Child Count,Name,Description");
var displayItem = function(proxy){
  console.log(proxy.item.id + ",|" + proxy.item.parentId + "|,|" + proxy.children.length + "|,|" + proxy.item.name + "|,|" + proxy.item.description + "|");
};

document.visitDescendants(displayItem);
