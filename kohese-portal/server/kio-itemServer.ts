import { ItemProxy } from '../common/src/item-proxy';
import { TreeConfiguration } from '../common/src/tree-configuration';
import { TreeHashMap } from '../common/src/tree-hash';

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

console.log('::: Initializing KIO Item Server');

if(global['app']){
  global['app'].on('newSession', KIOItemServer);
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
          var notification = {
              type: change.type,
              kind: change.kind,
              id: change.proxy.item.id,
              item: change.proxy.item,
              status: status
          };
          kio.server.emit('Item/' + change.type, notification);
        });
        break;
      case 'delete':
        var notification = {
          type: change.type,
          kind: change.kind,
          id: change.proxy.item.id
        };
        kdb.removeModelInstance(change.proxy);
        kio.server.emit('Item/' + change.type, notification);
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
  socket.on('Item/getRepoHashmap', function(request, sendResponse){
    var username = 'Unknown';
    if (socket.koheseUser){
      username = socket.koheseUser.username;
    }
    console.log('::: session %s: Received getRepoHashmap for user %s at %s', socket.id, username,
                socket.handshake.address);

    // consoleLogObject('$$$ Request', request);

    var repoTreeHashes = ItemProxy.getWorkingTree().getRepoTreeHashes();

    // consoleLogObject('$$$ Server Repo THM', repoTreeHashes);

    // var thmCompare = TreeHashMap.compare(request.repoTreeHashes, repoTreeHashes);

    // consoleLogObject('$$$ Client/Server THM Compare', thmCompare);

    let response = {
      repoTreeHashes: repoTreeHashes
    };

    // consoleLogObject('$$$ Response', response);

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
    console.log('::: Getting status for repo: ' + repoProxy.item.name);

    kdb.kdbRepo.getStatus(request.repoId, function(status){
      if (status) {
        var idStatusArray = [];
        for (var j = 0; j < status.length; j++) {
          var fileString = status[j].path;
          if (fileString.endsWith('.json')) {
            var id = Path.basename(fileString, '.json');
            var foundId = true;
            if (!UUID_REGEX.test(id)) {
              id = Path.basename(Path.dirname(fileString));
              if (!UUID_REGEX.test(id)) {
                foundId = false;
              }
            }

            if (foundId) {
              idStatusArray.push({
                id: id,
                status: status[j].status
              });
            }
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
    console.log('::: Getting history for ' + request.onId);

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
      console.log(proxy.history);
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
      console.log('*** Error: ' + err);
      console.log(err.stack);
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

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/generateReport', function(request, sendResponse) {

    var showUndefined;
    var forItemId = request.onId;
    var outFormat = request.format;

    console.log('::: Generating ' + outFormat + ' Report for ' + forItemId);

    var proxy = ItemProxy.getWorkingTree().getProxyFor(forItemId);
    var result : any = {};

    if (!proxy){
      console.log('*** Could not find proxy for: ' + forItemId);
      sendResponse({error: 'Item not found: ' + forItemId});
      return;
    }

    console.log('::: Found proxy for: ' + forItemId + ' - ' + proxy.item.name);

    var reportTime = new Date();

    var outputBuffer = '::: Dump of ' + forItemId + ': ' + proxy.item.name + ' at ' +
        reportTime.toDateString() + ' ' + reportTime.toTimeString() + '\n\n';

    outputBuffer += proxy.getDocument(showUndefined);

    var itemName = proxy.item.name.replace(/[:\/]/g, ' ');
    var fileBasename ='dump.' + forItemId + '.' + itemName;
    var dumpFile= 'tmp_reports/' + fileBasename + '.md';
    console.log('::: Creating: ' + dumpFile);

    fs.writeFileSync(dumpFile, outputBuffer, {encoding: 'utf8', flag: 'w'});
    result.markdown = 'reports/' + fileBasename + '.md';

    if (outFormat) {
      console.log('::: Now spawning pandoc...');
      var outFile = 'tmp_reports/' + fileBasename + '.' + outFormat;
      console.log('::: Creating ' + outFile);
      var pandoc = child.spawnSync('pandoc', ['-f', 'markdown', '-t', outFormat, dumpFile, '-o', outFile]);
      if(pandoc.stdout) {
        console.log(pandoc.stdout);
      }
      result[outFormat] = 'reports/' + fileBasename + '.' + outFormat;
      console.log('::: Pandoc done!');
    }

    sendResponse(result);

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

    for (var i = 0; i < idsArray.length; i++) {
      var proxy = ItemProxy.getWorkingTree().getProxyFor(idsArray[i]);
      var repositoryInformation = getRepositoryInformation(proxy);
      var repositoryId = repositoryInformation.repositoryProxy.item.id;

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
      for (var i = 0; i < idsArray.length; i++) {
        var proxy = ItemProxy.getWorkingTree().getProxyFor(idsArray[i]);
        var repositoryInformation = getRepositoryInformation(proxy);
        let repositoryId = repositoryInformation.repositoryProxy.item.id;
        var status = statusArray[i];

        var isNewUnstagedFile = false;

        for (var j = 0; j < status.length; j++) {
          if (status[j].endsWith('WT_NEW')) {
            isNewUnstagedFile = true;
            break;
          }
        }

        if (isNewUnstagedFile) {
          proxy.deleteItem();
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
        for (var j = 0; j < proxies.length; j++) {
          var proxy = proxies[j];
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
