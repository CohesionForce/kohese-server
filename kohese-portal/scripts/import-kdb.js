var importKdb = function() {

    function readModelDir(fs, kdb, modelName) {
      var dirName = "export/" + modelName;
      var fileList = fs.readdirSync(dirName);
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

    var kdb = {};
    kdb.ids = {};
    kdb.models = {};

    for (var dirIdx in dirList) {
      var modelName = dirList[dirIdx];
      readModelDir(fs, kdb, modelName);
    }

    fs.writeFileSync("kdb-import.json", JSON.stringify(kdb, null, '  '), {encoding: 'utf8', flag: 'w'});  
    


}();
