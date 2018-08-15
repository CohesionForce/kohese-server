import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Input, OnChanges, KeyValueDiffer, KeyValueDiffers, DoCheck } from '@angular/core';

@Component({
  selector: 'header-container',
  templateUrl: './header-container.component.html',
  styleUrls: ['./header-container.component.scss']
})
export class HeaderContainerComponent implements OnInit{
  @Input()
  header;
  @Input()
  proxy;
  @Input()
  depth;
  rendered : string;
  @Input()
  editable = false;
  differ: KeyValueDiffer<string, any>;
  @Input()
  upsertComplete : Observable<any>

  constructor(private differs: KeyValueDiffers) {
    this.differ = this.differs.find({}).create();
  }

  ngOnInit() {
    console.log(this.header);
    this.upsertComplete.subscribe(()=>{
      this.render();
    })
    this.render();
  }

  render() {
    this.rendered =
      "<h" + this.depth + '>' +
      this.proxy.item[this.header.contents[0].propertyName] +
      '</h' + this.depth + '>'
  }
}
