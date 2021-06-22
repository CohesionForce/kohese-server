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



var fs = require('fs');

var text="# Heading 1\nHow *is* this\n\nAnd **this** too\n\n## Heading 2\n\n* Bullet 1\n* Bullet 2\n    * Bullet 2.1";

//text=fs.readFileSync("tmp/samples/prop2.md", {encoding: 'utf8', flag: 'r'});
//text=fs.readFileSync("t.out", {encoding: 'utf8', flag: 'r'});
//text=fs.readFileSync("tmp/samples/tais_srs.md", {encoding: 'utf8', flag: 'r'});
text=fs.readFileSync("tmp/samples/tais_sadd.md", {encoding: 'utf8', flag: 'r'});

var marked = require('marked');
console.log("::: HTML:");
var m = marked(text);
console.log(m);


var lexer = new marked.Lexer();
var tokens = lexer.lex(text);
console.log("::: Tokens:");
console.log(tokens);
//console.log("::: Lexer Rules:");
//console.log(lexer.rules);

