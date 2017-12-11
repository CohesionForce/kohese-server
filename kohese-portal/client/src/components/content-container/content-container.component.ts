import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/mergeMap';



@Component({
  selector: 'content-container',
  templateUrl: './content-container.component.html'
})
export class ContentContainerComponent implements OnInit {
  tabs;

  constructor() {

  }

  ngOnInit(): void {
    this.tabs = [{title: 'Base tab'}, {title: 'second tab'}];
    console.log(this.tabs);
    const source = of('Hello');
    source.mergeMap(val => of(`${val} World!`));
  }

  setTab(): void {
    console.log('Set tab');
  }

  deleteTab(tab): void {

  }

  addTab(): void {
    this.tabs.push({title:'new tab'});
    console.log(this.tabs)

  }
}
