
var fs = require('fs');
var util = require('util');

var text="# Heading 1\nHow *is* this\n\nAnd **this** too\n\n## Heading 2\n\n* Bullet 1\n* Bullet 2\n    * Bullet 2.1";

//text=fs.readFileSync("reports/samples/prop2.md", {encoding: 'utf8', flag: 'r'});
//text=fs.readFileSync("reports/samples/prop3.md", {encoding: 'utf8', flag: 'r'});
//text=fs.readFileSync("t.out", {encoding: 'utf8', flag: 'r'});
//text=fs.readFileSync("reports/samples/tais_srs.md", {encoding: 'utf8', flag: 'r'});
//text=fs.readFileSync("reports/samples/tais_sadd.md", {encoding: 'utf8', flag: 'r'});
//text=fs.readFileSync("reports/samples/tais_sadd_extra.md", {encoding: 'utf8', flag: 'r'});
text=fs.readFileSync("reports/samples/commonmark.spec.txt.md", {encoding: 'utf8', flag: 'r'});

var commonmark = require('commonmark');
var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer({sourcepos: true});

var parsed = reader.parse(text); // parsed is a 'Node' tree
//console.log("::: Parsed:");
//console.log(parsed);

//console.log("::: HTML:");
//var result = writer.render(parsed); // result is a String
//console.log(result);

//console.log("::: XML:");
//var xwriter = new commonmark.XmlRenderer({sourcepos: true});
//var xresult = xwriter.render(parsed);
//console.log(xresult);

//awriter = { render: function(node) {
                   //return util.inspect(node, null, 20, false) + '\n';
                   //return node._type + '\n';
                 //},
                 //options: {} };
//
//console.log("::: AST:");
//var aresult = awriter.render(parsed);
//console.log(aresult);

console.log("::: Walker");

var walker = parsed.walker();
var event, node;

function dumpAttr(node, attr) {
  if(node[attr]){
    var value = JSON.stringify(node[attr]);
    if ("{}" != value) {
      console.log(" -- " + attr + ": " + JSON.stringify(node[attr]));
    }
  }  
}

function dumpNode(node) {

  console.log("====>");
  dumpAttr(node, "_type");
  //dumpAttr(node, "_parent");
  //dumpAttr(node, "_firstChild");
  //dumpAttr(node, "_lastChild");
  //dumpAttr(node, "_prev");
  //dumpAttr(node, "_next");
  dumpAttr(node, "_sourcepos");
  dumpAttr(node, "_lastLineBlank");
  dumpAttr(node, "_open");
  dumpAttr(node, "_string_content");
  dumpAttr(node, "_literal");
  dumpAttr(node, "_listData");
  dumpAttr(node, "_info");
  dumpAttr(node, "_destination");
  dumpAttr(node, "_title");
  dumpAttr(node, "_isFenced");
  dumpAttr(node, "_fenceChar");
  dumpAttr(node, "_fenceLength");
  dumpAttr(node, "_fenceOffset");
  dumpAttr(node, "_level");
  
  //console.log("??? " + node.type + ' - ' + util.inspect(node.sourcepos) + ' - ' + event.entering + " - " + util.inspect(node, null, 2, false));
  console.log("<====");
 
}

while ((event = walker.next())) {
  node = event.node;

  if (event.entering) {

    switch (node.type) {
      case 'text':
        console.log(" >> " + node.type + ' - ' + node.literal);
        //console.log("--> " + node.parent.type);
        break;
      case 'link':
        console.log(">>> " + node.type + ' - ' + util.inspect(node.sourcepos) + ' - ' + event.entering + " - " + node.destination + " - " + node.title);
        break;
      case 'image':
        console.log(">>> " + node.type + ' - ' + util.inspect(node.sourcepos) + ' - ' + event.entering + " - " + node.destination);
        break;
      case 'html_inline':
        console.log(">>> " + node.type + ' - ' + util.inspect(node.sourcepos) + ' - ' + event.entering + " - " + node.literal);
        break;
      case 'heading':
        console.log(">>> " + node.type + ' - ' + util.inspect(node.sourcepos) + ' - ' + event.entering + " - " + node.level);
        dumpNode(node);
        break;
      case 'paragraph':
        console.log(">>> " + node.type + ' - ' + util.inspect(node.sourcepos) + ' - ' + event.entering + " ---> " + node._lastLineBlank + ' - ' + node._literal);
//        dumpNode(node);
        break;
      case 'what':
        dumpNode(node);
        break; 
      case 'softbreak':
        console.log("}}} softbreak");
        break;
      default:
        console.log("~~~ " + node.type + " - " + util.inspect(node.sourcepos));
        dumpNode(node);  
    }
  } else {
    switch (node.type) {
      case 'heading':
        console.log("<<< " + node.type + ' - ' + util.inspect(node.sourcepos) + ' - ' + event.entering + " - " + node.level);
        break;
      default:
        console.log("!!! " + node.type + " - " + util.inspect(node.sourcepos) + ' - ' + event.entering);
    }
  }
}


//var lexer = new md.Lexer();
//var tokens = lexer.lex(text);
//console.log("::: Tokens:");
//console.log(tokens);
//console.log("::: Lexer Rules:");
//console.log(lexer.rules);

