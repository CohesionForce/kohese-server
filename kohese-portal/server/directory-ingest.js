/** Directory ingester to Kohese
 *  
 *  Requires: pandoc globally, soffice globally (libreoffice)
 */

var fs = require('fs');
var Path = require('path');
var child = require('child_process');
var http = require('http');

var mdToKohese = require('./md-to-kohese.js');

var rootId;
var basePath;
var tempDir = '/tmp-' + Math.floor((Math.random() * 10000) + 1);
var tempDirPath;

function importFiles(files, parent, rootName) {
  if (0 === files.length) {
    return;
  }
  
  basePath = Path.parse(files[0]).dir;
  tempDirPath = Path.join(basePath,tempDir);
  
  if (!rootName) {
    rootName = basePath;
  }

  try {
    fs.mkdirSync(tempDirPath);
  } catch(err) {
    console.log('An error occured while creating the temp directory');
    console.log(err);
  }

  var dirCount = 0;
  var dir = global.app.models["Item"].upsert({
      name: rootName,
      parentId: parent
    }, {}, function () {
  });
  
  for (var i = 0; i < files.length; i++) {
    process(files[i], dir);
  }

  console.log('All operations are completed. Now cleaning up...');
  deleteFile(tempDirPath);
  console.log('Clean up done!');
}
module.exports.importFiles = importFiles;

//Functions returns the part of the given filePath after the base.
function splitPath(filePath, base) {
  var normPath = Path.normalize(filePath);
  base = base + Path.sep;
  var normBase = Path.normalize(base);
  return normPath.substring(normPath.indexOf(normBase) + normBase.length);
}

function processToMarkdown(filePath, basePath) {
  var pathDirBase = splitPath(filePath, basePath);
  var path = Path.parse(pathDirBase);
  var tempPathDirName = Path.join(tempDirPath, path.dir, path.name);
  var mdOutPath = tempPathDirName + '.md';
  var processed = true;
  
  switch (path.ext) {
  case '.doc':
    // doc processing
    console.log('::: Processing doc to odt to md');
    var soffice = child.spawnSync('soffice', ['--headless', '--convert-to', 'odt', pathDirBase, '--outdir', Path.join(basePath, tempDir, path.dir) ], { cwd: basePath, encoding : 'utf8' });
    if(soffice.stdout) {
      console.log(soffice.stdout);
    }
    var pandoc = child.spawnSync('pandoc', ['-f', 'odt', '-t', "commonmark", '--atx-headers', Path.join(basePath, tempPathDirName, '.odt'), '-o', mdOutPath], { cwd: basePath, encoding : 'utf8' });
    if(pandoc.stdout) {
      console.log(pandoc.stdout);
    }
    break;
  case '.odt':
    // odt processing
    console.log('::: Processing odt to md');
    var pandoc = child.spawnSync('pandoc', ['-f', 'odt', '-t', "commonmark", '--atx-headers', pathDirBase, '-o', mdOutPath], { cwd: basePath, encoding : 'utf8' });
    if(pandoc.stdout) {
      console.log(pandoc.stdout);
    }
    break;
  case '.docx':
    // docx processing
    console.log('::: Processing docx to md');
    var pandoc = child.spawnSync('pandoc', ['-f', 'docx', '-t', "commonmark", '--atx-headers', pathDirBase, '-o', mdOutPath], { cwd: basePath, encoding : 'utf8' });
    if(pandoc.stdout) {
      console.log(pandoc.stdout);
    }
    break;
  case '.htm':
  case '.html':
    // html processing
    console.log('::: Processing html to md');
    var pandoc = child.spawnSync('pandoc', ['-f', 'html', '-t', "commonmark", '--atx-headers', pathDirBase, '-o', mdOutPath], { cwd: basePath, encoding : 'utf8' });
    if(pandoc.stdout) {
      console.log(pandoc.stdout);
    }
    break;
  case '.md':
    // No Processing needed, but do need to copy
    console.log('::: Copying existing md file');
    var cpy = child.spawnSync('cp', [pathDirBase, mdOutPath], { cwd: basePath, encoding : 'utf8' });
    break;
  default:
    console.log('!!! Unhandled extension: ' + path.ext + ' in ' + filePath);
    processed = false;
  }

  console.log('::: Done processing file ' + path.base);
  
  return {
    wasProcessed: processed,
    outputPath: mdOutPath
  };
}

function process(file, parent) {
  var fileStat = fs.lstatSync(file);
  var tmpPath = tempDirPath + '/' + splitPath(file, basePath);
  
  if (fileStat.isDirectory()) {
    fs.mkdirSync(tmpPath);
    var fileObj = global.app.models["Item"].upsert({
      name: Path.basename(tmpPath),
      parentId: parent.id
      }, {}, function () {
    });
    var files = fs.readdirSync(file);
    for (var i = 0; i < files.length; i++) {
      process(Path.join(file, files[i]), fileObj);
    }
  } else if (fileStat.isFile()) {
    var processedFile = processToMarkdown(file, basePath);
    if (processedFile.wasProcessed && fs.existsSync(processedFile.outputPath)) {
      console.log("Processing " + processedFile.outputPath + "...");
      var mdRoot = {name: Path.basename(processedFile.outputPath), parentId: parent.id, itemIds: []};
      mdToKohese(processedFile.outputPath, mdRoot);
    }
  } else {
    console.log('!!! Warning: ' + file + ' is not a file or directory.');
  }
}

function deleteFile(path) {
  var fileStat = fs.lstatSync(path);
  if (fileStat.isDirectory()) {
    var delList = fs.readdirSync(path);
    for (var i = 0; i < delList.length; i++) {
      deleteFile(Path.join(path, delList[i]));
    }
      
    fs.rmdirSync(path);
  } else if (fileStat.isFile()) {
    fs.unlinkSync(path);
  } else {
    console.log('!!! Warning: ' + path + ' is not a file or directory.');
  }
}