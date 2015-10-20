var exportKdb = function() {


    console.log(process.argv);

    var JSONPath = "db.json"
    var rawJSON = loadJSONDoc(JSONPath);

    function checkAndCreateDir(fs, dirName) {
      if (!fs.existsSync(dirName)) {
        console.log("::: Creating " + dirName);
        fs.mkdirSync(dirName);
        fs.writeFileSync(dirName + "/.gitignore","", {encoding: 'utf8', flag: 'w'});
      }
    }

    function exportModel(fs, modelName, model) {
        var modelDir = "export/" + modelName;

        if (modelName === "Analysis") {
          console.log("!!! Skipping export of Analysis");
          return;
        }

        console.log("::: Exporting Model: " + modelName);
        checkAndCreateDir(fs, modelDir);

        // Check for existing model instances that may need to be deleted
        var fileList = fs.readdirSync(modelDir);

        // Ignore the .gitignore file if it exists
        var gitignoreIdx = fileList.indexOf(".gitignore");
        if (gitignoreIdx > -1){
          fileList.splice(gitignoreIdx, 1);
        }

        // Remove model instance files that are no longer needed
        for (var fileIdx in fileList) {
          var fileName = fileList[fileIdx];
          var modelId = fileName.replace(/.json$/,''); 
          if (!model[modelId]) {
            console.log("::: Removing stored file for " + modelId);
            fs.unlinkSync(modelDir + "/" + fileName);
          }
        }

        // Update or create model instance files that have changed
        for(var id in model){
          var itemFileName = modelDir + "/" + id + ".json";
          var dbRow = model[id];
          var dbRowItem= JSON.parse(dbRow);

          var oldFileContents = "";
          if (fs.existsSync(itemFileName)) {
            oldFileContents = fs.readFileSync(itemFileName, {encoding: 'utf8', flag: 'r'});  
          }

          var newFileContents = JSON.stringify(dbRowItem, null, '  ');

          if (newFileContents !== oldFileContents) {
            console.log("+++ Changes detected in " + id + " -> " + dbRowItem.name);
            fs.writeFileSync(itemFileName, newFileContents, {encoding: 'utf8', flag: 'w'});
          }
        }
    }

    function deleteFolderRecursive(fs, path) {
        var files = [];
        if( fs.existsSync(path) ) {
            files = fs.readdirSync(path);
            files.forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(fs, curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    function loadJSONDoc(filePath) {

        console.log("::: Loading " + filePath);
        var fs = require('fs');

        var fileData = fs.readFileSync(filePath, {encoding: 'utf8', flag: 'r'});
        var json = JSON.parse(fileData);

        var exportDir = "export";
        checkAndCreateDir(fs, exportDir);

        var modelDirList = fs.readdirSync(exportDir);

        // Ignore the .git file if it exists
        var gitIdx = modelDirList.indexOf(".git");
        if (gitIdx > -1){
          modelDirList.splice(gitIdx, 1);
        }

        // Ignore the .gitignore file if it exists
        var gitignoreIdx = modelDirList.indexOf(".gitignore");
        if (gitignoreIdx > -1){
          modelDirList.splice(gitignoreIdx, 1);
        }

        // Remove model directories that are no longer needed
        for (var dirIdx in modelDirList) {
          var modelDirName = modelDirList[dirIdx];
          if (!json.models[modelDirName]) {
            console.log("::: Removing stored directory for " + modelDirName);
            deleteFolderRecursive(fs, exportDir + "/" + modelDirName);
          }
        }
        
        // Export the model instances
        for(var modelName in json.models){
          exportModel(fs, modelName, json.models[modelName]);
        }

        return json;
    }

}();
