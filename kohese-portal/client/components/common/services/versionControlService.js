/* Created by Josh */

function VersionControlService(KoheseIO){
    const service = this;

    service.stageItems = function(proxyIds) {
        console.log (proxyIds);
        var sendProxy = {proxyIds: Array.from(proxyIds)}
        console.log("Send Proxy");
        console.log(sendProxy);
        KoheseIO.socket.emit('VersionControl/add', sendProxy, function (results) {
            console.log("::: Stage results:");
            console.log(results);
          });
    }
    
}

export default () => {

    angular.module('app.services.versioncontrolservice', [])
        .service('VersionControlService', VersionControlService);
}