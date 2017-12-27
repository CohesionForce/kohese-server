import { Component, OnInit, OnDestroy } from '@angular/core';

import { AnalysisViewComponent } from '../AnalysisViewComponent.class';

@Component({
  selector: 'term-view',
  templateUrl : './term-view.component.html'
})
export class TermViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
  constructor() {
    super();
  }

  ngOnInit () {

  }

  ngOnDestroy () {

  }
}
