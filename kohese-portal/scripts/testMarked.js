
var fs = require('fs');

var text="# Heading 1\nHow *is* this\n\nAnd **this** too\n\n## Heading 2\n\n* Bullet 1\n* Bullet 2\n    * Bullet 2.1";

//text=fs.readFileSync("reports/samples/prop2.md", {encoding: 'utf8', flag: 'r'});
//text=fs.readFileSync("t.out", {encoding: 'utf8', flag: 'r'});
//text=fs.readFileSync("reports/samples/tais_srs.md", {encoding: 'utf8', flag: 'r'});
text=fs.readFileSync("reports/samples/tais_sadd.md", {encoding: 'utf8', flag: 'r'});

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

