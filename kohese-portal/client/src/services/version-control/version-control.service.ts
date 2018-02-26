import { Injectable } from '@angular/core';

import * as ItemProxy from '../../../../common/models/item-proxy';
import { SocketService } from '../socket/socket.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Observable';
import { SessionService } from '../user/session.service';
import 'rxjs/add/observable/bindCallback';
import 'rxjs/add/operator/do';

@Injectable()
export class VersionControlService {
  constructor(private socketService: SocketService, private sessionService: SessionService,
    private toastrService: ToastrService) {
  }
  
  stageItems(proxies: Array<ItemProxy>) {
    let data: {
      proxyIds: Array<string>;
    } = {
      proxyIds: []
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].item.id);
    }
    
    this.socketService.getSocket().emit('VersionControl/stage', data,
      (results: any) => {
      if (results.error) {
        this.toastrService.error('Stage Failed', 'Version Control');
      } else {
        this.toastrService.success('Stage Succeeded', 'Version Control');
      }
    });
  }
  
  unstageItems(proxies: Array<ItemProxy>, callback: Function) {
    let data: {
      proxyIds: Array<string>;
    } = {
      proxyIds: []
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].item.id);
    }
    
    this.socketService.getSocket().emit('VersionControl/unstage', data,
      (results: any) => {
      if (results.error) {
        this.toastrService.error('Unstage Failed', 'Version Control');
      } else {
        this.toastrService.success('Unstage Succeeded', 'Version Control');
      }

      if (callback) {
        callback(!results.error);
      }
    });
  }
  
  revertItems(proxies: Array<ItemProxy>) {
    let data: {
      proxyIds: Array<string>;
    } = {
      proxyIds: []
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].item.id);
    }
    
    this.socketService.getSocket().emit('VersionControl/revert', data,
      (results: any) => {
      if (results.error) {
        this.toastrService.error('Revert Failed', 'Version Control');
      } else {
        this.toastrService.success('Revert Succeeded', 'Version Control');
      }
    });
  }
  
  commitItems(proxies: Array<ItemProxy>, commitMessage: string) {
    let proxy: ItemProxy = this.sessionService.getSessionUser().getValue();
    let data: {
      proxyIds: Array<string>;
      username: string;
      email: string;
      message: string;
    } = {
      proxyIds: [],
      username: proxy.item.name,
      email: proxy.item.email,
      message: commitMessage
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].item.id);
    }
  
    this.socketService.getSocket().emit('VersionControl/commit', data,
      (results: any) => {
      if (results.error) {
        this.toastrService.error('Commit Failed', 'Version Control');
      } else {
        this.toastrService.success('Commit Succeeded', 'Version Control');
      }
    });
  }
  
  push(ids: string[], remoteName: string) {
    let data: {
      proxyIds: Array<string>;
      remoteName: string;
    } = {
      proxyIds: ids,
      remoteName: remoteName
    };
    
    this.socketService.getSocket().emit('VersionControl/push', data,
      (results: any) => {
      if (results.error) {
        this.toastrService.error('Push Failed', 'Version Control');
      } else {
        this.toastrService.success('Push Succeeded', 'Version Control');
      }
    });
  }
  
  addRemote(id: string, remoteName: string, url: string) {
    let data: {
      proxyId: string;
      remoteName: string;
      url: string;
    } = {
      proxyId: id,
      remoteName: remoteName,
      url: url
    };
    
    this.socketService.getSocket().emit('VersionControl/addRemote', data,
      (results: any) => {
      if (results.error) {
        this.toastrService.error('Add Remote Failed', 'Version Control');
      } else {
        this.toastrService.success('Add Remote Succeeded', 'Version Control');
      }
    });
  }
  
  getRemotes(id: string): Observable<any> {
    let data: {
      proxyId: string;
    } = {
      proxyId: id
    };
    
    let emit: (message: string, data: { proxyId: string; }) => Observable<any> =
      Observable.bindCallback(this.socketService.getSocket().emit.bind(this.socketService.getSocket()));
    return emit('VersionControl/getRemotes', data).do((results: any) => {
      if (results.error) {
        this.toastrService.error('Remote Retrieval Failed', 'Version Control');
      } else {
        this.toastrService.success('Remote Retrieval Succeeded', 'Version Control');
      }
    });
  }
}