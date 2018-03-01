import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { SocketService } from '../socket/socket.service';
import { CurrentUserService } from './current-user.service';
import * as ItemProxy from '../../../../common/models/item-proxy';
import { ItemRepository} from '../item-repository/item-repository.service';

@Injectable()
export class SessionService {
  private sessions: SessionMap = {};
  private sessionUser: BehaviorSubject<ItemProxy> = new BehaviorSubject(undefined);
  
  private itemRepositoryStatusSubscription: Subscription;

  constructor(private socketService: SocketService,
    private CurrentUserService: CurrentUserService,
    private itemRepository: ItemRepository, private router: Router) {
    this.CurrentUserService.getCurrentUserSubject().subscribe((decodedToken) => {
      if (decodedToken) {
        this.itemRepositoryStatusSubscription = this.itemRepository.
          getRepoStatusSubject().subscribe((status) => {
          if (this.itemRepository.state.SYNCHRONIZATION_SUCCEEDED === status.state) {
            let usersProxy: ItemProxy = this.itemRepository.getRootProxy().getChildByName('Users');
            this.sessionUser.next(usersProxy.getChildByName(decodedToken.username));
          } else {
            this.sessionUser.next(undefined);
          }
        });
      } else {
        if (this.itemRepositoryStatusSubscription) {
          this.itemRepositoryStatusSubscription.unsubscribe();
          this.itemRepositoryStatusSubscription = undefined;
        }
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