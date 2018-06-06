import { Input } from '@angular/core';
import { ItemProxy } from './../../../../../common/src/item-proxy';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'stateful-proxy-card',
  templateUrl: './proxy-dash-card.component.html',
  styleUrls: ['./proxy-dash-card.component.css']
})
export class ProxyDashCardComponent implements OnInit {
  @Input()
  proxy : ItemProxy;
  editable : boolean = false;

  constructor() { }

  ngOnInit() {
  }

  openProxyDialog () {

  }

  stateChanged () {

  }
}
