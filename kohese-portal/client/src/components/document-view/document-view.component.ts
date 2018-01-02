import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { ItemProxy } from '../../../../common/models/item-proxy.js';

@Component({
  selector: 'document-view',
  templateUrl: './document-view.component.html'
})

export class DocumentViewComponent implements OnInit, OnDestroy {
  @Input()
  itemProxy : ItemProxy;
  @Input()
  showChildren : boolean;

  constructor () {

  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }
}

//TODO - Implement
