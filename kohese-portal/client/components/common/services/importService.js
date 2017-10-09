/* This service handles communication with the server when a document is being
   imported into Kohese */

import SocketIOFileClient from 'socket.io-file-client';
const Path = require("path");

function ImportService(KoheseIO) {  

    const ctrl = this;

    var uploader = new SocketIOFileClient(KoheseIO.socket);
    var parent;
    var intermediate;

    ctrl.importFile = function(fileInfo, parentItem, intermediateDirectories) {
        console.log(fileInfo);
        parent = parentItem;
        intermediate = intermediateDirectories;
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
        KoheseIO.socket.emit('ImportDocuments', {
          files: [Path.join(fileInfo.uploadDir, fileInfo.name)],
          parentItem: parent,
          intermediateDirectories: intermediate
        }, function () {
          console.log("::: Success importing " + fileInfo.name + ".");
          if (results.error) {
            // toastr.error('Import Failed.', 'Document Import');            
          } else {
            // toastr.success('Import Succeeded.', 'Document Import');
          }
        });
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