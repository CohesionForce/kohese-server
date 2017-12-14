import { Injectable } from '@angular/core';

import { ItemProxy } from '../../../../common/models/item-proxy';
import { SocketService } from '../socket/socket.service';
import { UserService } from '../user/user.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

@Injectable()
export class VersionControlService {
  constructor(private socketService: SocketService, private userService: UserService,
    private toastrService: ToastrService) {
  }
  
  stageItems(proxies: ItemProxy[]) {
    let data: {
      proxyIds: string[];
    } = {
      proxyIds: []
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].id);
    }
    
    this.socketService.getSocket().emit('VersionControl/stage', data,
      function (results) {
      if (results.error) {
        this.toastrService.error('Stage Failed', results.error);
      } else {
        this.toastrService.success('Stage Succeeded', 'Version Control');
      }
    });
  }
  
  unstageItems(proxies: ItemProxy[], callback: Function) {
    let data: {
      proxyIds: string[];
    } = {
      proxyIds: []
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].id);
    }
    
    this.socketService.getSocket().emit('VersionControl/unstage', data,
      function (results) {
      if (results.error) {
        this.toastrService.error('Unstage Failed', results.error);
      } else {
        this.toastrService.success('Unstage Succeeded', 'Version Control');
      }

      if (callback) {
        callback(!results.error);
      }
    });
  }
  
  revertItems(proxies: ItemProxy[]) {
    let data: {
      proxyIds: string[];
    } = {
      proxyIds: []
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].id);
    }
    
    this.socketService.getSocket().emit('VersionControl/revert', data,
      function (results) {
      if (results.error) {
        this.toastrService.error('Revert Failed', results.error);
      } else {
        this.toastrService.success('Revert Succeeded', 'Version Control');
      }
    });
  }
  
  commitItems(proxies: ItemProxy[], commitMessage: string) {
    Observable.forkJoin([this.userService.getCurrentUsername(),
      this.userService.getCurrentUserEmail()]).subscribe((results) => {
      let data: {
        proxyIds: string[];
        username: string;
        email: string;
        message: string;
      } = {
        proxyIds: [],
        username: results[0],
        email: results[1],
        message: commitMessage
      };
      for (let j = 0; j < proxies.length; j++) {
        data.proxyIds.push(proxies[j].id);
      }
    
      this.socketService.getSocket().emit('VersionControl/commit', data,
        function (results) {
        if (results.error) {
          this.toastrService.error('Commit Failed', results.error);
        } else {
          this.toastrService.success('Commit Succeeded', 'Version Control');
        }
      });
    });
  }
  
  push(ids: string[], remoteName: string) {
    let data: {
      proxyIds: string[];
      remoteName: string;
    } = {
      proxyIds: ids,
      remoteName: remoteName
    };
    
    this.socketService.getSocket().emit('VersionControl/push', data,
      function (results) {
      if (results.error) {
        this.toastrService.error('Push Failed', results.error);
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
      function (results) {
      if (results.error) {
        this.toastrService.error('Add Remote Failed', results.error);
      } else {
        this.toastrService.success('Add Remote Succeeded', 'Version Control');
      }
    });
  }
  
  getRemotes(id: string, callback: Function) {
    let data: {
      proxyId: string;
    } = {
      proxyId: id
    };
    this.socketService.getSocket().emit('VersionControl/getRemotes', data,
      function (results) {
      if (results.error) {
        this.toastrService.error('Remote Retrieval Failed', results.error);
      } else {
        this.toastrService.success('Remote Retrieval Succeeded', 'Version Control');
        callback(results);
      }
    });
  }
}