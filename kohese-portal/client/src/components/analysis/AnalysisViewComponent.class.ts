import { Injectable } from '@angular/core';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { TabService } from '../../services/tab/tab.service';
import { AnalysisService } from '../../services/analysis/analysis.service';

/* Here is where we will setup the base methods for all the analysis components */

//TODO - Implement timeout on filter inputs

@Injectable()
export class AnalysisViewComponent extends NavigatableComponent{
  filter : string;
  filterRegex : RegExp;
  filterRegexHighlighted : RegExp;
  invalidFilterRegex : boolean;

  analysisFilterPOS;
  analysisPOSFilterCriteria;
  analysisPOSFilterCriteriaList;
  analysisPOSFilterName;

  protected AnalysisService : AnalysisService;

  constructor(NavigationService : NavigationService,
              TabService : TabService,
              AnalysisService : AnalysisService) {
    super(NavigationService, TabService);
    this.AnalysisService = AnalysisService;

  }

  onFilterChange () : void {
    console.log('>>> Filter string changed to: ' + this.filter);

    var regexFilter = /^\/(.*)\/([gimy]*)$/;
    var filterIsRegex = this.filter.match(regexFilter);

    if (filterIsRegex) {
      try {
        this.filterRegex = new RegExp(filterIsRegex[1], filterIsRegex[2]);
        this.filterRegexHighlighted = new RegExp('(' + filterIsRegex[1] + ')', 'g' + filterIsRegex[2]);
        this.invalidFilterRegex = false;
      } catch (e) {
        this.invalidFilterRegex = true;
      }
    } else {
      let cleanedPhrase = this.filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (this.filter !== '') {
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
    var MatchesPOS = this.analysisFilterPOS(summary,
      this.analysisPOSFilterCriteria[this.analysisPOSFilterName])
    if (MatchesPOS) {
      MatchesStringFilter =
            this.filterRegex === null
            || this.filterRegex.test(summary.text);
    }

    return MatchesPOS && MatchesStringFilter
  };
}


