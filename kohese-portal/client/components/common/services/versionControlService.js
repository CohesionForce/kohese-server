/* Created by Josh 
    This service manages version control messaging between the client and server

*/

function VersionControlService(KoheseIO, UserService , $rootScope, ItemRepository, toastr)
{
    const service = this;
    service.indexedProxies = {};

    
    service.setIndexedProxy = function(proxy) {
        service.indexedProxies[proxy.item.id] = proxy;
        console.log(service.indexedProxies);
    }

    service.getIndexedProxies = function() {
        return service.indexedProxies;
    }
    
    service.stageItems = function(proxyList) {
        console.log (proxyList);
        var proxyList = Array.from(proxyList)
        var data = { proxyIds : []}
        for (var i= 0; i < proxyList.length; i++)
        {
            data.proxyIds.push(proxyList[i].item.id);
        }
        console.log("StageItems");
        console.log(data);
        KoheseIO.socket.emit('VersionControl/add', data, function (results) {
            console.log("::: Stage results:");
            console.log(results);
            if (results.error)
                toastr.error('Stage Failed', 'Version Control');
            else {
                toastr.success('Stage Succeeded!', 'Version Control');

            }

          });
    }

    service.commitItems = function (proxyList, commitMessage) {
        var data = { proxyIds : []}
        var proxyList = Array.from(proxyList);
        for (var i= 0; i < proxyList.length; i++)
        {
            data.proxyIds.push(proxyList[i].item.id);
        }
        data.username = UserService.getCurrentUsername();
        data.email = UserService.getCurrentUserEmail();
        data.message = commitMessage;
        console.log("Commit Data");
        console.log(data);
        KoheseIO.socket.emit('VersionControl/commit', data, function (results) {
            console.log("Commit Results");
            console.log(results);
            if (results.error)
                toastr.error('Commit Failed', 'Version Control');
            else {
                toastr.success('Commit Succeeded!', 'Version Control');
                }
            console.log("::: Commit results:");
            console.log (results);
            
        });
    }

    service.push = function(proxyIds, remoteName) {
        var data = {};
        data.proxyIds = proxyIds,
        data.remoteName = remoteName;
        data.userName = UserService.getCurrentUsername();
        console.log("Push send data");
        console.log(data)

        KoheseIO.socket.emit('VersionControl/push', data, function(results){
        if (results.error)
            toastr.error('Push Failed', 'Version Control');
        else {
            toastr.success('Push Succeeded!', 'Version Control');
            }
            console.log("::: Push results:");
            console.log (results);
        } )
    }

    service.addRemote = function(proxyId, remoteName, url) {
        var data = {};
        data.proxyId = proxyId;
        data.remoteName = remoteName;
        data.url = url;
        console.log("Add Remote Send");
        console.log(data);
        KoheseIO.socket.emit('VersionControl/addRemote', data, function(results) {
            if (results.error)
            toastr.error('Add Remote Failed', 'Version Control');
        else {
            toastr.success('Add Remote Succeeded!', 'Version Control');
            }
        console.log(results);
        });
    }

    service.getRemotes = function(proxyId, callback) {
        var data = {};
        data.proxyId = proxyId;
        console.log ("Get Remote Send");
        console.log(data);
        KoheseIO.socket.emit('VersionControl/getRemotes', data, function(results) {
        if (results.error)
            toastr.error('Get Remotes Failed', 'Version Control');
        else {
            toastr.success('Get Remotes Succeeded!', 'Version Control');
            callback(results);
            }
            console.log(results);
        })


    }

}

export default () => {

    angular.module('app.services.versioncontrolservice', ['app.factories.koheseio', 'toastr'])
        .service('VersionControlService', VersionControlService);
}