/* This service handles communication with the server when a document is being
   imported into Kohese */

import SocketIOFileClient from 'socket.io-file-client';

function ImportService(KoheseIO) {  

    const ctrl = this;

    var uploader = new SocketIOFileClient(KoheseIO.socket);

    ctrl.importFile = function(fileInfo) {
        console.log(fileInfo);
        uploader.upload([fileInfo]);
    }

    uploader.on('start', function(fileInfo) {
        console.log('Start uploading', fileInfo);
    });
    uploader.on('stream', function(fileInfo) {
        console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
    });
    uploader.on('complete', function(fileInfo) {
        console.log('Upload Complete', fileInfo);
    });
    uploader.on('error', function(err) {
        console.log('Error!', err);
    });
    uploader.on('abort', function(fileInfo) {
        console.log('Aborted: ', fileInfo);
    });
}

export default () => {
    angular.module('app.services.importservice', [])
        .service("ImportService", ImportService);
}