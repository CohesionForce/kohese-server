import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'side-bar',
  templateUrl: './sidebar.component.html'
})
export class SideBarComponent implements OnInit {
  userLoggedIn : boolean;

  constructor () {

  }

  ngOnInit() {
    this.userLoggedIn = true;
  }
}
