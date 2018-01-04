import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SocketService } from '../socket/socket.service';
import { AuthenticationService } from '../authentication/authentication.service';
import * as ItemProxy from '../../../../common/models/item-proxy';
import { ItemRepository } from '../item-repository/item-repository.service';

@Injectable()
export class SessionService {
  private sessions: SessionMap = {};
  private sessionUser: BehaviorSubject<ItemProxy> = new BehaviorSubject(undefined);

  constructor(private socketService: SocketService,
    private authenticationService: AuthenticationService,
    private itemRepository: ItemRepository, private router: Router) {
    this.authenticationService.getAuthenticationInformation().subscribe((decodedToken) => {
      if (decodedToken) {
        this.itemRepository.getRepoStatusSubject().subscribe((status) => {
          if (status.connected) {
            let usersProxy: ItemProxy = this.itemRepository.getRootProxy().getChildByName('Users');
            this.sessionUser.next(usersProxy.getChildByName(decodedToken.username));
          } else {
            this.sessionUser.next(undefined);
          }
        });
      } else {
        this.router.navigate(['login']);
      }
    });
    
    this.socketService.getSocket().on('session/add', (session) => {
      this.sessions[session.sessionId] = session;
    });
    
    this.socketService.getSocket().on('session/remove', (session) => {
      delete this.sessions[session.sessionId];
    });
    
    this.socketService.getSocket().on('session/list', (sessionList) => {
      for (let id in this.sessions) {
        delete this.sessions[id];
      }
      
      for (let id in sessionList) {
        this.sessions[id] = sessionList[id];
      }
    });
  }
  
  getSessions(): SessionMap {
    return this.sessions;
  }
  
  getSessionUser(): BehaviorSubject<ItemProxy> {
    return this.sessionUser;
  }
  
  getUsers(): Array<ItemProxy> {
    let users: Array<ItemProxy> = [];
    this.itemRepository.getRootProxy().visitChildren(undefined, (proxy) => {
      if (proxy.kind === 'KoheseUser') {
        users.push(proxy);
      }
    });
    
    return users;
  }
}

interface SessionMap {
  [sessionId: number]: any;
}