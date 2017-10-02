var kio = require("./koheseIO.js");
var kdb = require("./kdb.js");
var fs = require('fs');
var child = require('child_process');
var itemAnalysis = require('../common/models/analysis.js');


console.log("::: Initializing KIO Item Server");

kio.server.on('connection', function (socket) {

  console.log('>>> KIO Item Server: session %s connected from %s', socket.id, socket.handshake.address);
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/findById', function(request, sendResponse){
    console.log('::: session %s: Received findById for %s for user %s at %s', socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
    console.log(request);
    var proxy = kdb.ItemProxy.getProxyFor(request.id);
    sendResponse({
      kind: proxy.kind,
      item: proxy.item
    });
    console.log("::: Sent findById response for " + request.id);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/getAll', function(request, sendResponse){
    var username = "Unknown";
    if (socket.koheseUser){
      username = socket.koheseUser.username;
    }
    console.log('::: session %s: Received getAll for user %s at %s', socket.id, username, socket.handshake.address);
    console.log(request);
    var kdbStore = kdb.retrieveDataForMemoryConnector();
    console.log("::: Sending getAll response");
    sendResponse({
      cache: kdbStore.cache
    });
    console.log("::: Sent getAll response");
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/getStatus', function(request, sendResponse){
    var repoProxy = global.koheseKDB.ItemProxy.getProxyFor(request.repoId);
    
    console.log("::: Getting status for repo: " + repoProxy.item.name);
      
    global.koheseKDB.kdbRepo.getStatus(repoProxy, function(status){    
      if (status) {
        sendResponse(status);
      } else {
        console.log("*** Error (Returned from getStatus)");
        console.log(status);
        sendResponse({error: "status error"});
      }        
    });
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/getHistory', function(request, sendResponse){
  
    console.log("::: Getting history for " + request.onId);
    var proxy = global.koheseKDB.ItemProxy.getProxyFor(request.onId);
      
    global.koheseKDB.kdbRepo.walkHistoryForFile(proxy, function(history){
      
      if (history) {
        sendResponse(history);
      } else {
        sendResponse({error: "history error"});
      }        
    });

  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/upsert', function(request, sendResponse){
    console.log('::: session %s: Received upsert for %s for user %s at %s', socket.id, request.item.id, socket.koheseUser.username, socket.handshake.address);
    console.log(request);
    
    request.item.modifiedBy = socket.koheseUser.username;
    request.item.modifiedOn = Date.now();
    
    if(!request.item.createdBy){
      console.log('::: Updating created fields (instance) - ' + request.kind);
      request.item.createdBy = request.item.modifiedBy;
      request.item.createdOn = request.item.modifiedOn;
    }


    global.app.models[request.kind].upsert(request.item, {}, function (value, responseHeaders){
      console.log("::: Upsert " + request.id);
      console.log(value);
      console.log(responseHeaders);
      sendResponse({
        kind: request.kind,
        item: responseHeaders
      });
      console.log("::: Sent Item/upsert response");      
    }, function (httpResponse){
      sendResponse({error: httpResponse});
      console.log("::: Sent Item/upsert error");      
    });

  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/deleteById', function(request, sendResponse){
    console.log('::: session %s: Received deleteById for %s for user %s at %s', socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
    console.log(request);

    global.app.models[request.kind].deleteById(request.id, {}, function (value, responseHeaders){
      console.log("::: Deleted " + request.id);
      sendResponse({
        success: value,
        headers: responseHeaders
      });
      console.log("::: Sent Item/deleteById response");      
    }, function (httpResponse){
      sendResponse({error: httpResponse});
      console.log("::: Sent Item/deleteById error");      
    });

  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  socket.on('Item/performAnalysis', function(request, sendResponse) {

    console.log('::: session %s: Received performAnalysis for %s for user %s at %s', socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
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
      
    console.log("::: Generating " + outFormat + " Report for " + forItemId);

    var proxy = global.koheseKDB.ItemProxy.getProxyFor(forItemId);
    var result = {};

    if (!proxy){
      console.log("*** Could not find proxy for: " + forItemId);        
      sendResponse({error: "Item not found: " + forItemId});
      return;
    }

    console.log("::: Found proxy for: " + forItemId + " - " + proxy.item.name);        

    var reportTime = new Date();

    var outputBuffer = "::: Dump of " + forItemId + ": " + proxy.item.name + " at " + reportTime.toDateString() + " " + reportTime.toTimeString() + "\n\n";

    outputBuffer += proxy.getDocument(showUndefined);

    var itemName = proxy.item.name.replace(/[:\/]/g, " ");
    var fileBasename ="dump." + forItemId + "." + itemName;
    var dumpFile= "tmp_reports/" + fileBasename + ".md";
    console.log("::: Creating: " + dumpFile);
     
    fs.writeFileSync(dumpFile, outputBuffer, {encoding: 'utf8', flag: 'w'});
    result.markdown = "reports/" + fileBasename + ".md";
     
    if (outFormat) {
      console.log('::: Now spawning pandoc...');
      var outFile = 'tmp_reports/' + fileBasename + '.' + outFormat;
      console.log('::: Creating ' + outFile);
      var pandoc = child.spawnSync('pandoc', ['-f', 'markdown', '-t', outFormat, dumpFile, '-o', outFile]);
      if(pandoc.stdout) {
        console.log(pandoc.stdout);
      }
      result[outFormat] = "reports/" + fileBasename + '.' + outFormat;
      console.log('::: Pandoc done!');
    }
      
    sendResponse(result);

  });
  
  socket.on("VersionControl/add", function (request, sendResponse) {
    var proxies = [];
    var idsArray = Array.from(request.proxyIds);
    for (var i = 0; i < idsArray.length; i++) {
      proxies.push(kdb.ItemProxy.getProxyFor(idsArray[i]));
    }
    
    kdb.kdbRepo.add(proxies).then(function (addStatusMap) {
      sendResponse(addStatusMap);
      sendStatusUpdates(proxies);
    }).catch(function (err) {
      sendResponse({
        error: err
      });
    });
  });
  
  socket.on("VersionControl/commit", function (request, sendResponse) {
    var proxies = [];
    var idsArray = Array.from(request.proxyIds);
    for (var i = 0; i < idsArray.length; i++) {
      proxies.push(kdb.ItemProxy.getProxyFor(idsArray[i]));
    }
    
    kdb.kdbRepo.commit(proxies, request.username, request.email, 
      request.message).then(function (commitIdMap) {
        sendResponse(commitIdMap);
        sendStatusUpdates(proxies);
    }).catch(function (err) {
      sendResponse({
        error: err
      });
    });
  });

  socket.on("VersionControl/push", function (request, sendResponse) {
    var proxies = [];
    var idsArray = Array.from(request.proxyIds);
    for (var i = 0; i < idsArray.length; i++) {
      proxies.push(kdb.ItemProxy.getProxyFor(idsArray[i]));
    }
    
    kdb.kdbRepo.push(proxies, request.remoteName, request.username).then(function (pushStatusMap) {
      sendResponse(pushStatusMap);
    }).catch(function (err) {
      sendResponse({
        error: err
      });
    });
  });
  
  socket.on("VersionControl/addRemote", function (request, sendResponse) {
    kdb.kdbRepo.addRemote(kdb.ItemProxy.getProxyFor(request.proxyId),
        request.remoteName, request.url).then(function (remoteName) {
      sendResponse(remoteName);
    }).catch(function (err) {
      sendResponse({
        error: err
      });
    });
  });
  
  socket.on("VersionControl/getRemotes", function (request, sendResponse) {
    kdb.kdbRepo.getRemotes(kdb.ItemProxy.getProxyFor(request.proxyId))
        .then(function (remoteNames) {
      sendResponse(remoteNames);
    }).catch(function (err) {
      sendResponse({
        error: err
      });
    });
  });
});

function sendStatusUpdates(proxies) {
  var promises = [];
  for (var i = 0; i < proxies.length; i++) {
    promises.push(kdb.kdbRepo.getItemStatus(proxies[i]));
  }
  
  Promise.all(promises).then(function (statuses) {
    var statusMap = {};
    for (var i = 0; i < statuses.length; i++) {
      statusMap[proxies[i].item.id] = statuses[i];
    }
    
    kio.server.emit("VersionControl/statusUpdated", statusMap);
  });
}