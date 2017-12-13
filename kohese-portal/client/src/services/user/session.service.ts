import { Injectable } from '@angular/core';

import { SocketService } from '../socket/socket.service';

@Injectable()
export class SessionService {
  private sessions: SessionMap = {};

  constructor(private socketService: SocketService) {
  }
  
  ngOnInit() {
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
}

interface SessionMap {
  [sessionId: number]: any;
}