const Fetch = require('node-fetch');
const StringReplaceAsync = require('string-replace-async');

import { ItemProxy } from '../common/src/item-proxy';
import { TreeConfiguration } from '../common/src/tree-configuration';
import { TreeHashMap } from '../common/src/tree-hash';
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
ItemProxy.getWorkingTree().getChangeSubject().subscribe(change => {
  console.log('+++ Received notification of change: ' + change.type);
  if(change.proxy){
    console.log(change.kind);
    console.log(change.proxy.item);
  }

  // Ignore internal instances
  if (!change.proxy.internal){
    switch (change.type){
      case 'create':
      case 'update':
        kdb.storeModelInstance(change.proxy, change.type === 'create')
        .then(function (status) {
          let createNotification = {
              type: change.type,
              kind: change.kind,
              id: change.proxy.item.id,
              item: change.proxy.item,
              status: status
          };
          kio.server.emit('Item/' + change.type, createNotification);
        });
        break;
      case 'delete':
        let deleteNotification = {
          type: change.type,
          kind: change.kind,
          id: change.proxy.item.id,
          recursive: change.recursive
        };
        kdb.removeModelInstance(change.proxy);
        kio.server.emit('Item/' + change.type, deleteNotification);
        break;
      case 'loading':
      case 'loaded':
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
      item: proxy.item
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
        KoheseModel: {},
        KoheseView: {},
        KoheseUser: {}}
    };

    let repoProxy;
    repoProxy = ItemProxy.getWorkingTree().getRootProxy();

    function addItemToResponse(proxy){
      if (!response.cache[proxy.kind]){
        response.cache[proxy.kind] = {};
      }
      var kindCache = response.cache[proxy.kind];
      kindCache[proxy.item.id] = JSON.stringify(proxy.item);
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

    let itemCache = TreeConfiguration.getItemCache();
    let headCommit = await itemCache.getRef('HEAD');

    if (headCommit !== request.headCommit){
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
    } else {
      console.log('### Item Cache is already in sync');
    }

    let response = {
      timestamp: {
        requestTime: request.timestamp.requestTime,
        requestReceiptTime: requestReceiptTime,
        responseTransmitTime: null
      }
    };

    response.timestamp.responseTransmitTime = Date.now();

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

    let itemCache = TreeConfiguration.getItemCache();
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
          kindCache[proxy.item.id] = JSON.stringify(proxy.item);
        });

      } else {
        // Send deltas to client
        console.log('--- KDB Does Not Match: Delta response will be sent');

        var thmCompare = TreeHashMap.compare(request.repoTreeHashes, repoTreeHashes);
        let thmDiff = TreeHashMap.diff(request.repoTreeHashes, repoTreeHashes);
        // console.log('$$$ Diff Summary');
        // console.log(thmDiff.summary);
        // kdbFS.storeJSONDoc('./u.requestTHM.json', request.repoTreeHashes);
        // kdbFS.storeJSONDoc('./u.serverTHM.json', repoTreeHashes);
        // kdbFS.storeJSONDoc('./u.newDiff.json', thmDiff);
        // kdbFS.storeJSONDoc('./u.oldDiff.json', thmCompare);

        response = {
            repoTreeHashes: repoTreeHashes,
            addItems: [],
            changeItems: [],
            deleteItems: thmCompare.deletedItems
        };

        thmCompare.addedItems.forEach((itemId) => {
          var proxy = ItemProxy.getWorkingTree().getProxyFor(itemId);
          response.addItems.push({kind: proxy.kind, item: proxy.item});
//          console.log(proxy.item);
        });

        thmCompare.changedItems.forEach((itemId) => {
          var proxy = ItemProxy.getWorkingTree().getProxyFor(itemId);
          response.changeItems.push({kind: proxy.kind, item: proxy.item});
//          console.log(proxy.item);
        });
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
  socket.on('Item/getStatus', function(request, sendResponse){

    var repoProxy = ItemProxy.getWorkingTree().getProxyFor(request.repoId);
    console.log('::: Getting status for repo: ' + repoProxy.item.name + ' rid: ' + request.repoId);

    kdb.kdbRepo.getStatus(request.repoId, function(status){
      if (status) {
        var idStatusArray = [];
        for (var j = 0; j < status.length; j++) {
          let statusRecord = status[j];

          if (statusRecord.itemId){
            idStatusArray.push({
              id: statusRecord.itemId,
              status: statusRecord.status
            });
          }
        }

        sendResponse(idStatusArray);
      } else {
        console.log('*** Error (Returned from getStatus)');
        console.log(status);
        sendResponse({error: 'status error'});
      }
    });
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/getHistory', function(request, sendResponse){
    var username = 'Unknown';
    if (socket.koheseUser){
      username = socket.koheseUser.username;
    }

    console.log('::: Getting history for ' + request.onId + ' for user ' + username);

    let requestTime = Date.now();

    let proxy = ItemProxy.getWorkingTree().getProxyFor(request.onId);

    if (proxy && !proxy.history) {
      // Note:  This call is synchronous
      kdb.kdbRepo.walkHistoryForFile(request.onId, function(history){
        if (history){
          proxy.history = history;
        }
      });
    }

    if (proxy && proxy.history) {
      let responseTime = Date.now();
      console.log('+++ History for ' + request.onId);
      console.log(JSON.stringify(proxy.history, null, '  '));
      console.log('$$$ History response time: ' + (responseTime - requestTime)/1000);
      sendResponse(proxy.history);
    } else {
      console.log('*** History error for ' + request.onId);
      sendResponse({error: 'history error'});
    }
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
            // Request has a password
            serverAuthentication.setPassword(item, item.password);
          } else {
            // Password was not supplied, so use the old value
            item.password = proxy.item.password;
          }
        }

        proxy.updateItem(kind, item);
      } else {
        proxy = new ItemProxy(kind, item);
      }

      sendResponse({
        kind: request.kind,
        item: proxy.item
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

  socket.on('convertToMarkdown', async (request: any, respond: Function) => {
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

      respond(preview);
    }
  });

  socket.on('importMarkdown', (request: any, respond: Function) => {
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
  socket.on('Item/generateReport', function(request, sendResponse) {
    let metaDataString: Array<string> = request.content.split('\n\n', 3);
    fs.writeFileSync(Path.resolve(_REPORTS_DIRECTORY_PATH, '.' + request.
      reportName), metaDataString.join('\n\n'), undefined);
    if (request.format === '.md') {
      fs.writeFileSync(Path.resolve(_REPORTS_DIRECTORY_PATH, request.
        reportName), request.content, undefined);
    } else {
      let format: string;
      switch (request.format) {
        case 'application/vnd.openxmlformats-officedocument.' +
          'wordprocessingml.document':
          format = 'docx';
          break;
        case 'application/vnd.oasis.opendocument.text':
          format = 'odt';
          break;
        default:
          format = 'html5';
      }

      let pandocProcess: any = child.spawnSync('pandoc', ['-f', 'commonmark',
        '-t', format, '-s', '-o', Path.resolve(_REPORTS_DIRECTORY_PATH, request.
        reportName)], { input: request.content });

      if (pandocProcess.stdout) {
        console.log(pandocProcess.stdout);
      }
    }

    sendResponse();
  });


  socket.on('getReportMetaData', (request: any, respond: Function) => {
    respond(fs.readdirSync(_REPORTS_DIRECTORY_PATH).filter((fileName: string) => {
      return (!fileName.startsWith('.'));
    }).map((fileName: string) => {
      return {
        name: Path.basename(fileName),
        metaContent: fs.readFileSync(Path.resolve(_REPORTS_DIRECTORY_PATH, '.' + fileName), 'utf8')
      }
    }));
  });

  socket.on('renameReport', (request: any, respond: Function) => {
    fs.renameSync(Path.resolve(_REPORTS_DIRECTORY_PATH, request.oldReportName),
      Path.resolve(_REPORTS_DIRECTORY_PATH, request.newReportName));
    fs.renameSync(Path.resolve(_REPORTS_DIRECTORY_PATH, '.' + request.
      oldReportName), Path.resolve(_REPORTS_DIRECTORY_PATH, '.' + request.
      newReportName));
    respond();
  });

  socket.on('getReportPreview', (request: any, respond: Function) => {
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

  socket.on('removeReport', (request: any, respond: Function) => {
    fs.unlinkSync(Path.resolve(_REPORTS_DIRECTORY_PATH, request.reportName));
    fs.unlinkSync(Path.resolve(_REPORTS_DIRECTORY_PATH, '.' + request.
      reportName));
    respond();
  });

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
        await kdb.kdbRepo.add(repositoryInformation.repositoryProxy.item.id,
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

  socket.on('VersionControl/commit', function (request, sendResponse) {
    var idsArray = Array.from(request.proxyIds);

    kdb.kdbRepo.commit(idsArray, request.username, request.email,
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
        });
    }).catch(function (err) {
      console.log(err.stack);
      sendResponse({
        error: err
      });
    });
  });

  socket.on('VersionControl/push', function (request, sendResponse) {
    var idsArray = Array.from(request.proxyIds);
    kdb.kdbRepo.push(idsArray, request.remoteName, socket.koheseUser.username).
      then(function (pushStatusMap) {
      sendResponse(pushStatusMap);
    }).catch(function (err) {
      console.log(err.stack);
      sendResponse({
        error: err
      });
    });
  });

  socket.on('VersionControl/addRemote', function (request, sendResponse) {
    kdb.kdbRepo.addRemote(request.proxyId, request.remoteName, request.url).
      then(function (remoteName) {
      sendResponse(remoteName);
    }).catch(function (err) {
      console.log(err.stack);
      sendResponse({
        error: err
      });
    });
  });

  socket.on('VersionControl/getRemotes', function (request, sendResponse) {
    kdb.kdbRepo.getRemotes(request.proxyId).then(function (remoteNames) {
      sendResponse(remoteNames);
    }).catch(function (err) {
      console.log(err.stack);
      sendResponse({
        error: err
      });
    });
  });

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
      kdb.kdbRepo.reset(repositoryId, repositoryPathMap[repositoryId]).then(
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
        kdb.kdbRepo.getItemStatus(repositoryId, repositoryInformation.relativeFilePath).then((status) => {

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
            kdb.kdbRepo.reset(repositoryId, [repositoryInformation.relativeFilePath]).then(() => {
              // file has been unstaged, need to retrieve updated status
              kdb.kdbRepo.getItemStatus(repositoryId, repositoryInformation.relativeFilePath).
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
        pendingCheckoutProxies.push(kdb.kdbRepo.checkout(repositoryId, repositoryPathMap[repositoryId], true));
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
}

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

function updateStatus(proxies) {
  var statusMap = {};
  var promises = [];
  for (let i = 0; i < proxies.length; i++) {
    var repositoryInformation = getRepositoryInformation(proxies[i]);
    let promise = kdb.kdbRepo.getItemStatus(repositoryInformation.repositoryProxy.item.id,
        repositoryInformation.relativeFilePath);
    promises.push(promise.then((status) => {
      statusMap[proxies[i].item.id] = status;
    }));
  }

  return Promise.all(promises).then(() => {
    kio.server.emit('VersionControl/statusUpdated', statusMap);
    return statusMap;
  });
}

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
