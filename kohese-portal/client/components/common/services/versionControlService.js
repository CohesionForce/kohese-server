/* Created by Josh */

function VersionControlService(KoheseIO){
    const service = this;

    service.stageItems = function(proxyIds) {
        console.log (proxyIds);
        KoheseIO.socket.emit('VersionControl/add', {proxyIds: proxyIds}, function (results) {
            console.log("::: Stage results:");
            console.log(results);
          });
    }
    
}

export default () => {

    angular.module('app.services.versioncontrolservice', [])
        .service('VersionControlService', VersionControlService);
}