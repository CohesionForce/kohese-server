import { FormatDefinition } from '../type-editor/format-editor/format-editor.component';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { DialogService } from '../../services/dialog/dialog.service';
import { DetailsDialogComponent } from '../details/details-dialog/details-dialog.component';
import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';
import { Component, OnInit, OnDestroy, Input, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy,
         ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Parser, HtmlRenderer } from 'commonmark';
import { Observable ,  BehaviorSubject ,  Subscription } from 'rxjs';

import { ItemProxy } from '../../../../common/src/item-proxy';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';

import { NavigationService } from '../../services/navigation/navigation.service';

import * as commonmark from 'commonmark';
import { AnalysisFilter } from '../analysis/AnalysisViewComponent.class';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { Router, NavigationEnd } from '@angular/router';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface DocumentInfo {
  proxy: ItemProxy;
  format: Array<any>;
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
  @ViewChild('docView') docView: ElementRef;

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
  itemsLoaded = 0;
  loadedProxies: Array < DocumentInfo > = [];
  formatDefs: any = {};

  /* Utils */
  docReader: Parser;
  docWriter: HtmlRenderer;
  initialized: boolean;
  treeConfig: TreeConfiguration;
  treeConfigSubscription: Subscription;
  repoStatusSubscription: Subscription;


  /* Observables */
  @Input()
  filterSubject: BehaviorSubject < AnalysisFilter > ;
  @Input()
  proxyStream: Observable < ItemProxy >;
  @Input()
  incrementalLoad: boolean;
  @Input()
  fullscreen = false;
  @Input()
  selectedProxyStream: Observable<ItemProxy>;
  @Output()
  proxySelected: EventEmitter<ItemProxy> = new EventEmitter<ItemProxy>();


  /* Subscriptions */
  filterSubscription: Subscription;
  proxyStreamSubscription: Subscription;
  selectedProxySubscription: Subscription;

  constructor(navigationService: NavigationService,
    private changeRef: ChangeDetectorRef,
    private router: Router,
    private itemRepository: ItemRepository,
    private dialogService: DialogService,
    private typeService: DynamicTypesService) {
    super(navigationService);
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
      });
    }

    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }
      this.docView.nativeElement.scrollTop = 0;
    });

    if (this.selectedProxyStream) {
      this.selectedProxySubscription = this.selectedProxyStream.subscribe((newSelection) => {
        if (newSelection) {
          this.rowMap[newSelection.item.id].nativeElement.scrollIntoView();
        }
      });
    }

    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
    .subscribe((update: any) => {
      switch (update.state) {
        case RepoStates.KOHESEMODELS_SYNCHRONIZED:
        case RepoStates.SYNCHRONIZATION_SUCCEEDED:
          this.treeConfigSubscription = this.itemRepository.getTreeConfig().subscribe((newConfig) => {
            if (newConfig) {
              const types = this.typeService.getKoheseTypes();

              for (const type in types) {
                if (type) {
                  const vm = types[type].viewModelProxy;
                  if (vm && vm.item.formatDefinitions && vm.item.defaultFormatKey) {
                    this.formatDefs[type] = vm.item.formatDefinitions[vm.item.defaultFormatKey];
                  } else {
                    console.log('Format not defined for ' + type);
                  }
                }
              }
              this.treeConfig = newConfig.config;
              this.proxyStreamSubscription = this.proxyStream.subscribe((newProxy) => {
                if (newProxy) {
                  this.itemProxy = newProxy;
                  this.itemRepository.registerRecentProxy(newProxy);
                  this.itemsLoaded = 0;
                  // TODO - Determine if there is a way to cache and diff the new doc before
                  // regenerating
                  this.generateDoc();
                  this.changeRef.markForCheck();
                } else {
                  this.itemProxy = undefined;
                }
              });
              this.initialized = true;
            }
          });
      }
    });
  }

  ngOnDestroy() {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
    
    if (this.proxyStreamSubscription) {
      this.proxyStreamSubscription.unsubscribe();
    }
  }

  determineLoad(subTree: Array < any > , currentLoad: number): number {
    let newLoad = 0;
    let loadLength = 0;
    let lengthIndex = 0;
    const lengthLimit = 8000;

    // Case 1 : Load the whole document
    if (!this.incrementalLoad) {
      newLoad = subTree.length;
    } else {
      // Determine content length
      while (loadLength < lengthLimit &&
        ((subTree[lengthIndex]))) {
        const currentProxy = subTree[lengthIndex].proxy;
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
    const subtreeAsList = this.itemProxy.getSubtreeAsList();
    this.itemLength = subtreeAsList.length;

    if (this.itemsLoaded >= subtreeAsList.length) {
      this.itemsLoaded = subtreeAsList.length;
      return;
    }

    this.loadedProxies = [];
    this.itemsLoaded = this.determineLoad(subtreeAsList, this.itemsLoaded);

    if (this.itemsLoaded > subtreeAsList.length) {
      this.itemsLoaded = subtreeAsList.length;
    }

    for (let i = 0;
      (i < this.itemsLoaded) && (i < subtreeAsList.length); i++) {
      const listItem = subtreeAsList[i];
      let format = this.formatDefs[listItem.proxy.kind];
      if (!format) {
        format = {
          header : {
            kind: 'header',
            contents : [
              {propertyName : 'name', hideLabel: true}
            ]
          },
          containers: []
        };
      }

      this.loadedProxies.push({
        proxy: listItem.proxy,
        format : format,
        active: false,
        hovered: false,
        depth: listItem.depth
      });
    }
  }

  onScroll() {
    this.generateDoc();
    this.changeRef.markForCheck();
  }


  onFilterChange() {
    console.log('>>> Filter string changed to: ' + this.filter);

    const regexFilter = /^\/(.*)\/([gimy]*)$/;
    const filterIsRegex = this.filter.match(regexFilter);

    if (filterIsRegex) {
      try {
        this.filterRegex = new RegExp(filterIsRegex[1], filterIsRegex[2]);
        this.filterRegexHighlighted = new RegExp('(' + filterIsRegex[1] + ')', 'g' + filterIsRegex[2]);
        this.invalidFilterRegex = false;
      } catch (e) {
        this.invalidFilterRegex = true;
      }
    } else {
      const cleanedPhrase = this.filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  selectRow(row: any, proxy: ItemProxy) {
    row.rowState = 'show';
    this.proxySelected.emit(proxy);
  }
}
