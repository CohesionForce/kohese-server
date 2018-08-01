import { Injectable } from '@angular/core';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { AnalysisService } from '../../services/analysis/analysis.service';

/* Here is where we will setup the base methods for all the analysis components */

@Injectable()
export class AnalysisViewComponent extends NavigatableComponent {
  protected filterString: string;
  protected filterRegex: RegExp;
  filterRegexHighlighted: RegExp;
  invalidFilterRegex: boolean
  termPOSFilterCriteriaList: Array<any>;
  phrasePOSFilterCriteriaList: Array<any>;
  analysisPOSFilterName: string = 'Standard';

  constructor(NavigationService : NavigationService,
              protected AnalysisService : AnalysisService) {
    super(NavigationService);

    this.termPOSFilterCriteriaList = Object.keys(AnalysisService.termFilterCriteria);
    this.phrasePOSFilterCriteriaList = Object.keys(AnalysisService.phraseFilterCriteria);

  }

  onFilterChange () : void {
    console.log('>>> Filter string changed to: ' + this.filterString);

    var regexFilter = /^\/(.*)\/([gimy]*)$/;
    var filterIsRegex = this.filterString.match(regexFilter);

    if (filterIsRegex) {
      try {
        this.filterRegex = new RegExp(filterIsRegex[1], filterIsRegex[2]);
        this.filterRegexHighlighted = new RegExp('(' + filterIsRegex[1] + ')', 'g' + filterIsRegex[2]);
        this.invalidFilterRegex = false;
      } catch (e) {
        this.invalidFilterRegex = true;
      }
    } else {
      let cleanedPhrase = this.filterString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (this.filterString !== '') {
        this.filterRegex = new RegExp(cleanedPhrase, 'i');
        this.filterRegexHighlighted = new RegExp('(' + cleanedPhrase + ')', 'gi');
        this.invalidFilterRegex = false;
      } else {
        this.filterRegex = null;
        this.filterRegexHighlighted = null;
        this.invalidFilterRegex = false;
      }
    }
  }
}

export enum AnalysisViews {
  TERM_VIEW,
  SENTENCE_VIEW,
  PHRASE_VIEW,
  DOCUMENT_VIEW
}

export interface AnalysisFilter {
  source : AnalysisViews,
  filter : string,
  filterOptions : {
    exactMatch: boolean,
    ignoreCase: boolean
  }
}
