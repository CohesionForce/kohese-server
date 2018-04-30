import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';

@Component({
  selector: 'user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  /* Data */
  @Input()
  user : any;
  constructor (private itemRepository : ItemRepository) {

  }

  ngOnInit () {

  }

  ngOnDestroy () {

  }

  saveUser () {

  }
}
