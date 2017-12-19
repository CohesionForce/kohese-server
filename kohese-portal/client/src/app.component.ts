import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ItemRepository } from './services/item-repository/item-repository.service';
import { SocketService } from './services/socket/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  constructor(private ItemRepository : ItemRepository,
              private SocketService : SocketService) {

  }

  ngOnInit () {

  }
}
