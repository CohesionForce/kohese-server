var exportKdb = function() {


    console.log(process.argv);

    var JSONPath = "db.json"
    var rawJSON = loadJSONDoc(JSONPath);

    function checkAndCreateDir(fs, dirName) {
      if (!fs.existsSync(dirName)) {
        console.log("::: Creating " + dirName);
        fs.mkdirSync(dirName);
      }
    }

    function exportModel(fs, modelName, model) {
        var modelDir = "export/" + modelName;

        console.log("::: Exporting Model: " + modelName);
        checkAndCreateDir(fs, modelDir);

        // Check for existing model instances that may need to be deleted
        var fileList = fs.readdirSync(modelDir);
        for (var fileIdx in fileList) {
          var fileName = fileList[fileIdx];
          var modelId = fileName.replace(/.json$/,''); 
          if (!model[modelId]) {
            console.log("::: Removing stored file for " + modelId);
            fs.unlinkSync(modelDir + "/" + fileName);
          }
        }

        for(var id in model){
          var dbRow = model[id];
          var itemFileName = modelDir + "/" + id + ".json";
          var dbRowItem= JSON.parse(dbRow);
          fs.writeFileSync(itemFileName, JSON.stringify(dbRowItem, null, '  '), {encoding: 'utf8', flag: 'w'});  
        }
    }

    function loadJSONDoc(filePath) {

        console.log("::: Loading " + filePath);
        var fs = require('fs');

        var fileData = fs.readFileSync(filePath, {encoding: 'utf8', flag: 'r'});
        var json = JSON.parse(fileData);

        checkAndCreateDir(fs, "export");

        for(var modelName in json.models){
          exportModel(fs, modelName, json.models[modelName]);
        }

        return json;
    }

}();
