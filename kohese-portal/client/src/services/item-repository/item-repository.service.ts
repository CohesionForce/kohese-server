import { Injectable } from '@angular/core';

import * as _ from 'underscore';

import { SocketService } from "../socket/socket.service";
import { ToastrService } from "ngx-toastr";

import * as ItemProxy from '../../../../common/models/item-proxy';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

/**
 *
 */

@Injectable()
export class ItemRepository {
  shortProxyList : Array<ItemProxy>;
  modelTypes : Object;
  VCStateLookup : Object;
  repoStagingStatus : {
    Unstaged,
    Staged,
    Conflicted
  }
  repositoryStatus : BehaviorSubject<any>;

  constructor (private socketService: SocketService,
               private toastrService : ToastrService) {
              this.initialize();
              }

  initialize () : void {
    console.log('Item Repo init');
    this.modelTypes = {
      Repository: 'Repository',
      Item: 'Item',
      Decision: 'Decision',
      Action: 'Action',
      Task: 'Task',
      Observation: 'Observation',
      Issue: 'Issue',
      Category: 'Category',
      KoheseUser: 'KoheseUser'
    };
    this.VCStateLookup = {
      CURRENT: {state: 'Current', substate: ''},
      INDEX_NEW: {state: 'Staged', substate: 'New'},
      INDEX_MODIFIED: {state: 'Staged', substate: 'Modified'},
      INDEX_DELETED: {state: 'Staged', substate: 'Deleted'},
      INDEX_RENAMED: {state: 'Staged', substate: 'Renamed'},
      INDEX_TYPECHANGE: {state: 'Staged', substate: 'TypeChange'}, // Shouldn't happen
      WT_NEW: {state: 'Unstaged', substate: 'New'},
      WT_MODIFIED: {state: 'Unstaged', substate: 'Modified'},
      WT_DELETED: {state: 'Unstaged', substate: 'Deleted'},
      WT_TYPECHANGE: {state: 'Unstaged', substate: 'TypeChange'}, // Shouldn't happen
      WT_RENAMED: {state: 'Unstaged', substate: 'Renamed'},
      WT_UNREADABLE: {state: 'Unstaged', substate: 'Unreadable'}, // Shouldn't happen
      IGNORED: {state: 'Ignored', substate: ''},
      CONFLICTED: {state: 'Conflict', substate: ''}
    }
    this.repoStagingStatus = {
      Unstaged: {},
      Staged: {},
      Conflicted: {}
    };

    this.repositoryStatus = new BehaviorSubject({
      connected : false,
      message : 'Initializing Item Repository'
    });

    ItemProxy.getChangeSubject().subscribe(change => {
      console.log('+++ Received notification of change: ' + change.type);
      if(change.proxy){
        console.log(change.kind);
        console.log(change.proxy.item);
      }

      switch (change.type){
        case 'loaded':
          console.log('::: ItemProxy is loaded');
          break;
        case 'loading':
          console.log('::: ItemProxy is loading');
          break;
      }
    });

    this.socketService.isAuthenticated()
      .subscribe(authenticationStatus => {
        console.log('Auth IR');
        if (authenticationStatus === true) {
          console.log('::: IR: this.socketService already connected');
          this.registerKoheseIOListeners();
          this.fetchItems();
        }
      })
  }

  // Item Proxy Wrapper Methods
  getRootProxy () : Function {
    return ItemProxy.getRootProxy;
  }

  getChangeSubject () : Function {
    return ItemProxy.getChangeSubject;
  }

  getProxyFor () : Function {
    return ItemProxy.getProxyFor;
  }

  getAllItemProxies () : Function {
    return ItemProxy.getAllItemProxies;
  }

  getRepositories () : Function {
    return ItemProxy.getRepositories
  }

  // End Item Proxy Wrapper

  getRepoStatusSubject () : BehaviorSubject<any> {
    return this.repositoryStatus;
  }

  registerKoheseIOListeners () : void {
      // Register the listeners for the Item kinds that are being tracked
      for (var modelName in this.modelTypes) {
        this.socketService.socket.on(modelName + '/create', function (notification) {
          console.log('::: Received notification of ' + notification.kind + ' Created:  ' + notification.item.id);
          var proxy = ItemProxy.getProxyFor(notification.item.id);
          if (proxy) {
            proxy.updateItem(notification.kind, notification.item);
          } else {
                    proxy = new ItemProxy(notification.kind, notification.item);
          }

          this.updateVCState(proxy, notification.status);
          proxy.dirty = false;
        }.bind(this));

        this.socketService.socket.on(modelName + '/update', function (notification) {
          console.log('::: Received notification of ' + notification.kind + ' Updated:  ' + notification.item.id);
          var proxy = ItemProxy.getProxyFor(notification.item.id);
          if (proxy) {
            proxy.updateItem(notification.kind, notification.item);
          } else {
                    proxy = new ItemProxy(notification.kind, notification.item);
          }

          this.updateVCState(proxy, notification.status);
          proxy.dirty = false;
        });

        this.socketService.socket.on(modelName + '/delete', function (notification) {
          console.log('::: Received notification of ' + notification.kind + ' Deleted:  ' + notification.id);
          var proxy = ItemProxy.getProxyFor(notification.id);
          proxy.deleteItem();
        });
      }

      this.socketService.socket.on('VersionControl/statusUpdated', function (gitStatusMap) {
        for (var id in gitStatusMap) {
          var proxy = ItemProxy.getProxyFor(id);
          this.updateVCState(proxy, gitStatusMap[id]);
        }
      });

      this.socketService.socket.on('connect_error', function () {
        console.log('::: IR: Socket IO Connection Error');
        this.repositoryStatus.next({
          connected : false,
          message : 'Error connecting to repository'
        })
      });

      this.socketService.socket.on('reconnect', function () {
        if (this.socketService.isAuthenticated) {
          console.log('::: IR: this.socketService already authenticated');
          this.fetchItems();
          this.toastrService.success('Reconnected!', 'Server Connection!');
        } else {
          console.log('::: IR: Listening for this.socketService authentication');
          var deregister = this.socketService.isAuthenticated()
            .subscribe(notification => {
              if(notification === true) {
                console.log('::: IR: Socket Authenticated');
                this.fetchItems();
                this.toastrService.success('Reconnected!', 'Server Connection!');
                deregister();
              }

          });
        }
      })
    }

  updateVCState (proxy, newStatus) : void {
    var oldVCState = proxy.vcState;
    var newVCState = {
      Unstaged : {},
      Staged : {}
    };
    var itemId = proxy.item.id;

    for (var idx in newStatus) {
      var s = newStatus[idx];
      var vc = this.VCStateLookup[newStatus[idx]];
      newVCState[vc.state] = vc.substate;
    }

    if(oldVCState && oldVCState.Unstaged && !(newVCState && newVCState.Unstaged)) {
      // Item removed from working tree
      delete this.repoStagingStatus.Unstaged[itemId];
    }
    if(oldVCState && oldVCState.Staged && !(newVCState && newVCState.Staged)) {
      // Item removed from index
      delete this.repoStagingStatus.Staged[itemId];
    }
    if(newVCState && newVCState.Unstaged && !(oldVCState && oldVCState.Unstaged)) {
      // Item added to working tree
      this.repoStagingStatus.Unstaged[itemId] = proxy;
    }
    if(newVCState && newVCState.Staged && !(oldVCState && oldVCState.Staged)) {
      // Item add to index
      this.repoStagingStatus.Staged[itemId] = proxy;
    }

    if (newStatus.length > 0) {
      proxy.status = newStatus;
      proxy.vcState = newVCState;
    } else {
      delete proxy.status;
      delete proxy.vcState;
    }
  }

  getRepoStagingStatus () {
    return this.repoStagingStatus;
  }

  fetchItems () {
    var origRepoTreeHashes = ItemProxy.getAllTreeHashes();
    this.repositoryStatus.next({
      connected : false,
      message: 'Starting Repository Sync'
    })
    this.socketService.socket.emit('Item/getAll', {repoTreeHashes: origRepoTreeHashes}, function (response) {
      console.log('::: Response for getAll');
      var syncSucceeded = false;
      if(response.kdbMatches) {
        console.log('::: KDB is already in sync');
        syncSucceeded = true;
      } else {
        for(var kind in response.cache) {
          console.log('--- Processing ' + kind);
          var kindList = response.cache[kind];
          for (var index in kindList) {
            var item = JSON.parse(kindList[index]);
            var iProxy = new ItemProxy(kind, item);
          }
        }

        if(response.addItems) {
          response.addItems.forEach((addedItem) => {
            var iProxy = new ItemProxy(addedItem.kind, addedItem.item);
          });
        }

        if(response.changeItems) {
          response.changeItems.forEach((changededItem) => {
            var iProxy = new ItemProxy(changededItem.kind, changededItem.item);
          });
        }

        if(response.deleteItems) {
          response.deleteItems.forEach((deletedItemId) => {
            var proxy = ItemProxy.getProxyFor(deletedItemId);
            proxy.deleteItem();
          });
        }

        if(response.sentAll) {
          ItemProxy.loadingComplete();
        }

        console.log('::: Compare Repo Tree Hashes After Update');
        var updatedTreeHashes = ItemProxy.getAllTreeHashes();
        var compareAfterRTH = ItemProxy.compareTreeHashMap(updatedTreeHashes, response.repoTreeHashes);

        syncSucceeded = compareAfterRTH.match;

        if(!compareAfterRTH.match) {
          console.log('*** Repository sync failed');
          console.log(compareAfterRTH);
          this.repositoryStatus.next({
            connected : false,
            message : 'Repository sync failed'
          })
        }
      }

      if(syncSucceeded){
        this.repositoryStatus.next({
          connected : true,
          message : 'Item Repository Ready'
        })
      }
      var rootProxy = ItemProxy.getRootProxy();
      this.getStatusFor(rootProxy);
    }.bind(this));
  }

  getModelTypes () {
    return this.modelTypes;
  }

  createShortFormItemList () {
    var proxies = ItemProxy.getAllItemProxies();
    this.shortProxyList=[];
    for (var i = 0; i < proxies.length; i++ ) {
      this.shortProxyList.push({
        name: proxies[i].item.name,
        id: proxies[i].item.id
      })
    }
  }

  getShortFormItemList () {
    this.createShortFormItemList();
    return this.shortProxyList;
  }

  copyAttributes (fromItem, toItem) {
    // TBD: Need to remove
    console.log('### Deprecated call to copyAttributes');

    // Copy attributes proxy
    for (var key in fromItem) {
      if (key.charAt(0) !== '$' && !_.isEqual(fromItem[key], toItem[key])) {
        toItem[key] = fromItem[key];
      }
    }
  }

  updateItemProxy (withResults) {
    var proxy = ItemProxy.getProxyFor(withResults.id);

    if (proxy) {
      proxy.updateItem(withResults.constructor.modelName, withResults);
    } else {
      proxy = new ItemProxy(withResults.constructor.modelName, withResults);
    }
    proxy.dirty = false;
  }

  fetchItem (proxy) {
    var promise = new Promise((resolve, reject) => {
      this.socketService.socket.emit('Item/findById', {id: proxy.item.id}, function (response) {
        proxy.updateItem(response.kind, response.item);
        proxy.dirty = false;
        resolve(response);
      });
    });

    return promise;
  }

  upsertItem (proxy) {
    console.log('::: Preparing to upsert ' + proxy.kind);
    var promise;
    var requiredProperties = true;

    for (var i = 0; i < proxy.model.item.requiredProperties.length; i++) {
      var fieldName = proxy.model.item.requiredProperties[i];
      if (!proxy.item[fieldName]) {
        requiredProperties = false;
        break;
      }
    }

    if(requiredProperties) {
      promise = new Promise((resolve, reject) => {
        this.socketService.socket.emit('Item/upsert', {kind: proxy.kind, item:proxy.item}, function (response) {
          if (response.error) {
            reject(response.error);
          } else {
            console.log(response);
            if(!proxy.updateItem) {
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
    } else {
      promise = new Promise((resolve, reject) => {
        resolve();
      })
      // TO-DO : Implement Modal Service and integrate
      // promise = new Promise((resolve, reject) => {
      //   var modalOptions = {
      //     actionButtonText : 'Ok',
      //     closeButtonText : null,
      //     headerText: 'Invalid field',
      //     bodyText: 'Please fill out all required fields : ',
      //     list: proxy.model.item.requiredProperties
      //   }

      //   var modalDefaults = {
      //     templateUrl : ModalService.ONE_LIST_TEMPLATE
      //   }

      //   ModalService.showModal(modalDefaults, modalOptions);
      //   reject({error: 'User must fill out required fields'})
      }
      return promise;
    }

  deleteItem (proxy, recursive) {
    console.log('::: Preparing to deleteById ' + proxy.kind);

    var promise = new Promise((resolve, reject) => {
      this.socketService.socket.emit('Item/deleteById', {kind: proxy.kind, id: proxy.item.id, recursive: recursive}, function (response) {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });

    return promise;
  }

  generateHTMLReportFor (proxy) {
    this.socketService.socket.emit('Item/generateReport', {onId: proxy.item.id, format: 'html'}, function (results) {
      console.log('::: Report results: ' + results.html);
    });
  }

  generateDOCXReportFor (proxy) {
    this.socketService.socket.emit('Item/generateReport', {onId: proxy.item.id, format: 'docx'}, function (results) {
      console.log('::: Report results: ' + results.docx);
    });
  }

  getHistoryFor (proxy) {
    this.socketService.socket.emit('Item/getHistory', {onId: proxy.item.id}, function (results) {
      if (!proxy.history) {
        proxy.history = {};
      }
      proxy.history = results.history;
      console.log('::: History retrieved for: ' + proxy.item.id + ' - ' + proxy.item.name);
      console.log(results);
    });
  }

  getStatusFor (repo) {
    this.socketService.socket.emit('Item/getStatus', {repoId: repo.item.id}, function (results) {
      if (!repo.repoStatus) {
        repo.repoStatus = {};
      }
      repo.repoStatus = results;
      console.log('::: Status retrieved for: ' + repo.item.id + ' - ' + repo.item.name);
      for(var rIdx in repo.repoStatus) {
        var entry = repo.repoStatus[rIdx];
        console.log('+++ ' + rIdx + ' - ' + entry.id + ' - ' + entry.status );

        var proxy = ItemProxy.getProxyFor(entry.id);
        if (proxy) {
          this.updateVCState(proxy, entry.status);
        } else {
          console.log('!!! Item not found for entry: ' + rIdx + ' - ' + entry.id + ' - ' + entry.status );
        }
      }
    });
  }

  performAnalysis (forProxy) {
    console.log('::: Performing analysis for ' + forProxy.id);

    var promise = new Promise((resolve, reject) => {
      this.socketService.socket.emit('Item/performAnalysis', {kind: forProxy.kind, id:forProxy.item.id}, function (response) {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });

    return promise;
  }
}
