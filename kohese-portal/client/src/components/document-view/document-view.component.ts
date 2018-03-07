import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { Parser, HtmlRenderer } from 'commonmark';

import { ItemProxy } from '../../../../common/src/item-proxy.js';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';

import { NavigationService } from '../../services/navigation/navigation.service';

import * as commonmark from 'commonmark';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { AnalysisFilter } from '../analysis/AnalysisViewComponent.class.js';


@Component({
  selector: 'document-view',
  templateUrl: './document-view.component.html'
})

export class DocumentViewComponent extends NavigatableComponent
                                   implements OnInit, OnDestroy, OnChanges {
  /* UI Toggles */
  showChildren : boolean;

  /* Data */
  @Input()
  itemProxy : ItemProxy;

  filter : string;
  docRendered : string;
  itemDescriptionRendered : string;
  filterRegex : RegExp;
  filterRegexHighlighted : RegExp;
  invalidFilterRegex : boolean;

  /* Utils */
  docReader : Parser;
  docWriter : HtmlRenderer
  initialized : boolean;

  /* Observables */
  @Input()
  filterSubject : BehaviorSubject<AnalysisFilter>;
  @Input()
  showChildrenSubject : BehaviorSubject<boolean>;

  /* Subscriptions */
  filterSubscription : Subscription;
  showChildrenSubscription : Subscription;




  constructor (NavigationService : NavigationService) {
    super(NavigationService)
    this.docReader = new commonmark.Parser();
    this.docWriter = new commonmark.HtmlRenderer({sourcepos: true});
    this.initialized = false;
  }

  ngOnInit() {
    console.log(this);
    if (this.filterSubject) {
      this.filterSubscription = this.filterSubject.subscribe(newFilter => {
        this.filter = newFilter.filter;
        this.onFilterChange();
      })
    }
    this.showChildrenSubscription = this.showChildrenSubject.subscribe(showChildren => {
      console.log(showChildren);
      this.showChildren = showChildren;
      this.docRendered = null;
      this.itemDescriptionRendered = null;
      this.generateDoc();
    })

    this.initialized = true
  }

  ngOnDestroy() {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
    this.showChildrenSubscription.unsubscribe();
  }

  generateDoc () : void {
    if (this.showChildren) {
      var docParsed = this.docReader.parse(this.itemProxy.getDocument());
      this.docRendered = this.docWriter.render(docParsed);
    } else if (this.itemProxy.item.description) {
      var parsed = this.docReader.parse(this.itemProxy.item.description); // parsed is a 'Node' tree
      this.itemDescriptionRendered = this.docWriter.render(parsed); // result is a String
    }
  }

  ngOnChanges (changes) {
    if(this.initialized) {
      this.itemProxy = (changes.itemProxy) ? changes.itemProxy.currentValue : changes.currentValue;
      this.generateDoc();
    }
  }

  onFilterChange () {
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
}

