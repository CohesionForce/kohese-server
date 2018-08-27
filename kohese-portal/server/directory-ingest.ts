/** Directory ingester to Kohese
 *
 *  Requires: pandoc globally, soffice globally (libreoffice)
 */

import * as fs from 'fs';
var Path = require('path');
var child = require('child_process');
import { ItemProxy } from '../common/src/item-proxy';

var mdToKohese = require('./md-to-kohese');

var basePath;
var tempDirPath;

function importFiles(koheseUserName, files, parentId) {
  if (0 === files.length) {
    return;
  }

  basePath = Path.parse(files[0]).dir;
  var tempDir = 'tmp-' + Math.floor((Math.random() * 10000) + 1);
  tempDirPath = Path.join(basePath,tempDir);

  try {
    fs.mkdirSync(tempDirPath);
  } catch(err) {
    console.log('An error occured while creating the temp directory');
    console.log(err);
  }

  var addedIds = [];
  for (var i = 0; i < files.length; i++) {
    process(koheseUserName, files[i], parentId, addedIds);
  }

  console.log('All operations are completed. Now cleaning up...');
  deleteFile(tempDirPath);
  console.log('Clean up done!');

  return addedIds;
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

  // Need to convert doc extension to lower case for comparison
  var docType = path.ext.toLowerCase();

  switch (docType) {
  case '.doc':
    // doc processing
    console.log('::: Processing doc to odt to md');
    var soffice = child.spawnSync('soffice',
        ['--headless', '--convert-to', 'odt', pathDirBase,
          '--outdir', Path.join(tempDirPath, path.dir) ], { cwd: basePath, encoding : 'utf8' });
    if(soffice.stdout) {
      console.log(soffice.stdout);
    }
    var docPandoc = child.spawnSync('pandoc',
        ['-f', 'odt', '-t', 'commonmark', '--atx-headers', (tempPathDirName + '.odt'),
          '-o', mdOutPath], { cwd: basePath, encoding : 'utf8' });
    if(docPandoc.stdout) {
      console.log(docPandoc.stdout);
    }
    if(docPandoc.stderr) {
      console.log(docPandoc.stderr);
    }
    break;
  case '.odt':
    // odt processing
    console.log('::: Processing odt to md');
    var odtPandoc = child.spawnSync('pandoc',
        ['-f', 'odt', '-t', 'commonmark', '--atx-headers', pathDirBase, '-o', mdOutPath],
        { cwd: basePath, encoding : 'utf8' });
    if(odtPandoc.stdout) {
      console.log(odtPandoc.stdout);
    }
    break;
  case '.docx':
    // docx processing
    console.log('::: Processing docx to md');
    var docxPandoc = child.spawnSync('pandoc',
        ['-f', 'docx', '-t', 'commonmark', '--atx-headers', pathDirBase,
          '-o', mdOutPath], { cwd: basePath, encoding : 'utf8' });
    if(docxPandoc.stdout) {
      console.log(docxPandoc.stdout);
    }
    break;
  case '.htm':
  case '.html':
    // html processing
    console.log('::: Processing html to md');
    var htmlPandoc = child.spawnSync('pandoc',
        ['-f', 'html', '-t', 'commonmark', '--atx-headers', pathDirBase,
          '-o', mdOutPath], { cwd: basePath, encoding : 'utf8' });
    if(htmlPandoc.stdout) {
      console.log(htmlPandoc.stdout);
    }
    break;
  case '.md':
    // No Processing needed, but do need to copy
    console.log('::: Copying existing md file');
    // eslint-disable-next-line no-unused-vars
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

function process(koheseUserName, file, parent, addedIds) {
  var fileStat = fs.lstatSync(file);
  var tmpPath = tempDirPath + Path.sep + splitPath(file, basePath);

  if (fileStat.isDirectory()) {
    fs.mkdirSync(tmpPath);
    var createTime = Date.now();
    var fileObj = new ItemProxy('Item', {
      name: Path.basename(tmpPath),
      parentId: parent,
      createdBy: koheseUserName,
      createdOn: createTime,
      modifiedBy: koheseUserName,
      modifiedOn: createTime
      }).item;
    addedIds.push(fileObj.id);
    var files = fs.readdirSync(file);
    for (var i = 0; i < files.length; i++) {
      process(koheseUserName, Path.join(file, files[i]), fileObj.id, addedIds);
    }
  } else if (fileStat.isFile()) {
    var processedFile = processToMarkdown(file, basePath);
    if (processedFile.wasProcessed && fs.existsSync(processedFile.outputPath)) {
      console.log('Processing ' + processedFile.outputPath + '...');
      var mdRoot = {
        name: Path.basename(processedFile.outputPath),
        parentId: parent,
        itemIds: []
      };
      var added = mdToKohese(koheseUserName, processedFile.outputPath, mdRoot);
      for (var j = 0; j < added.length; j++) {
        addedIds.push(added[j]);
      }
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
