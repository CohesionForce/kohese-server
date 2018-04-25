import { Injectable } from '@angular/core';

import { ItemProxy } from '../../../../common/src/item-proxy';
import { SocketService } from '../socket/socket.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/bindCallback';

@Injectable()
export class VersionControlService {
  private _emitReturningObservable: (message: string, data: any) => Observable<any> =
    Observable.bindCallback(this.socketService.getSocket().emit.bind(this.
    socketService.getSocket()));

  private readonly _VERSION_CONTROL_STATUS_MAP: any = {
    CURRENT: { state: 'Current', substate: '' },
    IGNORED: { state: 'Ignored', substate: '' },
    CONFLICTED: { state: 'Conflict', substate: '' },
    INDEX_NEW: { state: 'Staged', substate: 'New' },
    INDEX_MODIFIED: { state: 'Staged', substate: 'Modified' },
    INDEX_RENAMED: { state: 'Staged', substate: 'Renamed' },
    INDEX_DELETED: { state: 'Staged', substate: 'Deleted' },
    INDEX_TYPECHANGE: { state: 'Staged', substate: 'TypeChange' }, // Shouldn't happen
    WT_NEW: { state: 'Unstaged', substate: 'New' },
    WT_MODIFIED: { state: 'Unstaged', substate: 'Modified' },
    WT_RENAMED: { state: 'Unstaged', substate: 'Renamed' },
    WT_DELETED: { state: 'Unstaged', substate: 'Deleted' },
    WT_TYPECHANGE: { state: 'Unstaged', substate: 'TypeChange' }, // Shouldn't happen
    WT_UNREADABLE: { state: 'Unstaged', substate: 'Unreadable' } // Shouldn't happen
  };

  public constructor(private socketService: SocketService) {
  }

  public stageItems(proxies: Array<ItemProxy>): Observable<any> {
    let data: {
      proxyIds: Array<string>;
    } = {
      proxyIds: []
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].item.id);
    }

    return this._emitReturningObservable('VersionControl/stage', data);
  }

  public unstageItems(proxies: Array<ItemProxy>): Observable<any> {
    let data: {
      proxyIds: Array<string>;
    } = {
      proxyIds: []
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].item.id);
    }

    return this._emitReturningObservable('VersionControl/unstage', data);
  }

  public revertItems(proxies: Array<ItemProxy>): Observable<any> {
    let data: {
      proxyIds: Array<string>;
    } = {
      proxyIds: []
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].item.id);
    }

    return this._emitReturningObservable('VersionControl/revert', data);
  }

  public commitItems(proxies: Array<ItemProxy>, committerProxy: ItemProxy,
    commitMessage: string): Observable<any> {
    let data: {
      proxyIds: Array<string>;
      username: string;
      email: string;
      message: string;
    } = {
      proxyIds: [],
      username: committerProxy.item.name,
      email: committerProxy.item.email,
      message: commitMessage
    };
    for (let j = 0; j < proxies.length; j++) {
      data.proxyIds.push(proxies[j].item.id);
    }

    return this._emitReturningObservable('VersionControl/commit', data);
  }

  public push(ids: string[], remoteName: string): Observable<any> {
    let data: {
      proxyIds: Array<string>;
      remoteName: string;
    } = {
      proxyIds: ids,
      remoteName: remoteName
    };

    return this._emitReturningObservable('VersionControl/push', data);
  }

  public addRemote(id: string, remoteName: string, url: string): Observable<any> {
    let data: {
      proxyId: string;
      remoteName: string;
      url: string;
    } = {
      proxyId: id,
      remoteName: remoteName,
      url: url
    };

    return this._emitReturningObservable('VersionControl/addRemote', data);
  }

  getRemotes(id: string): Observable<any> {
    let data: {
      proxyId: string;
    } = {
      proxyId: id
    };

    return this._emitReturningObservable('VersionControl/getRemotes', data);
  }

  public translateStatus(statuses: Array<string>): any {
    let translatedStatus: any = {};
    for (let j: number = 0; j < statuses.length; j++) {
      let statusValue: any = this._VERSION_CONTROL_STATUS_MAP[statuses[j]];
      translatedStatus[statusValue.state] = statusValue.substate;
    }

    return translatedStatus;
  }
}
