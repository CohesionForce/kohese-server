var KDB = require('../server/kdb.js');
var prompt = require('prompt');

// TODO:  Remove dependence of kdb-repo on global
global.koheseKDB = KDB;

prompt.start();

var forItemId="ERROR_NO_ID_SUPPLIED";
if(process.argv[2]){
  forItemId=process.argv[2];
  console.log("::: Changing item id to: " + forItemId);
} else {
  console.log("*** Item ID was not supplied");
  process.exit();
}

console.log("::: Begin test-kgit for " + forItemId);

function testGetItemStatus(proxy){
  console.log("::: Get Item Status");

  var itemStatus = KDB.kdbRepo.getItemStatus(proxy);
  console.log(itemStatus);  
}

function testHistory(proxy) {
  console.log("::: Test History");
  
  KDB.kdbRepo.walkHistoryForFile(proxy, function (history) {
    console.log(history);
  });
}

var proxy = KDB.ItemProxy.getProxyFor(forItemId);

var kgitPrompt = {properties: {kgitAns: {
  description: 'Ready to kgit? (Y/N): ',
pattern: /^[YNyn]{1}$/, 
message: 'Please enter Y or N',
required: true}}};

prompt.get(kgitPrompt, function(err, result) {
  if (err) {
    process.exit();
  }
  if (result.kgitAns === 'n' || result.kgitAns === 'N') {
    console.log('Cancelling kgit...');
    process.exit();
  } else if (result.kgitAns === 'y' || result.kgitAns === 'Y') {

    console.log("::: Waiting for prompts");
    testGetItemStatus(proxy);
    testHistory(proxy);
  }
});



