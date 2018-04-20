import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service'
import { AnalysisService } from '../../services/analysis/analysis.service';
import { ItemProxy } from '../../../../common/src/item-proxy';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';
import { AnalysisViews, AnalysisFilter } from './AnalysisViewComponent.class';

@Component({
  selector: 'analysis-view',
  templateUrl: './analysis.component.html'
})
export class AnalysisComponent extends NavigatableComponent
  implements OnInit, OnDestroy {

  /* UI Toggles */
  analysisLoaded: boolean;

  /* Data */
  itemProxyId: string;
  itemProxy: ItemProxy;
  filter: string;
  treeConfig: any;

  /* Subscriptions */
  routeSub: Subscription;
  filterSub: Subscription;
  treeConfigSub: Subscription;

  /* Observables */
  filterSubject: BehaviorSubject<AnalysisFilter>
  proxyStream: BehaviorSubject<ItemProxy>;

  constructor(protected NavigationService: NavigationService,
    private route: ActivatedRoute,
    private ItemRepository: ItemRepository,
    private AnalysisService: AnalysisService) {
    super(NavigationService);
    this.filterSubject = new BehaviorSubject({
      filter: '',
      source: AnalysisViews.TERM_VIEW,
      filterOptions: {
        exactMatch: false,
        ignoreCase: false
      }
    })

  }

  ngOnInit() {
    this.analysisLoaded = false;
    this.routeSub = this.route.params.subscribe(params => {
      this.itemProxyId = params['id'];
      this.treeConfigSub = this.ItemRepository.getTreeConfig().subscribe((newConfig) => {
        if (newConfig) {
          this.treeConfig = newConfig;
          this.itemProxy = this.treeConfig.getProxyFor(this.itemProxyId);
          this.proxyStream = new BehaviorSubject(this.itemProxy);
          if (this.itemProxy) {
            this.AnalysisService.fetchAnalysis(this.itemProxy).then(() => {
              this.proxyStream.next(this.itemProxy);
            },(error: any) => {
              console.error(error);
            });
          }
        }
      })
    })
    this.filter = ''
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    if (this.treeConfigSub) {
      this.treeConfigSub.unsubscribe();
    }
  }

  onFilter(newFilter) {
    this.filterSubject.next(newFilter);
  }
}
