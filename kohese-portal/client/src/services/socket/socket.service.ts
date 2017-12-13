import { Injectable } from '@angular/core';

import { AuthTokenFactory } from '../authentication/auth-token.factory';
import { Observable } from 'rxjs/Observable';
import * as SocketIoClient from 'socket.io-client';

@Injectable()
export class SocketService {
  private socket: SocketIOClient.Socket;
  private initialized: boolean = false;
  private authenticated: boolean = false;
  
  constructor(private authTokenFactory: AuthTokenFactory) {
  }
  
  ngOnInit() {
    this.authTokenFactory.getToken().subscribe((token) => {
      if (token) {
        this.initialize();
      }
    });
  }
  
  initialize() {
    this.initialized = true;
    this.socket = io();
    
    this.socket.on('authenticated', () => {
      this.authenticated = true;
    });
    
    this.socket.on('connect', () => {
      let token: {token: Observable<string>} = {
        token: this.authTokenFactory.getToken()
      };
      this.socket.emit('authenticate', token);
    });
    
    this.socket.on('disconnect', () => {
      this.authenticated = false;
    });
  }
  
  connect() {
    if (this.initialized) {
      this.socket.connect();
    } else {
      this.initialize();
    }
  }
  
  disconnect() {
    if (this.initialized) {
      this.socket.disconnect();
      this.authenticated = false;
    }
  }
  
  isInitialized(): boolean {
    return this.initialized;
  }
  
  isAuthenticated(): boolean {
    return this.authenticated;
  }
  
  getSocket(): SocketIOClient.Socket {
    return this.socket;
  }
}