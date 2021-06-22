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


var KDB = require('./server/kdb.js');

var analysis = KDB.retrieveModelInstance("Analysis", "cb35dab0-9263-11e5-9cb4-0bba35a515d6");

function printParseObject(parseObject, fss, pad){
  if (parseObject.parseType !== "TK") {
    console.log(pad + parseObject.parseType + " - " + parseObject.text );
    var childPad = "  " + pad;
    for (var childIdx in parseObject.children){
       printParseObject(fss[parseObject.children[childIdx]], fss, childPad);
    }
  }
}

for (var subjectIdx in analysis.raw) {
  var subject = analysis.raw[subjectIdx];

  console.log("::: Parse of " +subjectIdx);

  var parse = subject._views._InitialView.Parse;
  var fss = subject._referenced_fss;

  for (var parseIdx in parse) {
    entryType = typeof parse[parseIdx];
    if (entryType === "object") {
      console.log(parseIdx + " => " + entryType);
      printParseObject(parse[parseIdx], fss, "  ");
    }
  }
}
