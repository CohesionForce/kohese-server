import { FormatDefinition } from './../type-editor/format-editor/format-editor.component';
import { TreeConfiguration } from './../../../../common/src/tree-configuration';
import { DialogService } from './../../services/dialog/dialog.service';
import { DetailsDialogComponent } from './../details/details-dialog/details-dialog.component';
import { ItemRepository, RepoStates } from './../../services/item-repository/item-repository.service';
import { Component, OnInit, OnDestroy, Input, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, ElementRef, trigger, state, style, animate, transition, ViewChildren, Output, EventEmitter } from '@angular/core';
import { Parser, HtmlRenderer } from 'commonmark';
import { Observable } from 'rxjs';

import { ItemProxy } from '../../../../common/src/item-proxy.js';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';

import { NavigationService } from '../../services/navigation/navigation.service';

import * as commonmark from 'commonmark';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { AnalysisFilter } from '../analysis/AnalysisViewComponent.class.js';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { Router, NavigationEnd } from '@angular/router';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';

export interface DocumentInfo {
  proxy: ItemProxy;
  containers : Array<any>;
  rendered: string;
  active: boolean;
  hovered: boolean;
  depth: number;
}

@Component({
  selector: 'document-view',
  templateUrl: './document-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: [
    './document-view.component.scss'
  ],
  animations: [
    trigger('showMenuState', [
      state('show', style({
        'transform': 'translate(50px)'
      })),
      state('hide', style({
        'transform': 'translate(0)'
      })),
      transition('show => hide', animate(500)),
      transition('hide => show', animate(1000))
    ]),
    trigger('menuFade', [
      state('show', style({
        opacity: 1
      })),
      state('hide', style({
        opacity: 0
      })),
      transition('hide => show', animate(1000))
    ])
  ]
})

export class DocumentViewComponent extends NavigatableComponent
implements OnInit, OnDestroy {
  /* UI Toggles */
  @ViewChild('docView') docView: ElementRef

  /* Data */
  itemProxy: ItemProxy;
  itemLength: number;
  selectedRow: number;
  rowMap = {};

  filter: string;
  docRendered: string;
  itemDescriptionRendered: string;
  filterRegex: RegExp;
  filterRegexHighlighted: RegExp;
  invalidFilterRegex: boolean;
  itemsLoaded: number = 0;
  loadedProxies: Array < DocumentInfo > = [];
  formatDefs : any = {};

  /* Utils */
  docReader: Parser;
  docWriter: HtmlRenderer
  initialized: boolean;
  treeConfig : TreeConfiguration;
  treeConfigSubscription : Subscription;
  repoStatusSubscription : Subscription;


  /* Observables */
  @Input()
  filterSubject: BehaviorSubject < AnalysisFilter > ;
  @Input()
  proxyStream: Observable < ItemProxy >
  @Input()
  incrementalLoad: boolean;
  @Input()
  fullscreen = false;
  @Input()
  selectedProxyStream : Observable<ItemProxy>;
  @Output()
  proxySelected : EventEmitter<ItemProxy> = new EventEmitter<ItemProxy>();


  /* Subscriptions */
  filterSubscription: Subscription;
  proxyStreamSubscription: Subscription;
  selectedProxySubscription : Subscription;

  constructor(NavigationService: NavigationService,
    private changeRef: ChangeDetectorRef,
    private router: Router,
    private itemRepository: ItemRepository,
    private dialogService: DialogService,
    private typeService : DynamicTypesService) {
    super(NavigationService)
    this.docReader = new commonmark.Parser();
    this.docWriter = new commonmark.HtmlRenderer({
      sourcepos: true
    });
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

    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }
      this.docView.nativeElement.scrollTop = 0;
    })

    if (this.selectedProxyStream) {
      this.selectedProxySubscription = this.selectedProxyStream.subscribe((newSelection) => {
        if (newSelection) {
          this.rowMap[newSelection.item.id].nativeElement.scrollIntoView();
        }
      })
    }

    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
    .subscribe((update: any) => {
      switch (update.state) {
        case RepoStates.KOHESEMODELS_SYNCHRONIZED:
        case RepoStates.SYNCHRONIZATION_SUCCEEDED:
          this.treeConfigSubscription = this.itemRepository.getTreeConfig().subscribe((newConfig) => {
            if (newConfig) {
              let types = this.typeService.getKoheseTypes();

              for (let type in types) {
                let vm = types[type].viewModelProxy;
                if (vm && vm.item.formatDefinitions && vm.item.defaultFormatKey) {
                  this.formatDefs[type] = vm.item.formatDefinitions[vm.item.defaultFormatKey]
                } else {
                  console.log('Format not defined for ' + type);
                }
              }
              console.log(this.formatDefs);

              this.treeConfig = newConfig.config;
              this.proxyStreamSubscription = this.proxyStream.subscribe((newProxy) => {
                if (newProxy) {
                  this.itemProxy = newProxy;
                  this.itemsLoaded = 0;
                  // TODO - Determine if there is a way to cache and diff the new doc before
                  // regenerating
                  this.generateDoc();
                  this.changeRef.markForCheck();
                } else {
                  this.itemProxy = undefined
                }
              })
              this.initialized = true
            }
          })
      }
    })
  }

  ngOnDestroy() {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
    this.proxyStreamSubscription.unsubscribe();
  }

  determineLoad(subTree: Array < any > , currentLoad: number): number {
    let newLoad: number = 0;
    let loadLength: number = 0;
    let lengthIndex: number = 0;
    const lengthLimit: number = 8000

    // Case 1 : Load the whole document
    if (!this.incrementalLoad) {
      newLoad = subTree.length;
    } else {
      // Determine content length
      while (loadLength < lengthLimit &&
        ((subTree[lengthIndex]))) {
        let currentProxy = subTree[lengthIndex].proxy;
        if (!currentProxy.item.description) {
          lengthIndex++;
          continue;
        }
        loadLength += currentProxy.item.description.length;
        lengthIndex++;
      }

      if (loadLength > lengthLimit) {
        // Case 2 : Load to the content limit
        newLoad = currentLoad + lengthIndex - 1;
        if (newLoad > subTree.length) {
          newLoad = subTree.length;
        }
      } else if (this.itemsLoaded < subTree.length) {
        // Case 3 : Load based on defined increment
        newLoad = currentLoad + 20;
      }
    }

    return newLoad;
  }

  generateDoc(): void {
    let subtreeAsList = this.itemProxy.getSubtreeAsList();
    this.itemLength = subtreeAsList.length;

    if (this.itemsLoaded >= subtreeAsList.length) {
      this.itemsLoaded = subtreeAsList.length
      return;
    }

    this.loadedProxies = [];
    let docRendered = '';

    this.itemsLoaded = this.determineLoad(subtreeAsList, this.itemsLoaded);

    if (this.itemsLoaded > subtreeAsList.length) {
      this.itemsLoaded = subtreeAsList.length
    }

    for (let i = 0;
      (i < this.itemsLoaded) && (i < subtreeAsList.length); i++) {
      let listItem = subtreeAsList[i];
      let rendered = ''
      let containers;
      let format = this.formatDefs[listItem.proxy.kind];
      if (format) {
        containers = format.containers;
      }
      if (listItem.depth > 0) {
        // Show the header for any node that is not the root of the document

        rendered = '<h' + listItem.depth + '>' + listItem.proxy.item.name + '</h' + listItem.depth + '>';
      }
      if (listItem.proxy.item.description) {
        // Show the description if it exists
        let nodeParsed = this.docReader.parse(listItem.proxy.item.description);
        rendered += this.docWriter.render(nodeParsed);

      }
      this.loadedProxies.push({
        proxy: listItem.proxy,
        containers : containers,
        rendered: rendered,
        active: false,
        hovered: false,
        depth: listItem.depth
      })
    }
  }

  onScroll() {
    this.generateDoc();
    this.changeRef.markForCheck();
  }


  onFilterChange() {
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

  selectRow(row: any, proxy : ItemProxy) {
    row.rowState = 'show';
    this.proxySelected.emit(proxy)
  }
}
