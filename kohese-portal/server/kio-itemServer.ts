/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const Fetch = require('node-fetch');
const StringReplaceAsync = require('string-replace-async');

import { ItemProxy } from '../common/src/item-proxy';
import { KoheseModel } from '../common/src/KoheseModel';
import { KoheseView } from '../common/src/KoheseView';
import { TreeConfiguration } from '../common/src/tree-configuration';
import { TreeHashMap } from '../common/src/tree-hash';
import { ItemCache } from '../common/src/item-cache';
import { KDBRepo } from './kdb-repo';
import { KDBCache } from './kdb-cache';

const MdToKohese = require('./md-to-kohese');

var kio = require('./koheseIO');
var kdb = require('./kdb');
const kdbFS = require('./kdb-fs');
var fs = require('fs');
var child = require('child_process');
var itemAnalysis = require('./analysis');
var serverAuthentication = require('./server-enableAuth');
const Path = require('path');
const importer = require('./directory-ingest');
var _ = require('underscore');
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const _ICONS_FILE_PATH = Path.resolve(fs.realpathSync(__dirname), '..', '..',
  'icons.txt');
const _REPORTS_DIRECTORY_PATH = Path.resolve(fs.realpathSync(__dirname), '..',
  '..', 'reports');

console.log('::: Initializing KIO Item Server');

if(global['app']){
  global['app'].on('newSession', KIOItemServer);
}

if (!fs.existsSync(_REPORTS_DIRECTORY_PATH)) {
  fs.mkdirSync(_REPORTS_DIRECTORY_PATH);
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.getWorkingTree().getChangeSubject().subscribe(async change => {
  console.log('+++ Received notification of change: ' + change.type);
  if (change.type === 'dirty') {
    return;
  }

  if(change.proxy){
    console.log(change.kind);
    console.log(change.proxy.item);
  }

  // Ignore internal instances
  if (!change.proxy.internal){
    switch (change.type){
      case 'create':
      case 'update':
        let status = [];
        if (!change.enableRepo) {
          status = await kdb.storeModelInstance(change.proxy, change.type === 'create')
        }
        let proxy : ItemProxy = change.proxy;
        proxy.updateVCStatus(status, false);
        let createNotification = {
          type: change.type,
          kind: change.kind,
          id: proxy.item.id,
          item: proxy.cloneItemAndStripDerived(),
          status: status
        };
        kio.server.emit('Item/' + change.type, createNotification);
        // Update RepoMountData based on Repo Mount Point Change (move)
        if (change.kind === 'Repository' && change.type === 'update' && !change.enableRepo && change.modifications.parentId) {
          let mountedRepoProxy = ItemProxy.getWorkingTree().getProxyFor(proxy.item.id + '-mount');
          mountedRepoProxy.item.mountPoint = change.modifications.parentId.to;
          mountedRepoProxy.updateItem('RepoMount', mountedRepoProxy.item);
        }
        break;
      case 'delete':
        let deleteNotification = {
          type: change.type,
          kind: change.kind,
          id: change.proxy.item.id
        };
        if (!change.unmounting) {
          kdb.removeModelInstance(change.proxy);
        }
        kio.server.emit('Item/' + change.type, deleteNotification);
        break;
      case 'loading':
      case 'loaded':
      case 'dirty':
      case 'reference-added':
      case 'reference-removed':
      case 'reference-reordered':
        // Ignore
        break;
      default:
        console.log('*** Not processing change notification: ' + change.type);
      }
  }

});

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
let retrieveVCStatus = KDBRepo.getStatus();
retrieveVCStatus.then((status) => {
  console.log('::: Processing repo status', status);
  var idStatusArray = [];
  let workingTree : TreeConfiguration = ItemProxy.getWorkingTree();
  for (var id in status) {
    for (var j = 0; j < status[id].length; j++) {
      let statusRecord = status[id][j];

      if (statusRecord.itemId) {
        idStatusArray.push({
          id: statusRecord.itemId,
          status: statusRecord.status
        });

        // Create lost item to represent the item if it does not exist
        let proxy = workingTree.getProxyFor(statusRecord.itemId);
        if (!proxy) {
          // TODO: Need to evaluate and remove the creation of missing proxies from this location
          proxy = ItemProxy.createMissingProxy('Item', 'id', statusRecord.itemId, workingTree);
        }
        proxy.updateVCStatus(statusRecord.status, false);
      }
    }
    console.log('::: Status length (Initial):' + idStatusArray.length);
  }
});

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function refreshRepoStatus() {
  let retrieveAllRepoStatus = KDBRepo.getStatus();
  retrieveAllRepoStatus.then((status) => {
    console.log('::: Processing all repo status for refresh', status);
    var idStatusArray = [];
    let workingTree: TreeConfiguration = ItemProxy.getWorkingTree();
    let currentVCStatus = workingTree.getVCStatus();
    // TODO: Future is to update Item in the tree if the VC Status of
    // of an item changed.  For example new and then deleted
    for (var x = 0; x<currentVCStatus.length; x++) {
      let itemVCStatus = currentVCStatus[x];
      let found: boolean = false;
      for (let repoID in status) {
        if (status[repoID].some(y => y.itemId === itemVCStatus.id)) {
          found = true;
        }
      }
      if (found === false) {
        let proxy = workingTree.getProxyFor(itemVCStatus.id);
        if (proxy) {
          proxy.deleteVCStatus();
        }
      }
    }
    for (var id in status) {
      for (var j = 0; j < status[id].length; j++) {
        let statusRecord = status[id][j];

        if (statusRecord.itemId) {
          idStatusArray.push({
            id: statusRecord.itemId,
            status: statusRecord.status
          });

          // Create lost item to represent the item if it does not exist
          let proxy = workingTree.getProxyFor(statusRecord.itemId);
          if (!proxy) {
            // TODO: Need to evaluate and remove the creation of missing proxies from this location
            proxy = ItemProxy.createMissingProxy('Item', 'id', statusRecord.itemId, workingTree);
          }
          proxy.updateVCStatus(statusRecord.status, false);
        }
      }
      console.log('::: Refresh Status length (Initial):' + idStatusArray.length);
    }
    let myTestStatus = workingTree.getVCStatus();
  });
  return retrieveAllRepoStatus
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function processRepoStatus(repoID) {
  let retrieveRepoStatus = KDBRepo.getRepoStatus(repoID);
  retrieveRepoStatus.then((status) => {
    console.log('::: Processing repo Item status', status);
    var idStatusArray = [];
    let workingTree: TreeConfiguration = ItemProxy.getWorkingTree();
    for (var j = 0; j < status.length; j++) {
      let statusRecord = status[j];

      if (statusRecord.itemId) {
        idStatusArray.push({
          id: statusRecord.itemId,
          status: statusRecord.status
        });

        // Create lost item to represent the item if it does not exist
        let proxy = workingTree.getProxyFor(statusRecord.itemId);
        if (!proxy) {
          // TODO: Need to evaluate and remove the creation of missing proxies from this location
          proxy = ItemProxy.createMissingProxy('Item', 'id', statusRecord.itemId, workingTree);
        }
        proxy.updateVCStatus(statusRecord.status, false);
      }
    }
    console.log('::: Item Status length (Initial):' + idStatusArray.length);
  });
  return retrieveRepoStatus;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function KIOItemServer(socket){

  console.log('>>> KIO Item Server: session %s connected from %s for %s',
      socket.id, socket.handshake.address, socket.koheseUser.username);

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/findById', function(request, sendResponse){
    console.log('::: session %s: Received findById for %s for user %s at %s',
        socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
    console.log(request);
    var proxy = ItemProxy.getWorkingTree().getProxyFor(request.id);
    sendResponse({
      kind: proxy.kind,
      item: proxy.cloneItemAndStripDerived()
    });
    console.log('::: Sent findById response for ' + request.id);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function consoleLogObject(message, object){
    if (message){
      console.log(message);
    }
    console.log(JSON.stringify(object, null, '  '));
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/getMetamodel', function(request, sendResponse){
    let requestReceiptTime = Date.now();
    var username = 'Unknown';
    if (socket.koheseUser){
      username = socket.koheseUser.username;
    }

    console.log('::: session %s: Received getMetamodel for user %s at %s for repo %s',
                socket.id, username, socket.handshake.address, request.forRepoId);

    let response = {
      timestamp: {
        requestTime: request.timestamp.requestTime,
        requestReceiptTime: requestReceiptTime,
        responseTransmitTime: null
      },
      cache: {
        Namespace: {},
        KoheseModel: {},
        KoheseView: {},
        KoheseUser: {}
      }
    };

    let repoProxy;
    repoProxy = ItemProxy.getWorkingTree().getRootProxy();

    function addItemToResponse(proxy){
      if (!response.cache[proxy.kind]){
        response.cache[proxy.kind] = {};
      }
      var kindCache = response.cache[proxy.kind];
      kindCache[proxy.item.id] = JSON.stringify(proxy.cloneItemAndStripDerived());
    }

    repoProxy.getChildByName('Model Definitions').visitChildren(null, (proxy) => {
      addItemToResponse(proxy);
    });

    repoProxy.getChildByName('View Model Definitions').visitChildren(null, (proxy) => {
      addItemToResponse(proxy);
    });

    repoProxy.getChildByName('Users').visitChildren(null, (proxy) => {
      addItemToResponse(proxy);
    });

    response.timestamp.responseTransmitTime = Date.now();

    console.log('::: Sending getMetaModel response');
    sendResponse(response);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/getItemCache', async function(request, sendResponse){

    function sendBulkCacheUpdate(key, value){
      console.log('### Sending BulkCacheUpdate for key: ' + key);
      let bulkUpdateMessage = {};
      bulkUpdateMessage[key] = value;
      socket.emit('Item/BulkCacheUpdate', bulkUpdateMessage);
    }

    let username = 'Unknown';
    let requestReceiptTime = Date.now();
    if (socket.koheseUser){
      username = socket.koheseUser.username;
    }
    console.log('::: session %s: Received getItemCache for user %s at %s', socket.id, username,
                socket.handshake.address);

    consoleLogObject('$$$ Request', request);

    let itemCache = ItemCache.getItemCache();
    let headCommit = await itemCache.getRef('HEAD');
    let incrementalDataToLoad;

    if (headCommit !== request.headCommit){
      if (request.incrementalCacheLoad && request.headCommit) {
        console.log('### Providing incrementalDataToLoad: ' + request.headCommit + ' -> ' + headCommit);
        incrementalDataToLoad = {
          HEAD: headCommit
        }
      } else {
        console.log('### Preparing BulkCacheUpdate Messages: ' + request.headCommit + ' -> ' + headCommit);
        let objectMap = itemCache.getObjectMap();
        sendBulkCacheUpdate('metadata', objectMap['metadata']);
        sendBulkCacheUpdate('refMap', objectMap['refMap']);
        sendBulkCacheUpdate('tagMap', objectMap['tagMap']);
        sendBulkCacheUpdate('kCommitMap', objectMap['kCommitMap']);
        for (let key in objectMap.kTreeMapChunks) {
          sendBulkCacheUpdate('kTreeMap', objectMap['kTreeMapChunks'][key]);
        }
        for (let key in objectMap.blobMapChunks) {
          sendBulkCacheUpdate('blobMap', objectMap['blobMapChunks'][key]);
        }
        console.log('### Sent BulkCacheUpdate Messages');
      }
    } else {
      console.log('### Item Cache is already in sync');
    }

    let response : any = {
      timestamp: {
        requestTime: request.timestamp.requestTime,
        requestReceiptTime: requestReceiptTime,
        responseTransmitTime: Date.now()
      }
    };

    if (incrementalDataToLoad){
      response.incrementalDataToLoad = incrementalDataToLoad;
    }

    console.log('::: Sending getItemCache response');
    sendResponse(response);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/getMissingCacheInfo', async function(request, sendResponse){

    let username = 'Unknown';
    let requestReceiptTime = Date.now();
    if (socket.koheseUser){
      username = socket.koheseUser.username;
    }
    console.log('::: session %s: Received getMissingCacheInfo for user %s at %s', socket.id, username,
                socket.handshake.address);

    consoleLogObject('$$$ Request', request);

    let itemCache = ItemCache.getItemCache();
    let missingCacheData = request.missingCacheData;
    let cacheData : any = {};

    // Retrieve missing data
    if(missingCacheData.blob){
      cacheData.blob = {};
      for(let oid in missingCacheData.blob){
        let blob = await itemCache.getBlob(oid);
        cacheData.blob[oid] = blob;
      }
    }

    if(missingCacheData.tree){
      cacheData.tree = {};
      for(let treehash in missingCacheData.tree){
        let tree = await itemCache.getTree(treehash);
        cacheData.tree[treehash] = tree;
      }
    }

    if(missingCacheData.root){
      cacheData.root = {};
      for(let rootTreehash in missingCacheData.root){
        let root = await itemCache.getTree(rootTreehash);
        cacheData.root[rootTreehash] = root;
      }
    }

    if(missingCacheData.commit){
      cacheData.commit = {};
      for(let commitId in missingCacheData.commit){
        let commit = await itemCache.getCommit(commitId);
        cacheData.commit[commitId] = commit;
      }
    }

    let response = {
      timestamp: {
        requestTime: request.timestamp.requestTime,
        requestReceiptTime: requestReceiptTime,
        responseTransmitTime: Date.now()
      },
      cacheData: cacheData
    };

    console.log('::: Sending getMissingCacheInfo response');
    sendResponse(response);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/getRepoHashmap', async function(request, sendResponse){
    var username = 'Unknown';
    if (socket.koheseUser){
      username = socket.koheseUser.username;
    }
    console.log('::: session %s: Received getRepoHashmap for user %s at %s', socket.id, username,
                socket.handshake.address);

    let working : TreeConfiguration = ItemProxy.getWorkingTree();
    await working.saveToCache();
    var repoTreeHashes = working.getRepoTreeHashes();

    let response = {
      repoTreeHashes: repoTreeHashes
    };

    console.log('::: Sending getRepoHashmap response');
    sendResponse(response);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/getAll', function(request, sendResponse){
    let requestTime = Date.now();
    var username = 'Unknown';
    if (socket.koheseUser){
      username = socket.koheseUser.username;
    }
    console.log('::: session %s: Received getAll for user %s at %s for repo %s',
                socket.id, username, socket.handshake.address, request.forRepoId);

    var repoTreeHashes = ItemProxy.getWorkingTree().getAllTreeHashes();
    if (!request.forRepoId){
      repoTreeHashes = ItemProxy.getWorkingTree().getAllTreeHashes();
    } else {
      let repoProxy = ItemProxy.getWorkingTree().getProxyFor(request.forRepoId);
      if (repoProxy){
        repoTreeHashes = repoProxy.getTreeHashMap();
      }
    }

    var response : any = {};
    if(!_.isEqual(request.repoTreeHashes, repoTreeHashes)){
      if (_.size(request.repoTreeHashes) === 0){
        console.log('--- KDB Does Not Match: Full response will be sent');

        response = {
            repoTreeHashes: repoTreeHashes,
            cache: {
              KoheseModel: {},
              KoheseView: {},
              KoheseUser: {}},
            sentAll: true
        };

        let repoProxy;
        if (request.forRepoId){
          repoProxy = ItemProxy.getWorkingTree().getProxyFor(request.forRepoId);
        } else {
          repoProxy = ItemProxy.getWorkingTree().getRootProxy();
        }

        repoProxy.visitChildren(null, (proxy) => {
          if (!response.cache[proxy.kind]){
            response.cache[proxy.kind] = {};
          }
          var kindCache = response.cache[proxy.kind];
          kindCache[proxy.item.id] = JSON.stringify(proxy.cloneItemAndStripDerived());
        });

      } else {
        // Send deltas to client
        console.log('--- KDB Does Not Match: Delta response will be sent');

        let thmDiff = TreeHashMap.diff(request.repoTreeHashes, repoTreeHashes);

        response = {
            repoTreeHashes: repoTreeHashes,
            addItems: [],
            changeItems: [],
            deleteItems: []
        };

        for (let itemId in thmDiff.summary.itemAdded) {
          var proxy = ItemProxy.getWorkingTree().getProxyFor(itemId);
          response.addItems.push({kind: proxy.kind, item: proxy.cloneItemAndStripDerived()});
        }

        for (let itemId in thmDiff.summary.contentChanged) {
          var proxy = ItemProxy.getWorkingTree().getProxyFor(itemId);
          response.changeItems.push({kind: proxy.kind, item: proxy.cloneItemAndStripDerived()});
        }

        for (let itemId in thmDiff.summary.itemDeleted){
          response.deleteItems.push(itemId);
        }

      }

    } else {
      console.log('--- KDB Matches: No changes will be sent');
      response.kdbMatches = true;
    }

    sendResponse(response);
    let responseTransmitTime = Date.now();
    console.log('::: Sent getAll response for repo: ' + request.forRepoId);
    for(let key in response){
      console.log(' --> ' + key + ': ' + _.size(response[key]));
    }
    console.log('$$$ Elapsed time: ' + (responseTransmitTime - requestTime)/1000);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/getStatus', async function(request, sendResponse){

    let requestTime = Date.now();
    var repoProxy = ItemProxy.getWorkingTree().getProxyFor(request.repoId);
    var username = 'Unknown';
    if (socket.koheseUser){
      username = socket.koheseUser.username;
    }

    console.log('::: session %s: Received getStatus for %s for repo: ' + repoProxy.item.name + ' rid: ' + request.repoId, socket.id, username);
    let workingTree : TreeConfiguration = ItemProxy.getWorkingTree();

    let status = await retrieveVCStatus;

    if (status) {
      var idStatusArray = workingTree.getVCStatus();

      // console.log('::: Current status');
      // console.log(JSON.stringify(idStatusArray, null, '  '));
      let responseTransmitTime = Date.now();

      sendResponse(idStatusArray);
      console.log('::: Status length: ' + idStatusArray.length);
      console.log('$$$ Elapsed time: ' + (responseTransmitTime - requestTime)/1000);

    } else {
      console.log('*** Error (Returned from getStatus)');
      console.log(status);
      sendResponse({error: 'status error'});
    }
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('getIcons', (request: any, sendResponse: Function) => {
    fs.readFile(_ICONS_FILE_PATH, 'utf8', (error: any, data: string) => {
      sendResponse(data.split('\n').filter((iconName: string) => {
        return !!iconName;
      }));
    });
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/upsert', function(request, sendResponse){
    console.log('::: session %s: Received upsert for id %s for user %s at %s',
        socket.id, request.item.id, socket.koheseUser.username, socket.handshake.address);
    console.log(request);

    var koheseUserName = socket.koheseUser.username;
    var item = request.item;
    var kind = request.kind;

    try {
      item.modifiedBy = koheseUserName;
      item.modifiedOn = Date.now();

      if(!item.createdBy){
        console.log('::: Updating created fields (instance) - ' + kind);
        item.createdBy = item.modifiedBy;
        item.createdOn = item.modifiedOn;
      }

      var proxy;

      if (item.id){
        proxy = ItemProxy.getWorkingTree().getProxyFor(item.id);

        // TODO need to move user password processing based on model definition
        if (proxy.kind === 'KoheseUser'){
          if (item.password){
            // Encrypt the password
            serverAuthentication.setPassword(item, item.password);
          } else {
            // Password was not supplied, so use the old value
            item.password = proxy.item.password;
          }
        }

        proxy.updateItem(kind, item);
      } else {
        // Creating a new item
        switch (kind) {
          case 'KoheseModel':
            proxy = new KoheseModel(item);
            break;
          case 'KoheseView':
            proxy = new KoheseView(item, TreeConfiguration.getWorkingTree());
            break;
          case 'KoheseUser':
            if (item.password){
              // Encrypt the password
              serverAuthentication.setPassword(item, item.password);
            }
            proxy = new ItemProxy(kind, item);
            break;
          default:
            proxy = new ItemProxy(kind, item);
        }
      }

      sendResponse({
        kind: request.kind,
        item: proxy.cloneItemAndStripDerived()
      });

      console.log('::: Sent Item/upsert response');

    } catch (err){
      if (err.error){
        console.log('*** Error: ' + err.error);
        console.log(err);
      } else {
        console.log('*** Error: ' + err);
        console.log(err.stack);
      }
      sendResponse({error: err});
      console.log('::: Sent Item/upsert error');
    }
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/deleteById', function(request, sendResponse){
    console.log('::: session %s: Received deleteById for %s for user %s at %s',
        socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
    console.log(request);

    var proxy = ItemProxy.getWorkingTree().getProxyFor(request.id);

    if (proxy){
      proxy.deleteItem(request.recursive);

      console.log('::: Deleted %s #%s#', request.kind, request.id);

      sendResponse({
        deleted: 'true',
        kind: request.kind,
        id: request.id
      });

    } else {

      console.log('::: Item already Deleted %s #%s#', request.kind, request.id);

      sendResponse({
        deleted: 'true',
        kind: request.kind,
        id: request.id
      });

    }

  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/performAnalysis', function(request, sendResponse) {

    console.log('::: session %s: Received performAnalysis for %s for user %s at %s',
        socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
    console.log(request);

    itemAnalysis.performAnalysis(request.kind, request.id, sendResponse);

  });

  socket.on('getUrlContent', async (request: any, respond: Function) => {
    try {
      let response: Response = await Fetch(request.url);
      if (response.ok) {
        respond({
          content: await response.arrayBuffer(),
          contentType: response.headers.get('Content-Type')
        });
      }
    } catch (error) {
      console.log(error);
      respond({ content: '', contentType: '' });
    }
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('convertToMarkdown', async (request: any, respond: Function) => {
    console.log('::: session %s: Received convertToMarkdown for %s for user %s at %s',
        socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
    console.log(request);
    let beforeTime = Date.now();
    let parameterlessType: string = ((request.contentType.indexOf(';') !==
      -1) ? request.contentType.substring(0, request.contentType.indexOf(
      ';')) : request.contentType);
    if (parameterlessType === 'application/pdf') {
      let parameters: Array<string> = ['-jar', Path.resolve(Path.dirname(Path.
        dirname(fs.realpathSync(__dirname))), 'external', 'PdfConverter',
        'PdfConverter.jar')];
      if (request.parameters.forceTocStructuring) {
        parameters.push('-t');
      }

      if (request.parameters.doNotStructure) {
        parameters.push('-u');
      }

      if (request.parameters.matchSectionNamesLeniently) {
        parameters.push('-l');
      }

      if (request.parameters.moveFootnotes) {
        parameters.push('-f');
      }

      if (request.parameters.tocEntryPadding) {
        parameters.push('--toc-entry-padding=' + request.parameters.
          tocEntryPadding);
      }

      if (!!request.parameters.tocBeginning) {
        parameters.push('--toc-begin=' + request.parameters.tocBeginning);
      }

      if (!!request.parameters.tocEnding) {
        parameters.push('--toc-end=' + request.parameters.tocEnding);
      }

      if (!!request.parameters.headerLines) {
        parameters.push('--header-length=' + request.parameters.headerLines);
      }

      if (!!request.parameters.footerLines) {
        parameters.push('--footer-length=' + request.parameters.footerLines);
      }

      let pdfConversionProcess: any = child.spawn('java', parameters,
        undefined);
      pdfConversionProcess.stdin.write(request.content);
      pdfConversionProcess.stdin.end();
      let output: string = '';
      pdfConversionProcess.stdout.on('data', (data: string) => {
        output += data;
      });
      pdfConversionProcess.on('close', (exitCode: number) => {
        let afterTime = Date.now();
        console.log('::: Sending response for convertToMarkdown (pdf): ' + (afterTime-beforeTime)/1000);
        respond(output);
      });
      pdfConversionProcess.on('error', (error: any) => {
        respond(undefined);
      });
    } else {
      let format: string;
      let temporaryFileName: string = String(new Date().getTime());
      let temporaryDirectoryPath: string = Path.resolve(fs.realpathSync(
        __dirname), temporaryFileName);
      fs.mkdirSync(temporaryDirectoryPath);
      let temporaryFilePath: string = Path.resolve(temporaryDirectoryPath,
        temporaryFileName);
      let mediaDirectoryPath: string;
      fs.writeFileSync(temporaryFilePath, request.content);
      switch (parameterlessType) {
        case 'application/vnd.openxmlformats-officedocument.' +
          'wordprocessingml.document':
          mediaDirectoryPath = Path.resolve(temporaryDirectoryPath, 'media');
          format = 'docx';
          break;
        case 'application/msword':
        case 'application/rtf':
          child.spawnSync('soffice', ['--headless', '--convert-to', 'odt',
            '--outdir', temporaryDirectoryPath, temporaryFilePath], undefined);
          fs.unlinkSync(temporaryFilePath);
          temporaryFilePath = Path.resolve(temporaryDirectoryPath,
            temporaryFileName + '.odt');
          if (!fs.existsSync(temporaryFilePath)) {
            respond('**Unable to preview file**\n\nA possible cause may be an ' +
              'soffice process on the server machine.');
            return;
          }

          // Fall through to '.odt' case
          // tslint:disable-next-line:no-switch-case-fall-through
        case 'application/vnd.oasis.opendocument.text':
          mediaDirectoryPath = Path.resolve(temporaryDirectoryPath,
            'Pictures');
          format = 'odt';
          break;
        default:
          mediaDirectoryPath = temporaryDirectoryPath;
          format = 'html';
      }

      let pandocParameters: Array<string> = ['-f', format, '-t', 'commonmark',
        '--atx-headers', '-s'];

      if (format !== 'html') {
        pandocParameters.push('--extract-media');
        pandocParameters.push(temporaryDirectoryPath);
      }

      pandocParameters.push(temporaryFilePath);

      let pandocProcess: any = child.spawn('pandoc', pandocParameters,
        undefined);
      let preview: string = await new Promise<string>((resolve: (output:
        string) => void, reject: () => void) => {
        let output: string = '';
        pandocProcess.stdout.on('data', (data: string) => {
          output += data;
        });
        pandocProcess.on('close', (exitCode: number) => {
          fs.unlinkSync(temporaryFilePath);
          resolve(output);
        });
        pandocProcess.on('error', (error: any) => {
          respond(undefined);
        });
      });
      /*
        Regular expression information:
          - '\s\S' is used instead of '.' to handle line breaks since the 's'
            flag was unrecognized as of 2019-07-08.
          - This regular expression is intended to handle images embedded in
            links.
      */
      preview = await StringReplaceAsync(preview,
        /\[(?:(?:!\[[\s\S]*?\]\(([\s\S]+?)\))|(?:[\s\S]*?))\]\(([\s\S]+?)\)/g,
        async (matchedSubstring: string, embeddedImageCaptureGroup: string,
          targetCaptureGroup: string, index: number, originalString: string) => {
          let replacement: string = '';
          if ((index > 0) && (originalString.charAt(index - 1) === '!')) {
            replacement = await embedImage(matchedSubstring, targetCaptureGroup,
              request.parameters.pathBase, mediaDirectoryPath);
          } else {
            replacement = matchedSubstring;

            if (embeddedImageCaptureGroup) {
              replacement = await embedImage(matchedSubstring,
                embeddedImageCaptureGroup, request.parameters.pathBase,
                mediaDirectoryPath);
              if (!/^https?:\/\//.test(targetCaptureGroup) &&
                !targetCaptureGroup.startsWith('javascript:')) {
                let replacementCaptureGroupIndex: number = replacement.indexOf(
                  targetCaptureGroup);
                replacement = replacement.substring(0,
                  replacementCaptureGroupIndex) + request.parameters.pathBase +
                  targetCaptureGroup + replacement.substring(
                    replacementCaptureGroupIndex + targetCaptureGroup.length);
              }
            } else {
              if (!/^https?:\/\//.test(targetCaptureGroup) &&
                !targetCaptureGroup.startsWith('javascript:')) {
                let matchedSubstringCaptureGroupIndex: number = matchedSubstring.
                  indexOf(targetCaptureGroup);
                replacement = matchedSubstring.substring(0,
                  matchedSubstringCaptureGroupIndex) + request.parameters.
                    pathBase + targetCaptureGroup + matchedSubstring.substring(
                      matchedSubstringCaptureGroupIndex + targetCaptureGroup.length);
              } else {
                replacement = matchedSubstring;
              }
            }
          }

          return replacement;
        });

      if (fs.existsSync(mediaDirectoryPath)) {
        let directoryContents: Array<string> = fs.readdirSync(
          mediaDirectoryPath);
        for (let j: number = 0; j < directoryContents.length; j++) {
          fs.unlinkSync(Path.resolve(mediaDirectoryPath, directoryContents[
            j]));
        }

        if (mediaDirectoryPath !== temporaryDirectoryPath) {
          fs.rmdirSync(mediaDirectoryPath);
        }
      }

      fs.rmdirSync(temporaryDirectoryPath);

      let afterTime = Date.now();
      console.log('::: Sending response for convertToMarkdown (not pdf): ' + (afterTime-beforeTime)/1000);
      respond(preview);
    }
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('importMarkdown', (request: any, respond: Function) => {
    console.log('::: session %s: Received importMarkdown for %s for user %s at %s',
        socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
    // console.log(request);
    let timestamp: number = Date.now();
    MdToKohese.convertMarkdownToItems(request.markdown, {
      name: request.fileName,
      parentId: request.parentId,
      modifiedBy: socket.koheseUser.username,
      modifiedOn: timestamp,
      createdBy: socket.koheseUser.username,
      createdOn: timestamp,
      itemIds: []
    }, true);
    respond();
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/generateReport', async (request, sendResponse) => {
    console.log('::: session %s: Received generateReport for %s for user %s at %s',
        socket.id, request.reportName, socket.koheseUser.username, socket.handshake.address);

    let metaDataString: Array<string> = request.content.split('\n\n', 3);
    fs.writeFileSync(Path.resolve(_REPORTS_DIRECTORY_PATH, '.' + request.
      reportName), metaDataString.join('\n\n'), undefined);
    if (request.format === 'text/markdown') {
      fs.writeFileSync(Path.resolve(_REPORTS_DIRECTORY_PATH, request.
        reportName), request.content, undefined);
      sendResponse();
    } else {
      let title: string = request.reportName;
      let extensionBeginningIndex: number = title.lastIndexOf('.');
      if (extensionBeginningIndex !== -1) {
        title = title.substring(0, extensionBeginningIndex);
      }

      let pandocProcess: any = child.spawn('pandoc', ['-f', 'commonmark',
        '-t', 'html', '-s', '-M', 'title=' + title], undefined);
      pandocProcess.stdin.write(request.content);
      pandocProcess.stdin.end();
      let reportContent: string = await new Promise<string>((resolve: (output:
        string) => void, reject: () => void) => {
        let output: string = '';
        pandocProcess.stdout.on('data', (data: string) => {
          output += data;
        });
        pandocProcess.on('close', (exitCode: number) => {
          resolve(output);
        });
        pandocProcess.on('error', (error: any) => {
          sendResponse(undefined);
        });
      });

      let reportPath: string = Path.resolve(_REPORTS_DIRECTORY_PATH, request.
        reportName);
      if ((request.format === 'application/vnd.oasis.opendocument.' +
        'text') || (request.format === 'application/vnd.openxmlformats-' +
        'officedocument.wordprocessingml.document')) {
        pandocProcess = child.spawn('pandoc', ['-f', 'html', '-t', 'odt',
          '-s', '-o', reportPath], undefined);
        pandocProcess.stdin.write(reportContent);
        pandocProcess.stdin.end();
        await new Promise<string>((resolve: () => void, reject:
          () => void) => {
          let output: string = '';
          pandocProcess.stdout.on('data', (data: string) => {
            output += data;
          });
          pandocProcess.on('close', (exitCode: number) => {
            resolve();
          });
          pandocProcess.on('error', (error: any) => {
            sendResponse(undefined);
          });
        });

        if (request.format === 'application/vnd.openxmlformats-' +
          'officedocument.wordprocessingml.document') {
          let intermediateFilePath: string = reportPath;
          if (reportPath.endsWith('.docx')) {
            intermediateFilePath = reportPath.substring(0, reportPath.length -
              4) + 'odt';
            await new Promise<void>((resolve: () => void, reject:
              () => void) => {
              fs.rename(reportPath, intermediateFilePath, (error: any) => {
                if (error) {
                  reject();
                } else {
                  resolve();
                }
              });
            });
          }

          let sofficeProcess: any = child.spawn('soffice', ['--headless',
            '--convert-to', 'docx', '--outdir', _REPORTS_DIRECTORY_PATH,
            intermediateFilePath], undefined);
          sofficeProcess.on('close', async (exitCode: number) => {
            await new Promise<void>((resolve: () => void, reject:
              () => void) => {
              fs.unlink(intermediateFilePath, (error: any) => {
                if (error) {
                  reject();
                } else {
                  resolve();
                }
              });
            });
            if (exitCode === 0) {
              let convertedFilePath: string;
              let lastPeriodIndex: number = intermediateFilePath.lastIndexOf(
                '.');
              if (lastPeriodIndex > -1) {
                convertedFilePath = intermediateFilePath.substring(0,
                  lastPeriodIndex + 1) + 'docx';
              } else {
                convertedFilePath = intermediateFilePath + '.docx';
              }

              if (convertedFilePath === reportPath) {
                sendResponse();
              } else {
                fs.rename(convertedFilePath, reportPath, (error: any) => {
                  if (error) {
                    sendResponse(undefined);
                  } else {
                    sendResponse();
                  }
                });
              }
            } else {
              sendResponse(undefined);
            }
          });
          sofficeProcess.on('error', (error: any) => {
            sendResponse(undefined);
          });
        } else {
          sendResponse();
        }
      } else {
        fs.writeFile(reportPath, reportContent, 'utf8', (error: any) => {
          if (error) {
            console.log(error);
            sendResponse(error);
          } else {
            sendResponse();
          }
        });
      }
    }
  });


  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('getReportMetaData', (request: any, respond: Function) => {
    console.log('::: session %s: Received getReportMetaData for user %s at %s',
        socket.id, socket.koheseUser.username, socket.handshake.address);
    respond(fs.readdirSync(_REPORTS_DIRECTORY_PATH).filter((fileName: string) => {
      // Filter for files that contain report data, by excluding metadata files that start with '.'
      return (!fileName.startsWith('.'));
    }).map((fileName: string) => {
      let metaContent;
      let fullFilePath = Path.resolve(_REPORTS_DIRECTORY_PATH, '.' + fileName);
      if (fs.existsSync(fullFilePath)) {
        metaContent = fs.readFileSync(fullFilePath, 'utf8');
      }
      return {
        name: Path.basename(fileName),
        metaContent: metaContent
      }
    }));
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Repository/getAvailableRepositories', (request: any, respond: Function) => {
    console.log('::: session %s: Received getAvailableRepositories for user %s at %s',
      socket.id, socket.koheseUser.username, socket.handshake.address);
    let repositoryData = kdb.getAvailableRepositories();
    respond(repositoryData);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Repository/refreshRepositories', async (request: any, respond: Function) => {
    console.log('::: session %s: Received refreshRepositories for user %s at %s',
      socket.id, socket.koheseUser.username, socket.handshake.address);
    let repositoryRefreshStatus: boolean = false;
    let status = await refreshRepoStatus();
    if (status) {
      let workingTree: TreeConfiguration = ItemProxy.getWorkingTree();
      var idStatusArray = workingTree.getVCStatus();
      let repoStatusNotification = {
        id: request.id,
        status: idStatusArray
      };
      kio.server.emit('Repository/updateRepoStatus', repoStatusNotification);
      repositoryRefreshStatus = true;
    }
    respond(repositoryRefreshStatus);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Repository/getDisabledRepositories', (request: any, respond: Function) => {
    console.log('::: session %s: Received getDisabledRepositories for user %s at %s',
      socket.id, socket.koheseUser.username, socket.handshake.address);
    let repositoryData = kdb.getDisabledRepositories();
    respond(repositoryData);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Repository/unMountRepository', (request: any, respond: Function) => {
    console.log('::: session %s: Received UnMountRepository for user %s at %s',
      socket.id, socket.koheseUser.username, socket.handshake.address);
    var proxy = ItemProxy.getWorkingTree().getProxyFor(request.repoId);
    kdb.unMountRepository(request.repoId)
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Repository/disableRepository', (request: any, respond: Function) => {
    console.log('::: session %s: Received disableRepository for user %s at %s',
      socket.id, socket.koheseUser.username, socket.handshake.address);
    console.log('^^^ Received Disable Mount request ', request)
    var proxy = ItemProxy.getWorkingTree().getProxyFor(request.repoId)
    kdb.disableRepository(request.repoId)
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Repository/enableRepository', (request: any, respond: Function) => {
    console.log('::: session %s: Received enableRepository for user %s at %s',
      socket.id, socket.koheseUser.username, socket.handshake.address);
    console.log('^^^ Received Enabled Mount request ', request)
    kdb.enableRepository(request.repoId)
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Repository/mountRepository', async (request: any, respond: Function) => {
    console.log('::: session %s: Received mountRepository for user %s at %s',
      socket.id, socket.koheseUser.username, socket.handshake.address);
    console.log('^^^ Received Mount Repository request ', request)
    await kdb.openRepository(request.id)
    let status = await processRepoStatus(request.id)
    if (status) {
      let workingTree: TreeConfiguration = ItemProxy.getWorkingTree();
      var idStatusArray = workingTree.getVCStatus();
      let repoStatusNotification = {
        id: request.id,
        status: idStatusArray
      };
      kio.server.emit('Repository/updateRepoStatus', repoStatusNotification);
    } else {
      console.log('*** Error Occurred with gettingRepoStatus ')
      console.log(status);
    }
    // TODO: Need to get this code working. Getting error Proxy does not match missing root tree
    // let mountedRepoProxy = ItemProxy.getWorkingTree().getProxyFor(request.id + '-mount');
    // mountedRepoProxy.updateItem('RepoMount', mountedRepoProxy.item);
    // Get Status of RepoMountDefinitions
    let repoMountStatus = await processRepoStatus('ROOT')
    if (repoMountStatus) {
      let workingTree: TreeConfiguration = ItemProxy.getWorkingTree();
      var idStatusArray = workingTree.getVCStatus();
      let repoStatusNotification = {
        id: request.id,
        status: idStatusArray
      };
      kio.server.emit('Repository/updateRepoStatus', repoStatusNotification);
    } else {
      console.log('*** Error Occurred with gettingRepoStatus of ROOT')
      console.log(status);
    }
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Repository/addRepository', (request: any, respond: Function) => {
    console.log('::: session %s: Received addRepository for user %s at %s',
      socket.id, socket.koheseUser.username, socket.handshake.address);
    console.log('^^^ Received Add Mount request ', request)
    kdb.addRepository(request)
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('renameReport', (request: any, respond: Function) => {
    console.log('::: session %s: Received renameReport from %s to %s for user %s at %s',
        socket.id, request.oldReportName, request.newReportName, socket.koheseUser.username, socket.handshake.address);

    fs.renameSync(Path.resolve(_REPORTS_DIRECTORY_PATH, request.oldReportName),
      Path.resolve(_REPORTS_DIRECTORY_PATH, request.newReportName));
    fs.renameSync(Path.resolve(_REPORTS_DIRECTORY_PATH, '.' + request.
      oldReportName), Path.resolve(_REPORTS_DIRECTORY_PATH, '.' + request.
      newReportName));
    respond();
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('getReportPreview', (request: any, respond: Function) => {
    console.log('::: session %s: Received getReportPreview for %s for user %s at %s',
        socket.id, request.reportName, socket.koheseUser.username, socket.handshake.address);
    let reportPreview: string;
    let reportName: string = request.reportName;
    let format: string;
    let reportExtension: string = reportName.substring(reportName.lastIndexOf(
      '.'));
    if (reportExtension === '.md') {
      reportPreview = fs.readFileSync(Path.resolve(_REPORTS_DIRECTORY_PATH,
        reportName), 'utf8');
    } else {
      let intermediateFilePath: string;
      switch (reportExtension) {
        case '.docx':
          format = 'docx';
          break;
        case '.odt':
          format = 'odt';
          break;
        case '.rtf':
          child.spawnSync('soffice', ['--headless', '--convert-to', 'odt',
            '--outdir', _REPORTS_DIRECTORY_PATH, Path.resolve(
            _REPORTS_DIRECTORY_PATH, reportName)], undefined);
          reportName = reportName.substring(0, reportName.lastIndexOf('.')) +
            '.odt';
          intermediateFilePath = Path.resolve(_REPORTS_DIRECTORY_PATH,
            reportName);
          format = 'odt';
          break;
        default:
          format = 'html';
      }

      let pandocProcess: any = child.spawnSync('pandoc', ['-f', format, '-t',
        'commonmark', '--atx-headers', '--extract-media', __dirname, '-s', Path.
        resolve(_REPORTS_DIRECTORY_PATH, reportName)], undefined);

      reportPreview = pandocProcess.stdout.toString();
      let mediaDirectoryPath: string = Path.resolve(__dirname, 'media');
      reportPreview = reportPreview.replace(/!\[.*?\]\((.+?)\)/g,
        (matchedSubstring: string, captureGroup: string, index: number,
        originalString: string) => {
        let imagePath: string = Path.resolve(mediaDirectoryPath, captureGroup);
        if (fs.existsSync(imagePath)) {
          let matchedSubstringCaptureGroupIndex: number = matchedSubstring.
            indexOf(captureGroup);
          let dataUrl: string = 'data:image/';
          if (captureGroup.endsWith('.png')) {
            dataUrl += 'png';
          } else if (captureGroup.endsWith('.jpg') || captureGroup.endsWith(
            '.jpeg')) {
            dataUrl += 'jpeg';
          }

          dataUrl += ';base64,';
          dataUrl += fs.readFileSync(imagePath, { encoding: 'base64' });
          return matchedSubstring.substring(0,
            matchedSubstringCaptureGroupIndex) + dataUrl + matchedSubstring.
            substring(matchedSubstringCaptureGroupIndex + captureGroup.length);
        } else {
          return matchedSubstring;
        }
      });

      if (fs.existsSync(mediaDirectoryPath)) {
        let directoryContents: Array<string> = fs.readdirSync(
          mediaDirectoryPath);
        for (let j: number = 0; j < directoryContents.length; j++) {
          fs.unlinkSync(Path.resolve(mediaDirectoryPath, directoryContents[j]));
        }
        fs.rmdirSync(mediaDirectoryPath);
      }

      if (intermediateFilePath && fs.existsSync(intermediateFilePath)) {
        fs.unlinkSync(intermediateFilePath);
      }
    }

    respond(reportPreview);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('removeReport', (request: any, respond: Function) => {
    console.log('::: session %s: Received removeReport for %s for user %s at %s',
        socket.id, request.reportName, socket.koheseUser.username, socket.handshake.address);
    fs.unlinkSync(Path.resolve(_REPORTS_DIRECTORY_PATH, request.reportName));
    fs.unlinkSync(Path.resolve(_REPORTS_DIRECTORY_PATH, '.' + request.
      reportName));
    respond();
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('VersionControl/stage', async function (request, sendResponse) {
    console.log('::: session %s: Received VersionControl/stage for %s for user %s at %s',
        socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
    var idsArray = Array.from(request.proxyIds);
    let errorMap: any = {};
    var proxies = [];
    for (var i = 0; i < idsArray.length; i++) {
      console.log('--- Adding proxy for: ' + idsArray[i]);
      var proxy = ItemProxy.getWorkingTree().getProxyFor(idsArray[i]);
      proxies.push(proxy);
      var repositoryInformation = getRepositoryInformation(proxy);

      try {
        await KDBRepo.add(repositoryInformation.repositoryProxy.item.id,
          repositoryInformation.relativeFilePath);
      } catch (error) {
        console.log(error.stack);
        errorMap[String(idsArray[i])] = error;
      }
    }

    console.log('::: session %s: Sending response for VersionControl/stage for user %s at %s',
      socket.id, socket.koheseUser.username, socket.handshake.address);
    if (0 === Object.keys(errorMap).length) {
      updateStatus(proxies).then((statusMap) => {
        sendResponse(statusMap);
      });
    } else {
      sendResponse({
        error: errorMap
      });
    }
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('VersionControl/commit', function (request, sendResponse) {
    var idsArray : Array<string> = Array.from(request.proxyIds);

    KDBRepo.commit(idsArray, request.username, request.email,
      request.message).then(function (commitIdMap) {
        let proxies = [];
        var returnMap = {};
        for (var repositoryId in commitIdMap) {
          returnMap[repositoryId] = commitIdMap[repositoryId].commitId;
          var filePaths = commitIdMap[repositoryId].filesCommitted;
          for (var j = 0; j < filePaths.length; j++) {
            if (filePaths[j].endsWith('.json')) {
              var fileName = Path.basename(filePaths[j], '.json');
              var foundId = true;
              if (!UUID_REGEX.test(fileName)) {
                fileName = Path.basename(Path.dirname(filePaths[j]));
                if (!UUID_REGEX.test(fileName)) {
                  foundId = false;
                }
              }

              if (foundId) {
                proxies.push(ItemProxy.getWorkingTree().getProxyFor(fileName));
              }
            }
          }
        }

        updateStatus(proxies).then((statusMap) => {
          sendResponse(statusMap);
        }).then(() => {
          let kdbCache : KDBCache = <KDBCache>KDBCache.getItemCache();
          kdbCache.updateCache().then(() => {
            console.log('::: Updated Cache for commit');
          });
        });
    }).catch(function (err) {
      console.log(err.stack);
      sendResponse({
        error: err
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('VersionControl/push', function (request, sendResponse) {
    var idsArray = Array.from(request.proxyIds);
    KDBRepo.push(idsArray, request.remoteName, socket.koheseUser.username).
      then(function (pushStatusMap) {
      sendResponse(pushStatusMap);
    }).catch(function (err) {
      console.log(err.stack);
      sendResponse({
        error: err
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('VersionControl/addRemote', function (request, sendResponse) {
    KDBRepo.addRemote(request.proxyId, request.remoteName, request.url).
      then(function (remoteName) {
      sendResponse(remoteName);
    }).catch(function (err) {
      console.log(err.stack);
      sendResponse({
        error: err
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('VersionControl/getRemotes', function (request, sendResponse) {
    KDBRepo.getRemotes(request.proxyId).then(function (remoteNames) {
      sendResponse(remoteNames);
    }).catch(function (err) {
      console.log(err.stack);
      sendResponse({
        error: err
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('VersionControl/unstage', function (request, sendResponse) {
    var proxies = [];
    var repositoryPathMap = {};
    var idsArray = Array.from(request.proxyIds);
    for (var i = 0; i < idsArray.length; i++) {
      var proxy = ItemProxy.getWorkingTree().getProxyFor(idsArray[i]);
      proxies.push(proxy);
      var repositoryInformation = getRepositoryInformation(proxy);
      let repositoryId = repositoryInformation.repositoryProxy.item.id;
      if (!repositoryPathMap[repositoryId]) {
        repositoryPathMap[repositoryId] = [];
      }
      repositoryPathMap[repositoryId].push(repositoryInformation.relativeFilePath);
    }

    for (let repositoryId in repositoryPathMap) {
      KDBRepo.reset(repositoryId, repositoryPathMap[repositoryId]).then(
        // jshint -W083
        function () {
          updateStatus(proxies).then((statusMap) => {
            sendResponse(statusMap);
          });
        }
        // jshint +W083
      ).catch(function (err) {
        console.log(err.stack);
        sendResponse({
          error: err
        });
      });
    }
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('VersionControl/revert', function (request, sendResponse) {
    var proxies = [];
    var repositoryPathMap = {};
    var idsArray = Array.from(request.proxyIds);
    var pendingEvaluationPromises = [];

    for (let i = 0; i < idsArray.length; i++) {
      let proxy = ItemProxy.getWorkingTree().getProxyFor(idsArray[i]);
      let repositoryInformation = getRepositoryInformation(proxy);
      let repositoryId = repositoryInformation.repositoryProxy.item.id;

      // jshint -W083
      // eslint-disable-next-line no-unused-vars
      var evaluationPromise = new Promise((resolve, reject) => {
        KDBRepo.getItemStatus(repositoryId, repositoryInformation.relativeFilePath).then((status) => {

          var isStaged = false;
          var hasUnstagedChanges = false;

          for (var j = 0; j < status.length; j++) {
            if (status[j].startsWith('WT_')) {
              hasUnstagedChanges = true;
            }
            if (status[j].startsWith('INDEX_')) {
              isStaged = true;
            }
          }

          // Unstage if the item is staged without additional changes
          if(isStaged && !hasUnstagedChanges){
            // Item is staged, but does not have changes, so it needs to be unstaged to revert it
            KDBRepo.reset(repositoryId, [repositoryInformation.relativeFilePath]).then(() => {
              // file has been unstaged, need to retrieve updated status
              KDBRepo.getItemStatus(repositoryId, repositoryInformation.relativeFilePath).
                then((statusAfterUnstage) => {
                  resolve(statusAfterUnstage);
                }
              );
            });
          } else {
            resolve(status);
          }
        });
      });
      pendingEvaluationPromises.push(evaluationPromise);
    }
    // jshint +W083


    // Wait for any pending unstage requests to complete
    Promise.all(pendingEvaluationPromises).then(function(statusArray){
      // Determine if items need to be checked out or deleted
      for (let i = 0; i < idsArray.length; i++) {
        let proxy = ItemProxy.getWorkingTree().getProxyFor(idsArray[i]);
        let repositoryInformation = getRepositoryInformation(proxy);
        let repositoryId = repositoryInformation.repositoryProxy.item.id;
        var status = statusArray[i];

        var isNewUnstagedFile = false;

        for (let j = 0; j < status.length; j++) {
          if (status[j].endsWith('WT_NEW')) {
            isNewUnstagedFile = true;
            break;
          }
        }

        if (isNewUnstagedFile) {
          proxy.deleteItem(false);
        } else {
          if (!repositoryPathMap[repositoryId]) {
            repositoryPathMap[repositoryId] = [];
          }
          repositoryPathMap[repositoryId].push(repositoryInformation.relativeFilePath);
          proxies.push(proxy);
        }

      }

      // Checkout any remaining files
      var pendingCheckoutProxies = [];
      for (let repositoryId in repositoryPathMap) {
        pendingCheckoutProxies.push(KDBRepo.checkout(repositoryId, repositoryPathMap[repositoryId], true));
      }

      // Send response
      Promise.all(pendingCheckoutProxies)
      .then(function () {
        // Update content based on reverted files
        for (let j = 0; j < proxies.length; j++) {
          let proxy = proxies[j];
          var item = kdbFS.loadJSONDoc(proxy.repoPath);
          if (proxy.kind === 'Repository') {
            item.parentId = proxy.item.parentId;
          }
          proxy.updateItem(proxy.kind, item);
        }

        updateStatus(proxies).then((statusMap) => {
          sendResponse(statusMap);
        });
      }).catch(function (err) {
        console.log(err.stack);
        sendResponse({
          error: err
        });
      });

    });

  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('ImportDocuments', function (request, sendResponse) {
    console.log('::: session %s: Received ImportDocuments for user %s at %s',
        socket.id, socket.koheseUser.username, socket.handshake.address);

    try {
      var absolutes = [];
      var root = Path.dirname(fs.realpathSync(__dirname));
      root = Path.join(root, '..', 'data_import', socket.koheseUser.username);
      absolutes.push(Path.join(root, request.file));

      var results = importer.importFiles(socket.koheseUser.username, absolutes, request.parentItem);
      sendResponse(results);

    } catch (err) {
      console.log(err);
      console.log(err.stack);
      sendResponse({err:err});
    }
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('UploadImages', function (request, sendResponse) {
    console.log('::: session %s: Received UploadImages for user %s at %s',
        socket.id, socket.koheseUser.username, socket.handshake.address);

    try {
      var absolutes = [];
      var root = Path.dirname(fs.realpathSync(__dirname));
      root = Path.join(root, '..', 'data_import', socket.koheseUser.username);
      absolutes.push(Path.join(root, request.file));

      var results = importer.importFiles(socket.koheseUser.username, absolutes, request.parentItem);
      console.log('added ids');
      console.log(results);
      sendResponse(results);

    } catch (err) {
      console.log(err);
      console.log(err.stack);
      sendResponse({err:err});
    }
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('About/getCommitInfo', function (request: any, sendResponse) {
    console.log('::: session %s: Received About/getCommitInfo for user %s at %s',
        socket.id, socket.koheseUser.username, socket.handshake.address);
    let gitInfo = kdbFS.loadJSONDocIfItExists('./git-version.json');
    sendResponse(gitInfo);
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
async function embedImage(matchSource: string, match: string, pathBase:
  string, mediaDirectoryPath: string): Promise<string> {
  let replacement: string = '';
  let dataUrl: string = 'data:image/';
  // To-do: handle the match being present in the square brackets
  let matchSourceIndex: number = matchSource.indexOf(match);
  let imagePath: string = match.split(/\s+/, 1)[0];
  if (pathBase) {
    if (pathBase.startsWith('http')) {
      try {
        let imageUrl: string;
        if (/^https?:\/\//.test(imagePath)) {
          imageUrl = imagePath;
        } else {
          imageUrl = pathBase + imagePath;
        }
        let response: any = await Fetch(imageUrl);
        if (response.ok) {
          let contentType: string = response.headers.get('Content-Type');
          let type: string = ((contentType.indexOf(';') !== -1) ? contentType.
            substring(0, contentType.indexOf(';')) : contentType);
          replacement = matchSource.substring(0, matchSourceIndex) + dataUrl +
            type.substring(type.indexOf('/') + 1) + ';base64,' +
            (await response.buffer()).toString('base64') + matchSource.
            substring(matchSourceIndex + imagePath.length);
        }
      } catch (error) {
        console.log(error);
      }
    }
  } else {
    let mediaPath: string = Path.resolve(mediaDirectoryPath, imagePath);
    if (fs.existsSync(mediaPath)) {
      if (mediaPath.endsWith('.png')) {
        dataUrl += 'png';
      } else if (mediaPath.endsWith('.jpg') || mediaPath.endsWith('.jpeg')) {
        dataUrl += 'jpeg';
      }

      dataUrl += ';base64,';
      dataUrl += fs.readFileSync(mediaPath, { encoding: 'base64' });
      replacement = matchSource.substring(0, matchSourceIndex) + dataUrl +
        matchSource.substring(matchSourceIndex + imagePath.length);
    } else {
      replacement = matchSource;
    }
  }

  return replacement;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function updateStatus(proxies) {
  var statusMap = {};
  var promises = [];
  for (let i = 0; i < proxies.length; i++) {
    var repositoryInformation = getRepositoryInformation(proxies[i]);
    let promise = KDBRepo.getItemStatus(repositoryInformation.repositoryProxy.item.id,
        repositoryInformation.relativeFilePath);
    promises.push(promise.then((status) => {
      statusMap[proxies[i].item.id] = status;
      proxies[i].updateVCStatus(status, false);
    }));
  }

  return Promise.all(promises).then(() => {
    kio.server.emit('VersionControl/statusUpdated', statusMap);
    return statusMap;
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function getRepositoryInformation(proxy) {
  var repositoryProxy = proxy.getRepositoryProxy();
  while(repositoryProxy.parentProxy) {
    repositoryProxy = repositoryProxy.parentProxy.getRepositoryProxy();
  }

  var pathToRepo = repositoryProxy.repoPath.split('Root.json')[0];
  var relativeFilePath = proxy.repoPath.split(pathToRepo)[1];

  return {
    repositoryProxy: repositoryProxy,
    pathToRepo: pathToRepo,
    relativeFilePath: relativeFilePath
  };
}

module.exports.KIOItemServer = KIOItemServer;
