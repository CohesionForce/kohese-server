/**
 *
 */

function ItemRepository(KoheseIO, $rootScope, toastr) {
    var _ = require('underscore');
    var ItemProxy = require('../../../../common/models/item-proxy');
    var createStates = require('../../../../common/models/createStates');
    var shortProxyList = [];
    var modelTypes = {
        Repository: "Repository",
        Item: "Item",
        Decision: "Decision",
        Action: "Action",
        Task: "Task",
        Observation: "Observation",
        Issue: "Issue",
        Category: "Category",
        KoheseUser: "KoheseUser"
    };
    
    var VCStateLookup = {
        CURRENT: {state: "Current", substate: ""},
        INDEX_NEW: {state: "Staged", substate: "New"},
        INDEX_MODIFIED: {state: "Staged", substate: "Modified"},
        INDEX_DELETED: {state: "Staged", substate: "Deleted"},
        INDEX_RENAMED: {state: "Staged", substate: "Renamed"},
        INDEX_TYPECHANGE: {state: "Staged", substate: "TypeChange"}, // Shouldn't happen
        WT_NEW: {state: "Unstaged", substate: "New"},
        WT_MODIFIED: {state: "Unstaged", substate: "Modified"},
        WT_DELETED: {state: "Unstaged", substate: "Deleted"},
        WT_TYPECHANGE: {state: "Unstaged", substate: "TypeChange"}, // Shouldn't happen
        WT_RENAMED: {state: "Unstaged", substate: "Renamed"},
        WT_UNREADABLE: {state: "Unstaged", substate: "Unreadable"}, // Shouldn't happen
        IGNORED: {state: "Ignored", substate: ""},
        CONFLICTED: {state: "Conflict", substate: ""}
    };

    var repoStagingStatus = {
        Unstaged: {},
        Staged: {},
        Conflicted: {}
    };

    function registerKoheseIOListeners() {
        // Register the listeners for the Item kinds that are being tracked
        for (var modelName in modelTypes) {
            KoheseIO.socket.on(modelName + '/create', function (notification) {
                console.log("::: Received notification of " + notification.kind + " Created:  " + notification.item.id);
                var proxy = ItemProxy.getProxyFor(notification.item.id);
                if (proxy) {
                   proxy.updateItem(notification.kind, notification.item);
                } else {
                	proxy = new ItemProxy(notification.kind, notification.item);
                }

                updateVCState(proxy, notification.status);
                proxy.dirty = false;
            });

            KoheseIO.socket.on(modelName + '/update', function (notification) {
                console.log("::: Received notification of " + notification.kind + " Updated:  " + notification.item.id);
                var proxy = ItemProxy.getProxyFor(notification.item.id);
                if (proxy) {
                   proxy.updateItem(notification.kind, notification.item);
                } else {
                	proxy = new ItemProxy(notification.kind, notification.item);
                }

                updateVCState(proxy, notification.status);
                proxy.dirty = false;
            });
            
            KoheseIO.socket.on(modelName + '/delete', function (notification) {
                console.log("::: Received notification of " + notification.kind + " Deleted:  " + notification.id);
                var proxy = ItemProxy.getProxyFor(notification.id);
                proxy.deleteItem();
            });
        }
        
        KoheseIO.socket.on("VersionControl/statusUpdated", function (gitStatusMap) {
          for (var id in gitStatusMap) {
            var proxy = ItemProxy.getProxyFor(id);
            updateVCState(proxy, gitStatusMap[id]);
          }
        });

        KoheseIO.socket.on('connect_error', function () {
            console.log("::: IR: Socket IO Connection Error");
            toastr.error('Disconnected from server', 'Connection Error');
        });

        KoheseIO.socket.on('reconnect', function () {
            if (KoheseIO.isAuthenticated) {
              console.log("::: IR: KoheseIO already authenticated");
              fetchItems();
              toastr.success('Reconnected!', 'Server Connection!');
            } else {
              console.log("::: IR: Listening for KoheseIO authentication");
              var deregister = $rootScope.$on('KoheseIOAuthenticated', function () {
                  console.log("::: IR: KoheseIO Authenticated");
                  fetchItems();
                  toastr.success('Reconnected!', 'Server Connection!');
                  deregister();
              });
            }
        });

    };

    if (KoheseIO.isAuthenticated) {
        console.log("::: IR: KoheseIO already connected");
        registerKoheseIOListeners();
        fetchItems();
    } else {
        console.log("::: IR: Listening for KoheseIO connection");
        var deregister = $rootScope.$on('KoheseIOAuthenticated', function () {
            console.log("::: IR: KoheseIO Connected");
            registerKoheseIOListeners();
            fetchItems();
            deregister();
        });
    }

    return {
        getModelTypes: getModelTypes,
        modelTypes: modelTypes,
        getRootProxy: ItemProxy.getRootProxy,
        getProxyFor: ItemProxy.getProxyFor,
        getAllItemProxies: ItemProxy.getAllItemProxies,
        getRepositories: ItemProxy.getRepositories,
        getShortFormItemList : getShortFormItemList,
        fetchItem: fetchItem,
        upsertItem: upsertItem,
        deleteItem: deleteItem,
        copyAttributes: copyAttributes,
        generateHTMLReportFor: generateHTMLReportFor,
        generateDOCXReportFor: generateDOCXReportFor,
        getHistoryFor: getHistoryFor,
        getStatusFor: getStatusFor,
        performAnalysis: performAnalysis,
        getRepoStagingStatus: getRepoStagingStatus
    };
    
    function updateVCState(proxy, newStatus) {
      var oldStatus = proxy.status;
      var oldVCState = proxy.vcState;
      var newVCState = {};
      var itemId = proxy.item.id;
      
      for (var idx in newStatus){
        var s = newStatus[idx];
        var vc = VCStateLookup[newStatus[idx]];
        newVCState[vc.state] = vc.substate;
      }
      
      if(oldVCState && oldVCState.Unstaged && !(newVCState && newVCState.Unstaged)){
        // Item removed from working tree
        delete repoStagingStatus.Unstaged[itemId];
      }
      if(oldVCState && oldVCState.Staged && !(newVCState && newVCState.Staged)){
        // Item removed from index
        delete repoStagingStatus.Staged[itemId];
      }
      if(newVCState && newVCState.Unstaged && !(oldVCState && oldVCState.Unstaged)){
        // Item added to working tree
        repoStagingStatus.Unstaged[itemId] = proxy;
      }
      if(newVCState && newVCState.Staged && !(oldVCState && oldVCState.Staged)){
        // Item add to index
        repoStagingStatus.Staged[itemId] = proxy;
      }
      
      
      proxy.status = newStatus;
      proxy.vcState = newVCState;
    };
    
    function getRepoStagingStatus() {
        return repoStagingStatus;
    };
    
    function compareRepoTreeHashes(fromTree, toTree){
      console.log("::: Compare Tree Hashes");
      if(!fromTree){
        console.log("--- From Tree is undefined");
        return;
      }
      for (var key in fromTree){
        console.log("--- Comparing " + key);
        if (!_.isEqual(fromTree[key], toTree[key])){
          console.log("*** Found unmatched tree: " + key);
          console.log(fromTree[key]);
          console.log(toTree[key]);
          compareTreeEntries(fromTree[key], toTree[key]);
        }
      }          
    }
    
    function compareTreeEntries(fromEntry, toEntry){
      
      if (!fromEntry){
        console.log("--- From Entry is undefined");
        return;
      }
      for (var childId in fromEntry.childTreeHashes){
        if (!_.isEqual(fromEntry.childTreeHashes[childId], toEntry.childTreeHashes[childId])){
          console.log("*** Found unmatched child: " + childId);
          console.log(fromEntry.childTreeHashes[childId]);
          console.log(toEntry.childTreeHashes[childId]);
        }
      }
    }
    
    function fetchItems() {
      var origRepoTreeHashes = ItemProxy.getAllTreeHashes();
      KoheseIO.socket.emit('Item/getAll', {repoTreeHashes: origRepoTreeHashes}, function (response) {
        console.log("::: Response for getAll");
        if(response.kdbMatches){
          console.log("::: KDB is already in sync")
        } else {
        
          for(var kind in response.cache){
            console.log("--- Processing " + kind);
            var kindList = response.cache[kind];
            for (var index in kindList){
              var item = JSON.parse(kindList[index]);
              var iProxy = new ItemProxy(kind, item);
            }
          }
          
          if(response.addItems){
            response.addItems.forEach((addedItem) => {
              var iProxy = new ItemProxy(addedItem.kind, addedItem.item);
            });
          }
          
          if(response.changeItems){
            response.changeItems.forEach((changededItem) => {
              var iProxy = new ItemProxy(changededItem.kind, changededItem.item);
            });
          }
          
          if(response.deleteItems){
            response.deleteItems.forEach((deletedItemId) => {
              var proxy = ItemProxy.getProxyFor(deletedItemId);
              proxy.deleteItem();
            });
          }

          if(response.sentAll){
            ItemProxy.loadingComplete();            
          }

          console.log("::: Compare Repo Tree Hashes After Update");
          var updatedTreeHashes = ItemProxy.getAllTreeHashes();
          var compareAfterRTH = ItemProxy.compareTreeHashMap(updatedTreeHashes, response.repoTreeHashes);
          console.log(compareAfterRTH);
          
          if(!compareAfterRTH.match){
            console.log("*** Checking hashes again");
            var recheckTreeHashes = ItemProxy.getAllTreeHashes();
            var compareAgain = ItemProxy.compareTreeHashMap(recheckTreeHashes, response.repoTreeHashes);
            console.log(compareAgain);
          }
          
        }

        $rootScope.$broadcast('itemRepositoryReady');
        var rootProxy = ItemProxy.getRootProxy();
        getStatusFor(rootProxy);

      });         
    }

    function getModelTypes(){
        return modelTypes;
    }

    function createShortFormItemList(){
        var proxies = ItemProxy.getAllItemProxies();
        shortProxyList=[];
        for (var i = 0; i < proxies.length; i++ ){
            shortProxyList.push({
                name: proxies[i].item.name,
                id: proxies[i].item.id
            })
        }
    }

    function getShortFormItemList(){
        createShortFormItemList();
        return shortProxyList;
    }

    function copyAttributes(fromItem, toItem) {
        // TBD: Need to remove
        console.log("### Deprecated call to copyAttributes");

        // Copy attributes proxy
        for (var key in fromItem) {
            if ((key.charAt(0) !== '$') && !_.isEqual(fromItem[key], toItem[key])) {
                toItem[key] = fromItem[key];
            }
        }
    }

    function updateItemProxy(withResults) {
        var proxy = ItemProxy.getProxyFor(withResults.id);

        if (proxy) {
            proxy.updateItem(withResults.constructor.modelName, withResults);
        } else {
            proxy = new ItemProxy(withResults.constructor.modelName, withResults);
        }
        proxy.dirty = false;
    }

    function fetchItem(proxy) {

      var promise = new Promise((resolve, reject) => {
        KoheseIO.socket.emit('Item/findById', {id: proxy.item.id}, function (response) {
          proxy.updateItem(response.kind, response.item);
          proxy.dirty = false;
          resolve(response);
        });         
      });

      return promise;
    }

    function upsertItem(proxy) {
        console.log("::: Preparing to upsert " + proxy.kind);
        
        var promise = new Promise((resolve, reject) => {
          KoheseIO.socket.emit('Item/upsert', {kind: proxy.kind, item:proxy.item}, function (response) {
            if (response.error){
              reject(response.error);
            } else {
              console.log(response);
              if(!proxy.updateItem){
                proxy.item = response.item;
                proxy = new ItemProxy(response.kind, response.item);
              } else {
                proxy.updateItem(response.kind, response.item);
              }
              proxy.dirty = false;
              resolve(proxy);              
            }
          });         
        });
        
        return promise;
    }

    function deleteItem(proxy) {
        console.log("::: Preparing to deleteById " + proxy.kind);
        
        var promise = new Promise((resolve, reject) => {
          KoheseIO.socket.emit('Item/deleteById', {kind: proxy.kind, id: proxy.item.id}, function (response) {
            if (response.error){
              reject(response.error);
            } else {
              resolve(response);              
            }
           });
        });
        
        return promise;

    }

    function generateHTMLReportFor(proxy) {

      KoheseIO.socket.emit('Item/generateReport', {onId: proxy.item.id, format: "html"}, function (results) {
        console.log("::: Report results: " + results.html);
      });

    }

    function generateDOCXReportFor(proxy) {

      KoheseIO.socket.emit('Item/generateReport', {onId: proxy.item.id, format: "docx"}, function (results) {
        console.log("::: Report results: " + results.docx);
      });

    }

    function getHistoryFor(proxy) {

      KoheseIO.socket.emit('Item/getHistory', {onId: proxy.item.id}, function (results) {
        if (!proxy.history) {
          proxy.history = {};
        }
        proxy.history = results.history;
        console.log("::: History retrieved for: " + proxy.item.id + " - " + proxy.item.name);
        console.log(results);
      });
    }

    function getStatusFor(repo) {

      KoheseIO.socket.emit('Item/getStatus', {repoId: repo.item.id}, function (results) {

          if (!repo.repoStatus) {
              repo.repoStatus = {};
          }
          repo.repoStatus = results;
          console.log("::: Status retrieved for: " + repo.item.id + " - " + repo.item.name);
          console.log(repo.repoStatus);
          for(var rIdx in repo.repoStatus) {
            var entry = repo.repoStatus[rIdx];
            console.log("+++ " + rIdx + " - " + entry.id + " - " + entry.status );

            var proxy = ItemProxy.getProxyFor(entry.id);
            if (proxy) {
              updateVCState(proxy, entry.status);              
            } else {
              console.log("!!! Item not found for entry: " + rIdx + " - " + entry.id + " - " + entry.status );              
            }
            
          }
      });
    }

    function performAnalysis (forProxy){
      console.log("::: Performing analysis for " + forProxy.id);
      
      var promise = new Promise((resolve, reject) => {
        KoheseIO.socket.emit('Item/performAnalysis', {kind: forProxy.kind, id:forProxy.item.id}, function (response) {
          if (response.error){
            reject(response.error);
          } else {
            resolve(response);              
          }
        });         
      });
      
      return promise;
      
    }
}

export default () => {

    angular.module("app.services.itemservice", ['app.factories.koheseio', 'toastr'])
        .service("ItemRepository", ItemRepository);

}