import { Injectable } from '@angular/core';

import { ItemProxy } from '../../../../common/src/item-proxy';
import { SocketService } from '../socket/socket.service';
import { Observable, bindCallback } from 'rxjs';


export enum VersionControlState {
  CURRENT = 'Current', IGNORED = 'Ignored', CONFLICT = 'Conflict', STAGED =
    'Staged', UNSTAGED = 'Unstaged'
}

export enum VersionControlSubState {
  NONE = 'None', NEW = 'New', MODIFIED = 'Modified', RENAMED = 'Renamed',
    DELETED = 'Deleted', TYPE_CHANGE = 'Type Change', UNREADABLE = 'Unreadable'
}

@Injectable()
export class VersionControlService {
  private _emitReturningObservable: (message: string, data: any) => Observable<any> =
    bindCallback(this.socketService.getSocket().emit.bind(this.
    socketService.getSocket()));

  private readonly _VERSION_CONTROL_STATUS_MAP: any = {
    CURRENT: {
        state: VersionControlState.CURRENT,
        substate: VersionControlSubState.NONE
      },
    IGNORED: {
        state: VersionControlState.IGNORED,
        substate: VersionControlSubState.NONE
      },
    CONFLICTED: {
        state: VersionControlState.CONFLICT,
        substate: VersionControlSubState.NONE
      },
    INDEX_NEW: {
        state: VersionControlState.STAGED,
        substate: VersionControlSubState.NEW
      },
    INDEX_MODIFIED: {
        state: VersionControlState.STAGED,
        substate: VersionControlSubState.MODIFIED
      },
    INDEX_RENAMED: {
        state: VersionControlState.STAGED,
        substate: VersionControlSubState.RENAMED
      },
    INDEX_DELETED: {
        state: VersionControlState.STAGED,
        substate: VersionControlSubState.DELETED
      },
    INDEX_TYPECHANGE: { // Shouldn't happen
        state: VersionControlState.STAGED,
        substate: VersionControlSubState.TYPE_CHANGE
      },
    WT_NEW: {
        state: VersionControlState.UNSTAGED,
        substate: VersionControlSubState.NEW
      },
    WT_MODIFIED: {
        state: VersionControlState.UNSTAGED,
        substate: VersionControlSubState.MODIFIED
      },
    WT_RENAMED: {
        state: VersionControlState.UNSTAGED,
        substate: VersionControlSubState.RENAMED
      },
    WT_DELETED: {
        state: VersionControlState.UNSTAGED,
        substate: VersionControlSubState.DELETED
      },
    WT_TYPECHANGE: { // Shouldn't happen
        state: VersionControlState.UNSTAGED,
        substate: VersionControlSubState.TYPE_CHANGE
      },
    WT_UNREADABLE: { // Shouldn't happen
        state: VersionControlState.UNSTAGED,
        substate: VersionControlSubState.UNREADABLE
      }
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
