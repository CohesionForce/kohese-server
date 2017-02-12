
var kdb = require('../server/kdb.js');
var ItemProxy = kdb.ItemProxy;

var root;
var itemId;

if(process.argv[2]) {
  itemId = process.argv[2];
  root = ItemProxy.getProxyFor(itemId);
  if (root === undefined) {
    console.log('*** Could not find an item by id:  ' + itemId);
    process.exit();
  }
} else {
  console.log('::: No item id provided, so selected the root repository');
  root = ItemProxy.getRootProxy();
}

var descendants = root.getDescendants();
var descendantCount = descendants.length;

console.log('::: Found item "' + root.item.name + '" with ' + descendantCount + ' children.');

var prompt = require('prompt');
prompt.start();

var contPrompt = 
{
  properties : {
    answer : {
      description : '??? Rewrite the item and all its descendants? (Y/N): ',
      pattern : /^[YNyn]{1}$/,
      message : 'Please enter Y or N',
      required : true
    }
  }
};

prompt.get(contPrompt, function (err, result) {
  if(err) {
    process.exit();
  }
  if(result.answer === 'n' || result.answer === 'N') {
    console.log('::: Exiting without making changes');
    process.exit();
  } else if (result.answer === 'y' || result.answer === 'Y'){
    console.log('::: Rewriting item and all descendents...');
    for(var idx in descendants){
      var proxy = descendants[idx];
      console.log("--> rewrite[" + idx + "/" + descendantCount + "]: " + proxy.kind + " - " + proxy.item.id + " - " + proxy.item.name);
      kdb.storeModelInstance(proxy.kind, proxy.item);
    }
  }
});
