import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'dependency-info',
  templateUrl : './dependency-info.component.html'
})
export class DependencyInfoComponent implements OnInit{
  @Input()
  relations;
  @Input()
  kind;

  constructor(){

  }

  ngOnInit() {
    console.log(this);
  }
}