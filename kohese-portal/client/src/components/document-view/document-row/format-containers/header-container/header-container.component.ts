import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'header-container',
  templateUrl: './header-container.component.html',
  styleUrls: ['./header-container.component.scss']
})
export class HeaderContainerComponent implements OnInit {
  @Input()
  header;
  @Input()
  proxy;
  @Input()
  depth;
  rendered : string;

  constructor() { }

  ngOnInit() {
    console.log(this.header);
    this.rendered = "<h" + this.depth + '>' + this.proxy.item[this.header.contents[0].propertyName] + '</h' + this.depth + '>'
  }

}
