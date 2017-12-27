import { Component, OnInit, OnDestroy } from '@angular/core';

import { AnalysisViewComponent } from '../AnalysisViewComponent.class';

@Component({
  selector: 'phrase-view',
  templateUrl : './phrase-view.component.html'
})
export class PhraseViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
  constructor() {
    super();
  }

  ngOnInit () {

  }

  ngOnDestroy () {

  }
}
