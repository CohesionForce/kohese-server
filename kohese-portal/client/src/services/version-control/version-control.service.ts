import { Injectable } from '@angular/core';

import { ItemProxy } from '../../../../common/src/item-proxy';
import { SocketService } from '../socket/socket.service';
import { Observable, bindCallback } from 'rxjs';


@Injectable()
export class VersionControlService {
  private _emitReturningObservable: (message: string, data: any) => Observable<any> =
    bindCallback(this.socketService.getSocket().emit.bind(this.
    socketService.getSocket()));

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

  public commitItems(proxies: Array<ItemProxy>, committer: any,
    commitMessage: string): Observable<any> {
    let data: {
      proxyIds: Array<string>;
      username: string;
      email: string;
      message: string;
    } = {
      proxyIds: [],
      username: committer.name,
      email: committer.email,
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
}
