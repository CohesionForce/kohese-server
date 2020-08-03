import { Injectable } from '@angular/core';

import * as SocketIoClient from 'socket.io-client';

@Injectable()
export class SocketService {
  public socket: SocketIOClient.Socket;

  constructor() {
    this.socket = SocketIoClient({
      rejectUnauthorized: false
    });
  }

  connect(): void {
    this.socket.connect();
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  getSocket(): SocketIOClient.Socket {
    return this.socket;
  }
}
