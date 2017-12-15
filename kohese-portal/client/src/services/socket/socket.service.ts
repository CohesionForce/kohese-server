import { Injectable } from '@angular/core';

import { AuthTokenFactory } from '../authentication/auth-token.factory';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as SocketIoClient from 'socket.io-client';

@Injectable()
export class SocketService {
  private socket: SocketIOClient.Socket;
  private initialized: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private authenticated: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  constructor(private authTokenFactory: AuthTokenFactory) {
    let token: string = this.authTokenFactory.getToken().getValue();
    if (token) {
      this.initialize();
    }
  }
  
  initialize() {
    this.initialized.next(true);
    this.socket = SocketIoClient();
    
    this.socket.on('authenticated', () => {
      this.authenticated.next(true);
    });
    
    this.socket.on('connect', () => {
      let token: {
        token: string
      } = {
        token: this.authTokenFactory.getToken().getValue()
      };
      this.socket.emit('authenticate', token);
    });
    
    this.socket.on('disconnect', () => {
      this.authenticated.next(false);
    });
  }
  
  connect() {
    if (this.initialized.getValue()) {
      this.socket.connect();
    } else {
      this.initialize();
    }
  }
  
  disconnect() {
    if (this.initialized.getValue()) {
      this.socket.disconnect();
      this.authenticated.next(false);
    }
  }
  
  isInitialized(): BehaviorSubject<boolean> {
    return this.initialized;
  }
  
  isAuthenticated(): BehaviorSubject<boolean> {
    return this.authenticated;
  }
  
  getSocket(): SocketIOClient.Socket {
    return this.socket;
  }
}