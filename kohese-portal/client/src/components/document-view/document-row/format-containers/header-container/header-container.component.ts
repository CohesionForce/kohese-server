import { Observable, Subscription } from 'rxjs';
import { Component, OnInit, Input, OnChanges, KeyValueDiffer, KeyValueDiffers, DoCheck, OnDestroy } from '@angular/core';
import { PropertyDefinition } from '../../../../type-editor/PropertyDefinition.interface';

@Component({
  selector: 'header-container',
  templateUrl: './header-container.component.html',
  styleUrls: ['./header-container.component.scss']
})
export class HeaderContainerComponent implements OnInit, OnDestroy {
  @Input()
  header;
  @Input()
  proxy;
  @Input()
  depth;
  rendered: string;
  @Input()
  editable = false;
  differ: KeyValueDiffer<string, any>;
  @Input()
  upsertComplete: Observable<any>;
  upsertSub: Subscription;
  property: PropertyDefinition;

  constructor(private differs: KeyValueDiffers) {
    this.differ = this.differs.find({}).create();
  }

  ngOnInit() {
    this.property = this.header.contents[0];
    this.render();
    this.upsertSub = this.upsertComplete.subscribe(() => {
      this.render();
      this.property = this.header.contents[0];
    });
  }

  ngOnDestroy() {
    this.upsertSub.unsubscribe();
  }

  render() {
    this.rendered =
      '<h' + this.depth + '>' +
      this.proxy.item[this.header.contents[0].propertyName.attribute] +
      '</h' + this.depth + '>';
  }
}
