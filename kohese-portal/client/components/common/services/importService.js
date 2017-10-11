/* This service handles communication with the server when a document is being
   imported into Kohese */

import SocketIOFileClient from 'socket.io-file-client';
const Path = require("path");

function ImportService(KoheseIO, toastr) {  

    const ctrl = this;

    var uploader = new SocketIOFileClient(KoheseIO.socket);
    var parent;
    var intermediate;
    var uploadListLength = 0;
    var importedItems = [];

    ctrl.importFile = function(fileInfo, parentItem, intermediateDirectories) {
        console.log(fileInfo);
        // Save length of list so we can track when the import is complete
        uploadListLength = fileInfo.length;
        parent = parentItem;
        intermediate = intermediateDirectories;
        uploader.upload(fileInfo);
    }

    uploader.on('start', function(fileInfo) {
        console.log('Start uploading', fileInfo);
    });
    uploader.on('stream', function(fileInfo) {
        console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
    });
    uploader.on('complete', function(fileInfo) 
        {
        var data =  {         
            file: fileInfo.name,
            parentItem: parent,
            intermediateDirectories: intermediate
            }
        console.log('Upload Complete', fileInfo);
        KoheseIO.socket.emit('ImportDocuments', data,   
            function (results) {
                
                if (results.error) {
                    toastr.error('Import Failed.', 'Document Import');            
                } 
                else 
                    {
                    console.log(fileInfo);
                    importedItems.push(fileInfo);
                    if (importedItems.length === uploadListLength) 
                        {
                        console.log("::: Success importing " + fileInfo.name + ".");
                        console.log(importedItems);
                        importedItems = [];
                        }
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