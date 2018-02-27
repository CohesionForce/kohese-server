import { Injectable } from '@angular/core';

import * as SocketIoClient from 'socket.io-client';

@Injectable()
export class SocketService {
  public socket: SocketIOClient.Socket;
  private _connected: boolean = false;

  constructor() {
    this.socket = SocketIoClient();
    this.socket.on('connect', () => {
      this._connected = true;
    });
    this.socket.on('connect_error', () => {
      this._connected = false;
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
  
  get connected() {
    return this._connected;
  }
}
