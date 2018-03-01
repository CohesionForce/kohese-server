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
  analysisPOSFilterCriteriaList: Array<any>;
  analysisPOSFilterName: string = 'Standard';

  constructor(NavigationService : NavigationService,
              protected AnalysisService : AnalysisService) {
    super(NavigationService);

    this.analysisPOSFilterCriteriaList = Object.keys(AnalysisService.posFilterCriteria);
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

  filterPhrases (summary) : boolean {
    var MatchesStringFilter;
    var MatchesPOS = this.AnalysisService.filterPOS(summary,
      this.AnalysisService.posFilterCriteria[this.analysisPOSFilterName])
    if (MatchesPOS) {
      MatchesStringFilter =
            this.filterRegex === null
            || this.filterRegex.test(summary.text);
    }

    return MatchesPOS && MatchesStringFilter
  }
}
