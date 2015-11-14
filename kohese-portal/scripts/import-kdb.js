var jsonExt = /\.json$/;
var kdbFS = require('../server/kdb-fs.js');
var importKdb = function() {

    function readModelDir(fs, kdb, modelName) {
      var dirName = "export/" + modelName;
      var fileList = kdbFS.getRepositoryFileList(dirName, jsonExt);

      kdb.ids[modelName] = fileList.length;
      console.log("::: Found model kind " + modelName + ":  " + kdb.ids[modelName]);
      var modelStore = {};
      kdb.models[modelName] = modelStore;
      for(var fileIdx in fileList) {
        var fileData = fs.readFileSync(dirName + "/" + fileList[fileIdx], {encoding: 'utf8', flag: 'r'});
        var itemRow =  JSON.parse(fileData);
        modelStore[itemRow.id] = JSON.stringify(itemRow);
      }
    }

    //
    // MAIN Processing
    //

    var fs = require('fs');

    var exportDir = "export";

    var dirList = fs.readdirSync(exportDir);

    // Ignore the .git file if it exists
    var gitIdx = dirList.indexOf(".git");
    if (gitIdx > -1){
      dirList.splice(gitIdx, 1);
    }

    // Ignore the .gitignore file if it exists
    var gitignoreIdx = dirList.indexOf(".gitignore");
    if (gitignoreIdx > -1){
      dirList.splice(gitignoreIdx, 1);
    }

    var kdb = {};
    kdb.ids = {};
    kdb.models = {};

    for (var dirIdx in dirList) {
      var modelName = dirList[dirIdx];
      if (modelName === "Analysis"){
         console.log("!!! Skipping Analysis");
         kdb.models["Analysis"] = {};
      } else {
         readModelDir(fs, kdb, modelName);
      }
    }

    fs.writeFileSync("kdb-import.json", JSON.stringify(kdb, null, '  '), {encoding: 'utf8', flag: 'w'});
    
}();
