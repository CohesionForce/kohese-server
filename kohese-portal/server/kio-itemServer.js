var kio = require('./koheseIO.js');
var kdb = require('./kdb.js');
const kdbFs = require('./kdb-fs.js');
var fs = require('fs');
var child = require('child_process');
var itemAnalysis = require('../common/models/analysis.js');
var ItemProxy = require('../common/models/item-proxy.js');
var serverAuthentication = require('./server-enableAuth.js');
const Path = require('path');
const importer = require('./directory-ingest.js');
var _ = require('underscore');
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

console.log('::: Initializing KIO Item Server');

if(global.app){
  global.app.on('newSession', KIOItemServer);
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.getChangeSubject().subscribe(change => {
  console.log('+++ Received notification of change: ' + change.type);
  if(change.proxy){
    console.log(change.kind);
    console.log(change.proxy.item);    
  }

  switch (change.type){
    case 'create':
    case 'update':
      global.koheseKDB.storeModelInstance(change.proxy, change.type === 'create')
      .then(function (status) {
        var notification = {
            type: change.type,
            kind: change.kind,
            id: change.proxy.item.id,
            item: change.proxy.item,
            status: status
        };
        kio.server.emit(change.kind +'/' + change.type, notification);    
      });
      break;
    case 'delete':
      var notification = {
        type: change.type,
        kind: change.kind,
        id: change.proxy.item.id
      };
      global.koheseKDB.removeModelInstance(change.proxy);
      kio.server.emit(change.kind +'/' + change.type, notification);    
      break;
    default:
      console.log('*** Not processing change notification: ' + change.type);
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
    var proxy = kdb.ItemProxy.getProxyFor(request.id);
    sendResponse({
      kind: proxy.kind,
      item: proxy.item
    });
    console.log('::: Sent findById response for ' + request.id);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/getAll', function(request, sendResponse){
    var username = 'Unknown';
    if (socket.koheseUser){
      username = socket.koheseUser.username;
    }
    console.log('::: session %s: Received getAll for user %s at %s', socket.id, username, socket.handshake.address);
    
    var repoTreeHashes = kdb.ItemProxy.getAllTreeHashes();
    
    var response = {};
    if(!_.isEqual(request.repoTreeHashes, repoTreeHashes)){
      if (_.size(request.repoTreeHashes) === 0){
        console.log('--- KDB Does Not Match: Full response will be sent');
        
        response = {
            repoTreeHashes: repoTreeHashes,
            cache: {},
            sentAll: true
          };
        
        var rootProxy = kdb.ItemProxy.getRootProxy();
        rootProxy.visitChildren(null, (proxy) => {
          if (!response.cache[proxy.kind]){
            response.cache[proxy.kind] = {};
          }
          var kindCache = response.cache[proxy.kind];
          kindCache[proxy.item.id] = JSON.stringify(proxy.item);
        });
        
      } else {
        // Send deltas to client
        console.log('--- KDB Does Not Match: Delta response will be sent');

        var thmCompare = kdb.ItemProxy.compareTreeHashMap(request.repoTreeHashes, repoTreeHashes);
//        console.log(thmCompare);
        
        response = {
            repoTreeHashes: repoTreeHashes,
            addItems: [],
            changeItems: [],
            deleteItems: thmCompare.deletedItems
        };
        
        thmCompare.addedItems.forEach((itemId) => {
          var proxy = kdb.ItemProxy.getProxyFor(itemId);
          response.addItems.push({kind: proxy.kind, item: proxy.item});
//          console.log(proxy.item);
        });
        
        thmCompare.changedItems.forEach((itemId) => {
          var proxy = kdb.ItemProxy.getProxyFor(itemId);
          response.changeItems.push({kind: proxy.kind, item: proxy.item});
//          console.log(proxy.item);
        });
      }

    } else {
      console.log('--- KDB Matches: No changes will be sent');
      response.kdbMatches = true;
    }
    
    console.log('::: Sending getAll response');
    sendResponse(response);
    console.log('::: Sent getAll response');
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/getStatus', function(request, sendResponse){

    var repoProxy = global.koheseKDB.ItemProxy.getProxyFor(request.repoId);    
    console.log('::: Getting status for repo: ' + repoProxy.item.name);

    global.koheseKDB.kdbRepo.getStatus(request.repoId, function(status){    
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
    console.log("::: Getting history for " + request.onId);
    
    // TODO Need to pass path instead of itemId.  kdb-repo should not know about the internals of the content
    global.koheseKDB.kdbRepo.walkHistoryForFile(request.onId, function(history){
      
      if (history) {
        console.log('+++ History for ' + request.onId);
        console.log(history);
        sendResponse(history);
      } else {
        console.log('*** History error for ' + request.onId);
        sendResponse({error: 'history error'});
      }        
    });

  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/upsert', function(request, sendResponse){
    console.log('::: session %s: Received upsert for %s for user %s at %s',
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
      var isNewInstance = false;
      
      if (item.id){
        proxy = ItemProxy.getProxyFor(item.id);

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
        isNewInstance = true;
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
    
    var proxy = ItemProxy.getProxyFor(request.id);
    proxy.deleteItem(request.recursive);
    
    console.log('Deleted %s #%s#', request.kind, request.id);

    sendResponse({
      deleted: 'true',
      kind: request.kind,
      id: request.id
    });

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

    var proxy = global.koheseKDB.ItemProxy.getProxyFor(forItemId);
    var result = {};

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
  
  socket.on('VersionControl/stage', function (request, sendResponse) {
    console.log('::: session %s: Received VersionControl/stage for %s for user %s at %s',
        socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
    var idsArray = Array.from(request.proxyIds);
    var proxies = [];
    var promises = [];
    var addStatusMap = {};
    for (var i = 0; i < idsArray.length; i++) {
      console.log('--- Adding proxy for: ' + idsArray[i]);
      var proxy = kdb.ItemProxy.getProxyFor(idsArray[i]);
      proxies.push(proxy);
      var repositoryInformation = getRepositoryInformation(proxy);
      promises.push(kdb.kdbRepo.add(repositoryInformation.repositoryProxy.item.id,
          repositoryInformation.relativeFilePath).then(function (returnValue) {
        addStatusMap[proxy.item.id] = returnValue;
      }));
    }
      
    Promise.all(promises).then(function () {
      console.log('::: session %s: Sending response for VersionControl/stage for user %s at %s',
        socket.id, socket.koheseUser.username, socket.handshake.address);
      sendStatusUpdates(proxies);
      sendResponse(addStatusMap);
    }).catch(function (err) {
      console.log(err.stack);
      sendResponse({
        error: err
      });
    });
  });
  
  socket.on('VersionControl/commit', function (request, sendResponse) {
    var proxies = [];
    var idsArray = Array.from(request.proxyIds);
    
    kdb.kdbRepo.commit(idsArray, request.username, request.email, 
      request.message).then(function (commitIdMap) {
        var proxies = [];
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
                proxies.push(kdb.ItemProxy.getProxyFor(fileName));
              }
            }
          }
        }
        
        sendStatusUpdates(proxies);
        sendResponse(returnMap);
    }).catch(function (err) {
      console.log(err.stack);
      sendResponse({
        error: err
      });
    });
  });

  socket.on('VersionControl/push', function (request, sendResponse) {
    var proxies = [];
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
      var proxy = kdb.ItemProxy.getProxyFor(idsArray[i]);
      proxies.push(proxy);
      var repositoryInformation = getRepositoryInformation(proxy);
      var repositoryId = repositoryInformation.repositoryProxy.item.id;
      if (!repositoryPathMap[repositoryId]) {
        repositoryPathMap[repositoryId] = [];
      }
      repositoryPathMap[repositoryId].push(repositoryInformation.relativeFilePath);
    }
    
    for (var repositoryId in repositoryPathMap) {
      kdb.kdbRepo.reset(repositoryId, repositoryPathMap[repositoryId]).then(
        function () {
        sendStatusUpdates(proxies);
        sendResponse({});
      }).catch(function (err) {
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
      var proxy = kdb.ItemProxy.getProxyFor(idsArray[i]);
      var repositoryInformation = getRepositoryInformation(proxy);
      var repositoryId = repositoryInformation.repositoryProxy.item.id;
      
      var evaluationPromise = new Promise((resolve, reject) => {
        kdb.kdbRepo.getItemStatus(repositoryId, repositoryInformation.relativeFilePath).then((status) => {

          var isNewFile = false;
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
              kdb.kdbRepo.getItemStatus(repositoryId, repositoryInformation.relativeFilePath).then((statusAfterUnstage) => {
                resolve(statusAfterUnstage);                              
              });
            });
          } else {
            resolve(status);
          }
        });
      });
      pendingEvaluationPromises.push(evaluationPromise);
    }
    
    // Wait for any pending unstage requests to complete
    Promise.all(pendingEvaluationPromises).then(function(statusArray){
      // Determine if items need to be checked out or deleted
      for (var i = 0; i < idsArray.length; i++) {
        var proxy = kdb.ItemProxy.getProxyFor(idsArray[i]);
        var repositoryInformation = getRepositoryInformation(proxy);
        var repositoryId = repositoryInformation.repositoryProxy.item.id;
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
      for (var repositoryId in repositoryPathMap) {
        pendingCheckoutProxies.push(kdb.kdbRepo.checkout(repositoryId, repositoryPathMap[repositoryId], true));
      }
      
      // Send response
      Promise.all(pendingCheckoutProxies)
      .then(function () {
        // Update content based on reverted files
        for (var j = 0; j < proxies.length; j++) {
          var proxy = proxies[j];
          var item = kdbFs.loadJSONDoc(proxy.repoPath);
          if (proxy.kind === 'Repository') {
            item.parentId = proxy.item.parentId;
          }
          proxy.updateItem(proxy.kind, item);
        }
        
        sendStatusUpdates(proxies);
        sendResponse({});
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
      root = Path.join(root, 'data_import', socket.koheseUser.username);
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

function sendStatusUpdates(proxies) {
  var statusMap = {};
  var promises = [];
  for (var i = 0; i < proxies.length; i++) {
    var repositoryInformation = getRepositoryInformation(proxies[i]);
    let promise = kdb.kdbRepo.getItemStatus(repositoryInformation.repositoryProxy.item.id,
        repositoryInformation.relativeFilePath);
    promises.push(promise);
  }

  Promise.all(promises).then((statusArray) => {
    for (var i = 0; i < proxies.length; i++) {
      statusMap[proxies[i].item.id] = statusArray[i];
    }

    kio.server.emit('VersionControl/statusUpdated', statusMap);
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