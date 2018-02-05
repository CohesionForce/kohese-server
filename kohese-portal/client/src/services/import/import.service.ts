/* This service handles communication with the server when a document is being
   imported into Kohese */

import { Injectable } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import * as ItemProxy from '../../../../common/models/item-proxy';

import * as SocketIOFileClient from 'socket.io-file-client';

@Injectable()
export class ImportService {
  fileSocket : SocketIOFileClient
  parentProxy : ItemProxy;
  uploadListLength : number;
  importedItems : Array<ItemProxy>;

  constructor (private SocketService : SocketService) {
    this.fileSocket = new SocketIOFileClient(SocketService.getSocket());
    this.parentProxy = {};
    this.uploadListLength = 0;
    this.importedItems = [];
  }

    importFile = function(fileInfo, parentItem) {
       this.importedItems = []
       // Save length of list so we can track when the import is complete
       this.uploadListLength = fileInfo.length;
       parent = parentItem;
       this.fileSocket.upload(fileInfo);
     }

    registerListeners () {
      this.fileSocket.on('start', function(fileInfo) {
        console.log('Start uploading', fileInfo);
      });
      this.fileSocket.on('stream', function(fileInfo) {
        console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
      });
      this.fileSocket.on('complete', function(fileInfo) {
        var data =  {
          file: fileInfo.name,
          parentItem: parent
        }
        this.SocketService.getSocket().emit('ImportDocuments', data,
          function (results) {
            if (results.error) {
              this.toastr.error('Import Failed.', results.error);
            } else {
              console.log(results);
              for (var i = 0; i < results.length; i++) {
                this.importedItems.push(results[i]);
              }
              if (this.importedItems.length >= this.uploadListLength) {
                this.toastr.success('Import Succeeded', 'Document Import')
                console.log('::: Success importing ' + results + '.');
              }
            }
          });
      });
      this.fileSocket.on('error', function(err) {
        console.log('Error!', err);
      });
      this.fileSocket.on('abort', function(fileInfo) {
        console.log('Aborted: ', fileInfo);
      });
    }

   }

