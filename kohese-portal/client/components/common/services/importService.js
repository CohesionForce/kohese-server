/* This service handles communication with the server when a document is being
   imported into Kohese */

import SocketIOFileClient from 'socket.io-file-client';
const Path = require("path");

function ImportService(KoheseIO, toastr, $rootScope) {  

    const ctrl = this;

    var uploader = new SocketIOFileClient(KoheseIO.socket);
    var parent;
    var uploadListLength = 0;
    var importedItems = [];

    ctrl.importFile = function(fileInfo, parentItem) {
        importedItems = []
        // Save length of list so we can track when the import is complete
        uploadListLength = fileInfo.length;
        parent = parentItem;
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
            parentItem: parent
            }
        KoheseIO.socket.emit('ImportDocuments', data,   
            function (results) {
                
                if (results.error) {
                    toastr.error('Import Failed.', results.error);            
                } 
                else 
                    {
                    console.log(results);
                    for (var i = 0; i < results.length; i++)
                        importedItems.push(results[i]);
                    if (importedItems.length >= uploadListLength) 
                        {
                        toastr.success('Import Succeeded', "Document Import")
                        console.log("::: Success importing " + results + ".");
                        $rootScope.$broadcast('Import Complete', importedItems)
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
    angular.module('app.services.importservice', ['app.factories.koheseio'])
        .service("ImportService", ImportService);
}