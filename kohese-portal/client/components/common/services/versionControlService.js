/* Created by Josh 
    This service manages version control messaging between the client and server

*/

function VersionControlService(KoheseIO, UserService , $rootScope, ItemRepository, toastr) {
  const service = this;

  service.stageItems = function(proxyList) {
    var proxyList = Array.from(proxyList)
    var data = { proxyIds : []}
    for (var i= 0; i < proxyList.length; i++) {
      data.proxyIds.push(proxyList[i].item.id);
    }
    KoheseIO.socket.emit('VersionControl/add', data, function (results) {
      if (results.error) {    
        toastr.error('Stage Failed', 'Version Control');
      } else {
        toastr.success('Stage Succeeded!', 'Version Control');
      }
    });
  };

  service.unstageItems = function(proxyList, callback) {
    var data = {
      proxyIds : []
    }
    for (var i = 0; i < proxyList.length; i++) {
      data.proxyIds.push(proxyList[i].item.id);
    }
    KoheseIO.socket.emit('VersionControl/reset', data, function (results) {
      if (results.error) {
        toastr.error('Unstage failed', results.error);
      } else {
        toastr.success('Unstage Succeeded!', 'Version Control');
      }
      
      if (callback) {
        callback(!results.error);
      }
    });
  };

  service.revertItems = function(proxyList) {
    var data = {
      proxyIds: []
    }
    for (var i= 0; i< proxyList.length; i++) {
      data.proxyIds.push(proxyList[i].item.id);
    }
    KoheseIO.socket.emit('VersionControl/checkout', data, function (results) {
      if (results.error) {
        toastr.error('Revert failed', results.error);
      } else {
        toastr.success('Revert Succeeded!', 'Version Control');
      } 
    }) 
  };
    

  service.commitItems = function (proxyList, commitMessage) {
    var data = { proxyIds : []}
    var proxyList = Array.from(proxyList);
    for (var i= 0; i < proxyList.length; i++) {
      data.proxyIds.push(proxyList[i].item.id);
    }
    data.username = UserService.getCurrentUsername();
    data.email = UserService.getCurrentUserEmail();
    data.message = commitMessage;
    KoheseIO.socket.emit('VersionControl/commit', data, function (results) {
      if (results.error) {
        toastr.error('Commit Failed', 'Version Control');
      } else {
        toastr.success('Commit Succeeded!', 'Version Control');
      }
    });
  };

  service.push = function(proxyIds, remoteName) {
    var data = {};
    data.proxyIds = proxyIds,
    data.remoteName = remoteName;

    KoheseIO.socket.emit('VersionControl/push', data, function(results) {
      if (results.error) {
        toastr.error('Push Failed', 'Version Control');
      } else {
        toastr.success('Push Succeeded!', 'Version Control');
      }
    } )
  };

  service.addRemote = function(proxyId, remoteName, url) {
    var data = {};
    data.proxyId = proxyId;
    data.remoteName = remoteName;
    data.url = url;
    KoheseIO.socket.emit('VersionControl/addRemote', data, function(results) {
      if (results.error) {
        toastr.error('Add Remote Failed', 'Version Control');
      } else {
        toastr.success('Add Remote Succeeded!', 'Version Control');
      }
    });
  };

  service.getRemotes = function(proxyId, callback) {
    var data = {};
    data.proxyId = proxyId;
    KoheseIO.socket.emit('VersionControl/getRemotes', data, function(results) {
      if (results.error) {
        toastr.error('Get Remotes Failed', 'Version Control');
      } else {
        toastr.success('Get Remotes Succeeded!', 'Version Control');
        callback(results);
      }
    })
  };
}

export default () => {
  angular.module('app.services.versioncontrolservice',
    [  'app.factories.koheseio', 
      'toastr',
      'app.services.userservice',
      'app.services.itemservice'])
    .service('VersionControlService', VersionControlService);
}