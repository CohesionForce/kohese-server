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


/** The render methods used by md-to-kohese.js to parse AST back to commonmark.
 *  Apparently AST to commonmark is implemented in the reference C
 *  implementation, cmark, of commonmark. May then want to use
 *  commonmark.c to determine proper conversion.
 */

var Render = function() {

       // Need to ignore underscores in identifiers
       // jshint -W106

       return {
               buffer: '',

               clearBuffer: function() {
                       this.buffer = '';
               },
               getBuffer: function() {
                       return this.buffer;
               },

               // Start standard CM Tokens
               block_quote: function(node, entering) {
                       if(entering) {
                               this.buffer += '> ';
                       }
               },

               // eslint-disable-next-line no-unused-vars
               code: function(node, entering) {
                       this.buffer += '`' + node.literal + '`';
               },

               // eslint-disable-next-line no-unused-vars
               code_block: function(node, entering) {
                       this.buffer += '\n```\n';
               },

               // eslint-disable-next-line no-unused-vars
               emph: function(node, entering) {
                       this.buffer += '*';
               },

//             heading: function(node, entering) {
//Purposefully omitted as headings are treated differently
//             },

               // eslint-disable-next-line no-unused-vars
               html_block: function(node, entering) {
                       this.buffer += node.literal;
               },

               // eslint-disable-next-line no-unused-vars
               html_inline: function(node, entering) {
                       this.buffer += node.literal;
               },

               // eslint-disable-next-line no-unused-vars
               image: function(node, entering) {
                 if (entering) {
                   this.buffer += '![';
                 } else {
                   if (node.destination.startsWith('data:image/')) {
                     this.buffer += '](' + node.destination;
                     if (node.title) {
                       this.buffer += ' "' + node.title + '")';
                     } else {
                       this.buffer += ')';
                     }
                   } else {
                     this.buffer += ']()';
                   }
                 }
               },

               addListTabs: function() {
                       for(var i = 1; i < this.listDepth; i++) {
                               this.buffer += '    ';
                       }
               },

               item: function(node, entering) {
                       var listData = node.parent._listData;
                       if(entering) {
                               this.addListTabs();
                               if(listData.type === 'bullet') {
                                       this.buffer += listData.bulletChar;
                               }
                               if(listData.type === 'ordered') {
                                       var number = this.numberEntry[this.numberEntry.length - 1];
                                       this.buffer += (number + listData.start) + listData.delimiter;
                                       this.numberEntry[this.numberEntry.length - 1]++;
                               }
                               this.buffer += ' ';
                       }
               },

               // eslint-disable-next-line no-unused-vars
               linebreak: function(node, entering) {
                       this.buffer += '\n';
               },

               link: function(node, entering) {
                       if(entering) {
                               this.buffer += '[';
                       }
                       else {
                               if(node.title) {
                                       this.buffer += '](' + node.destination + ' "' + node.title + '")';
                               } else {
                                       this.buffer += '](' + node.destination + ')';
                               }

                       }
               },

               listDepth: 0,
               numberEntry: [], // This keeps track of what number to print in ordered lists
               list: function(node, entering) {
                       //console.log(node._listData);
                       //console.log(this.numberEntry);
                       if(entering) {
                               this.listDepth++;
                               this.numberEntry.push(0);
                       } else {
                               this.listDepth--;
                               this.numberEntry.pop();

                               // If it is a sublist, don't add another newline at the end
                               if(node.parent.type !== 'item') {
                                       this.buffer += '\n';
                               }
                       }
               },

               paragraph: function(node, entering) {
                       var grandparent = node.parent.parent;
                       if(grandparent !== null && grandparent.type === 'list') {
                               if(!entering) {
                                       this.buffer += '\n';
                               }
                               return;
                       }

                       if(entering) {
                               //this.buffer += '\n';
                       } else {
                               this.buffer += '\n\n';
                       }
               },

               // eslint-disable-next-line no-unused-vars
               softbreak: function(node, entering) {
                       this.buffer += '\n'; // space or \n may be valid
                       var grandparent = node.parent.parent;
                       if(grandparent !== null && grandparent.type === 'item') {
                               this.addListTabs();
                       }
               },

               // eslint-disable-next-line no-unused-vars
               strong: function(node, entering) {
                       this.buffer += '**';
               },

               // eslint-disable-next-line no-unused-vars
               text: function(node, entering) {
                       this.buffer += node.literal;
               },

               // eslint-disable-next-line no-unused-vars
               thematic_break: function(node, entering) {
                       this.buffer += '___'; //Need line break?
               }
       };

       // jshint +W106
};

module.exports = Render;
