import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as SocketIoClient from 'socket.io-client';

@Injectable()
export class SocketService {
  public socket: SocketIOClient.Socket;
  private initialized: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {
    this.initialize();
  }

  initialize(): void {
    this.initialized.next(true);
    this.socket = SocketIoClient();
  }

  connect(): void {
    if (this.initialized.getValue()) {
      this.socket.connect();
    } else {
      this.initialize();
    }
  }

  disconnect(): void {
    if (this.initialized.getValue()) {
      this.socket.disconnect();
    }
  }

  isInitialized(): BehaviorSubject<boolean> {
    return this.initialized;
  }

  getSocket(): SocketIOClient.Socket {
    return this.socket;
  }
}
