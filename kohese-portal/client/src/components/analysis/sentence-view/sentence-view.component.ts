import { Component, OnInit, OnDestroy } from '@angular/core';

import { AnalysisViewComponent } from '../AnalysisViewComponent.class';

@Component({
  selector: 'sentence-view',
  templateUrl : './sentence-view.component.html'
})
export class SentenceViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
  constructor() {
    super();
  }

  ngOnInit () {

  }

  ngOnDestroy () {

  }
}
