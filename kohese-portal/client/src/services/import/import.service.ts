/* This service handles communication with the server when a document is being
   imported into Kohese */

import { Injectable } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { ToastrService } from 'ngx-toastr';
import { ItemProxy } from '../../../../common/src/item-proxy';

import * as SocketIOFileClient from 'socket.io-file-client';

@Injectable()
export class ImportService {
  private fileSocket : SocketIOFileClient;
  private parentId: string;
  private uploadListLength : number = 0;
  private importedItems : Array<ItemProxy> = [];

  constructor(private SocketService : SocketService,
    private toastrService: ToastrService) {
    this.fileSocket = new SocketIOFileClient(SocketService.getSocket());
    this.fileSocket.on('start', (fileInfo: any) => {
    });
    this.fileSocket.on('stream', (fileInfo: any) => {
    });
    this.fileSocket.on('complete', (fileInfo: any) => {
      let data: any =  {
        file: fileInfo.name,
        parentItem: this.parentId
      };
      
      this.SocketService.getSocket().emit('ImportDocuments', data,
        (results: any) => {
          if (results.error || (0 === results.length)) {
            if (results.error) {
              console.log(results.error);
            }
            this.toastrService.error('Import Failed', 'Import');
          } else {
            for (let i: number = 0; i < results.length; i++) {
              this.importedItems.push(results[i]);
            }
            
            if (this.importedItems.length >= this.uploadListLength) {
              this.toastrService.success('Import Succeeded', 'Import');
            }
          }
      });
    });
    this.fileSocket.on('error', (err: Error) => {
      console.log('Import Error: ', err);
    });
    this.fileSocket.on('abort', (fileInfo: any) => {
    });
  }

  importFile(fileInfo: Array<File>, parentId: string): void {
    this.importedItems = [];
    // Save length of list so we can track when the import is complete
    this.uploadListLength = fileInfo.length;
    this.parentId = parentId;
    this.fileSocket.upload(fileInfo);
  }
}
