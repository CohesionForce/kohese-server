/*imported into Kohese */

import { Injectable } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { ToastrService } from 'ngx-toastr';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { NotificationService } from '../../services/notifications/notification.service';

import * as SocketIOFileClient from 'socket.io-file-client';

@Injectable()
export class UploadService {
  private fileSocket : SocketIOFileClient;
  private parentId: string;
  private uploadListLength : number = 0;
  private uploadedItems : Array<ItemProxy> = [];

  constructor(private SocketService: SocketService,
    private toastrService: ToastrService,
    private _notificationService: NotificationService) {
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

      this.SocketService.getSocket().emit('UploadImages', data,
        (results: any) => {
          if (results.error || (0 === results.length)) {
            if (results.error) {
              console.log(results.error);
            }
            this.toastrService.error('Upload Failed', 'Upload',
              {positionClass: 'toast-bottom-right'});
            this._notificationService.addNotifications('ERROR: Upload - Image Failed');
          } else {
            for (let i: number = 0; i < results.length; i++) {
              this.uploadedItems.push(results[i]);
            }

            if (this.uploadedItems.length >= this.uploadListLength) {
              this.toastrService.success('Upload Succeeded', 'Upload',
                {positionClass: 'toast-bottom-right'});
              this._notificationService.addNotifications('COMPLETED: Upload - Image Succeeded');
            }
          }
      });
    });
    this.fileSocket.on('error', (err: Error) => {
      console.log('Upload Error: ', err);
    });
    this.fileSocket.on('abort', (fileInfo: any) => {
    });
  }

  public uploadFile(fileInfo: Array<File>, parentId: string): void {
    this.uploadedItems = [];
    // Save length of list so we can track when the import is complete
    this.uploadListLength = fileInfo.length;
    this.parentId = parentId;
    this.fileSocket.upload(fileInfo);
  }
}

