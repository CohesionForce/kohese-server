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


class TestClass {
  constructor(a, b){
    this.a = a;
    this.b = b;
  }

}

let smDefn = `
  {
    "issueState": {
      "type": "StateMachine",
      "default": "Observed",
      "required": true,
      "properties": {
        "state":{
          "Observed": {
            "name": "Observed",
            "description": "The issue has been Observed."
           },
          "InAnalysis": {
            "name": "In Analysis",
            "description": "The issue is In Analysis."
           },
          "NoAction": {
            "name": "No Action",
            "description": "The issue requires No Action."
           },
          "Duplicate": {
            "name": "Duplicate",
            "description": "The issue is a Duplicate."
           },
          "RequiresAction": {
            "name": "Requires Action",
            "description": "The issue Requires Action."
           },
          "Resolved": {
            "name": "Resolved",
            "description": "The issue is Resolved."
           }
        },
        "transition": {
          "assignAnalysis": {
            "source": "Observed",
            "target": "InAnalysis",
            "guard": {},
            "requires": ["analysisAction"]
          },
          "noActionRequired": {
            "source": "InAnalysis",
            "target": "NoAction",
            "guard": {}
          },
          "duplicateOf": {
            "source": "InAnalysis",
            "target": "Duplicate",
            "guard": {},
            "requires": "relatedIssues"
          },
          "requiresAction": {
            "source": "InAnalysis",
            "target": "RequiresAction",
            "guard": {},
            "requires": "resolutionActions"
          },
          "resolve": {
            "source": "RequiresAction",
            "target": "Resolved",
            "guard": {
              "tbd": "Insert guard to ensure all associated actions are closed"
            }
          }
        }
      }
    }
  }
`;
let smJ = JSON.parse(smDefn);

let TC2Defn = `
class TestClass2 {
  constructor(a, b){
    this.a = a;
    this.b = b;
  };

  set setA(value){
    console.log('))) ' + value);
    this.A = value;
  }

}`;

function dumpIt(obj) {
  let out = {
    kind: obj.constructor.name,
    item: obj
  };
  console.log(JSON.stringify(out, null, '|-'));

}

try {

  console.log('::: Test Class Creation');
  let tc = new TestClass('hello', 'world');
  console.log('>>> TC: ');
  console.log(tc);
  console.log(JSON.stringify(tc));

  dumpIt(tc);

  console.log('::: Test Class 2');
  console.log(TC2Defn);
  console.log(JSON.stringify(TC2Defn, null, '  '));

  // jshint -W061
  let TC2 = eval('(' + TC2Defn + ')');
  // jshint +W061

  console.log(';;; TestClass');
  console.log(TestClass.toString());
  console.log(';;; TC2');
  console.log(TC2.toString());
  console.log(';;; TC2.setA');
  console.log(TC2.setA);
  let tc2 = new TC2('goodbye', 'world');
  console.log(JSON.stringify(tc2, null, '  '));
  dumpIt(tc2);

  tc2.setA = 'why';
  dumpIt(tc2);

  console.log('-----------');
//  console.log(smJ);
  dumpIt(smJ.issueState.properties.transition);

} catch (err) {
  console.log('*** Error: ' + err);
  console.log(err.stack);
}
