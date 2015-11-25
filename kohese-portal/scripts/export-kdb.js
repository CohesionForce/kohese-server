
var kdb = require('../server/kdb.js');
var ItemProxy = kdb.ItemProxy;
var lbStore = kdb.lbStore;

for(var modelName in lbStore.models){
  exportModel(modelName, lbStore.models[modelName]);
}

function exportModel(modelName, model) {

  if (modelName === "Analysis") {
    console.log("!!! Skipping export of Analysis");
    return;
  }

  console.log("::: Exporting Model: " + modelName);

  // Update or create model instance files that have changed
  for(var id in model){

    var dbRow = model[id];
    var dbRowItem= JSON.parse(dbRow);

    var proxy = ItemProxy.getProxyFor(id);
    var oldFileContents = "";
    if(proxy){
      oldFileContents = JSON.stringify(proxy.item, null, '  ');
    }

    var newFileContents = JSON.stringify(dbRowItem, null, '  ');

    if (newFileContents != oldFileContents) {
      console.log("+++ Changes detected in " + id + " -> " + dbRowItem.name);
      console.log("::: Old")
      console.log(oldFileContents);
      console.log("::: New")
      console.log(newFileContents);
      kdb.storeModelInstance(modelName, dbRowItem);
    }
  }
}