/* Created by Josh */

function VersionControlService(KoheseIO, UserService){
    const service = this;

    service.stageItems = function(proxyIds) {
        console.log (proxyIds);
        var data = {proxyIds: Array.from(proxyIds)}
        console.log("Send Proxy");
        console.log(sendProxy);
        KoheseIO.socket.emit('VersionControl/add', data, function (results) {
            console.log("::: Stage results:");
            console.log(results);
          });
    }

    service.commitItems = function (proxyIds, commitMessage) {
        var data = {};
        data.proxyIds = Array.from(proxyIds);
        data.username = UserService.getCurrentUsername();
        data.email = UserService.getCurrentUserEmail();
        data.message = commitMessage;
        console.log(data);
        KoheseIO.socket.emit('VersionControl/commit', data, function (results) {
            console.log("::: Commit results:");
        });
    }
    
}

export default () => {

    angular.module('app.services.versioncontrolservice', ['app.factories.koheseio'])
        .service('VersionControlService', VersionControlService);
}