'use strict';


let afs = require('fs');
let path = require('path');
let _ = require('underscore');
// let memwatch = require('memwatch-ng');
// memwatch.on('leak', function(info) {
//   console.log('!!! Leak Info');
//   console.log(info);
// });

const fsPath = process.argv[2];
// const fsPath = '/home/dphillips/Backpack/Personal/Current.snap';
// const fsPath = '/home/dphillips/nomad/Backpack';
// const fsPath = '/home/dphillips/nomad';
// const fsPath = '.';
// const fsPath = '/media/dphillips/Totebag_A/Backup.snap';

console.log('::: Analyzing file system at ' + fsPath);

//////////////////////////////////////////////////////////////////////////
//
// Background:
//
// * Every file has an inode
// * The same file (inode) may be hard linked in multiple locations
//     * Need to convert inode to some common uuid
//     * If the inode is shared, we want to record that for restore
// * We only want to analyze the same file once if possible
//     * This is viable for a snapshot directory
//     * If dealing with a regular filesystem, the file would need to be rescanned
// * Need to be able to merge different snapshots
// * The file contents may have different file permissions and ownership in different locations
//     * Save the file contents only once
//     * Save the file permissions once
//     * Associate the file permissions with the file contents
// * Need to be able to store sym links
//
// Approach:
//
// * Initial map
//     * Map inodes for filesystem
//     * Use initial inode map to find common filesystem structure
//     * Build inode tree for files
//     * Evaluate each inode
//     * Build trees and blobs
// * Incremental update
//     * Use rsync or diff to find differences
//     * Evaluate each unique inode
//     * Build incremental trees and blobs
//
//////////////////////////////////////////////////////////////////////////

let inodeMap = {};
let fsMap = {};
let iteration = 0;
let checkpointAt = 100000;

let trackFileRefs = true;
let trackFileMap = true;
let writeSummaryFiles = true;

//////////////////////////////////////////////////////////////////////////
function analyze(fsPath) {
  // console.log('::: Analyzing: ' + fsPath);

  let fsStat = afs.lstatSync(fsPath);
  let fsExtendedPath;
  if (fsStat.isDirectory()){
    fsExtendedPath = fsPath + path.sep;
  } else {
    fsExtendedPath = fsPath;
  }

  let inodeEntry = inodeMap[fsStat.ino];

  if (inodeEntry){
    if(trackFileRefs){
      inodeEntry.refs.push(fsExtendedPath);
    }
  } else {
    let inodeData = {
      // fsStat: JSON.parse(JSON.stringify(fsStat)),
      refs: [ fsExtendedPath ],
    };

    inodeMap[fsStat.ino] = inodeData;
    inodeEntry = inodeData;

    // console.log(fsStat);
    // console.log('--- Dir: ' + fsStat.isDirectory());
    // console.log('--- File: ' + fsStat.isFile());
    // console.log('--- SymLink: ' + fsStat.isSymbolicLink());
    if (fsStat.isSymbolicLink()){
      let linkPath = afs.readlinkSync(fsPath);
      // console.log('==> ' + linkPath);
      inodeData.fileType = 'link';
      inodeData.symLinkTo = linkPath;
    }
    // console.log('--- Num Links: ' + fsStat.nlink);

    if (fsStat.isDirectory()){
      // console.log('::: Analyzing Dir: ' + fsPath);
      var fileList = afs.readdirSync(fsPath);
      inodeData.fileType = 'dir';
      inodeData.files = {};
      for (let fileIdx in fileList){
        let filename = fileList[fileIdx];
        let childPath = fsPath + path.sep + filename;
        let childINO = analyze(childPath);
        inodeData.files[filename] = childINO;
      }
    }

    if (fsStat.isFile()){
      inodeData.fileType = 'file';
    }
  }

  if (trackFileMap){
    fsMap[fsExtendedPath] = inodeEntry.fileType + '|' + fsStat.ino + '|' + inodeEntry.refs.length;
  }

  iteration++;

  if ((iteration % checkpointAt) === 0){
    if (iteration > 0){
      checkpoint(iteration, false);
    }
  }
  return fsStat.ino;
}

//////////////////////////////////////////////////////////////////////////
function splitObject (object, chunkSize) {
  let numKeys = _.size(object);
  let numChunks = Math.ceil(numKeys/chunkSize);

  // if (numChunks === 1){
  //   return object;
  // }

  console.log('::: Splitting Object with ' + numKeys + ' keys into ' + numChunks + ' chunks...');
  let sObject = { 0 : {}};
  let chunkIdx = 0;
  let keyIndex = 0;
  for (let key in object){
    // console.log('::: Copying key: ' + key + ' - ' + keyIndex + ' - ' + chunkIdx + ' - ' + chunkSize);
    sObject[chunkIdx][key] = object[key];
    keyIndex++;
    if ((keyIndex % chunkSize) === 0) {
      // Reached chunkSize, create new chunk
      // console.log('::: Creating chunk: ' + keyIndex + ' - ' + chunkIdx + ' - ' + chunkSize);
      chunkIdx++;
      sObject[chunkIdx] = {};
    }
  }

  // if (numChunks > chunkSize) {
  //   sObject = splitObject(sObject, chunkSize);
  // }

  return sObject;
}

//////////////////////////////////////////////////////////////////////////
function writeFileInChunks(filePath, object, chunkSize){
  let start, after, delta;

  start = Date.now();
  let sObject = splitObject(object, chunkSize);

  for(let chunkId in sObject){
    let objectString = JSON.stringify(sObject[chunkId], null, '  ');
    afs.writeFileSync(filePath + '.' + chunkId, objectString);
  }

  after = Date.now();
  delta = after - start;
  console.log ('::: Total time: ' + delta/1000);
}

//////////////////////////////////////////////////////////////////////////
function checkpoint(iteration, checkWrite){
  console.log('::: Checkpointing at ' + iteration + ' - ' + checkWrite);
  let chunkSize = 1000;
  if (checkWrite){
    if (writeSummaryFiles){
      console.log('::: Writing inodeMap');
      writeFileInChunks('./v-fs-analyze/inodeMap.json', inodeMap, chunkSize);

      console.log('::: Writing fsMap');
      writeFileInChunks('./v-fs-analyze/fsMap.json', fsMap, chunkSize);

    } else {
      console.log('!!! Skip writing file');
    }
  }
}

//////////////////////////////////////////////////////////////////////////
// Main Processing
//////////////////////////////////////////////////////////////////////////

analyze(fsPath);
checkpoint(iteration, true);
console.log('::: Final file count: ' + iteration);
