import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Parser, HtmlRenderer } from 'commonmark';

import { ItemProxy } from '../../../../common/models/item-proxy.js';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';


import { TabService } from '../../services/tab/tab.service';
import { NavigationService } from '../../services/navigation/navigation.service';

import * as commonmark from 'commonmark';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'document-view',
  templateUrl: './document-view.component.html'
})

export class DocumentViewComponent extends NavigatableComponent
                                   implements OnInit, OnDestroy {
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

  /* Observables */
  @Input()
  filterSubject : BehaviorSubject<any>;
  @Input()
  showChildrenSubject : BehaviorSubject<boolean>;

  /* Subscriptions */
  filterSubscription : Subscription;
  showChildrenSubscription : Subscription;




  constructor (NavigationService : NavigationService,
               TabService : TabService) {
    super(NavigationService, TabService)
    this.docReader = new commonmark.Parser();
    this.docWriter = new commonmark.HtmlRenderer({sourcepos: true});
  }

  ngOnInit() {
    console.log(this);
    if (this.filterSubject) {
      this.filterSubscription = this.filterSubject.subscribe(filter => {
        this.filter = filter;
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

  }

  ngOnDestroy() {
    if (this.filterSubject) {
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

