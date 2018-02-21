import { Component } from '@angular/core';
import { ItemRepository } from './services/item-repository/item-repository.service';
import { SocketService } from './services/socket/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: ['./app.component.scss']
})
export class AppComponent {

  constructor(private ItemRepository: ItemRepository,
    private SocketService: SocketService) {
  }
}
