import { Component, OnInit, OnDestroy, Input, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Parser, HtmlRenderer } from 'commonmark';
import { Observable } from 'rxjs';

import { ItemProxy } from '../../../../common/src/item-proxy.js';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';

import { NavigationService } from '../../services/navigation/navigation.service';

import * as commonmark from 'commonmark';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { AnalysisFilter } from '../analysis/AnalysisViewComponent.class.js';


@Component({
  selector: 'document-view',
  templateUrl: './document-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DocumentViewComponent extends NavigatableComponent
                                   implements OnInit, OnDestroy, OnChanges {
  /* UI Toggles */
  showChildren : boolean;

  /* Data */
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
  @Input()
  proxyStream : Observable<ItemProxy>

  /* Subscriptions */
  filterSubscription : Subscription;
  showChildrenSubscription : Subscription;
  proxyStreamSubscription : Subscription;




  constructor (NavigationService : NavigationService,
               private changeRef : ChangeDetectorRef) {
    super(NavigationService)
    this.docReader = new commonmark.Parser();
    this.docWriter = new commonmark.HtmlRenderer({sourcepos: true});
    this.initialized = false;
  }

  ngOnInit() {
    if (this.filterSubject) {
      this.filterSubscription = this.filterSubject.subscribe(newFilter => {
        this.filter = newFilter.filter;
        this.onFilterChange();
        this.changeRef.markForCheck();
      })
    }

    this.proxyStreamSubscription = this.proxyStream.subscribe((newProxy)=>{
      this.itemProxy = newProxy;
      // TODO - Determine if there is a way to cache and diff the new doc before
      // regenerating
      this.generateDoc();
      this.changeRef.markForCheck();
    })

    this.showChildrenSubscription = this.showChildrenSubject.subscribe(showChildren => {
      console.log(showChildren);
      this.showChildren = showChildren;
      this.docRendered = null;
      this.itemDescriptionRendered = null;
      this.generateDoc();
      this.changeRef.markForCheck();
    })

    this.initialized = true
  }

  ngOnDestroy() {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
    this.showChildrenSubscription.unsubscribe();
    this.proxyStreamSubscription.unsubscribe();
  }

  generateDoc () : void {
    if (this.showChildren) {
      let subtreeAsList = this.itemProxy.getSubtreeAsList();

      let docRendered = '';

      for(let idx in subtreeAsList){
        let listItem = subtreeAsList[idx];

        if (listItem.depth > 0){
          // Show the header for any node that is not the root of the document
          docRendered += '<h' + listItem.depth +'>' +listItem.proxy.item.name + '</h' + listItem.depth + '>';
        }
        if (listItem.proxy.item.description){
          // Show the description if it exists
          let nodeParsed = this.docReader.parse(listItem.proxy.item.description);
          docRendered += this.docWriter.render(nodeParsed);
        }
      }
      this.docRendered = docRendered;

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

