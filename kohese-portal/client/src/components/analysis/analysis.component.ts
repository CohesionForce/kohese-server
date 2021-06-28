// Angular
import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

// NPM
import { BehaviorSubject ,  Subscription } from 'rxjs';

// Kohese
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service'
import { AnalysisService } from '../../services/analysis/analysis.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { AnalysisViews, AnalysisFilter } from './AnalysisViewComponent.class';

@Component({
  selector: 'analysis-view',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent extends NavigatableComponent
  implements OnInit, OnDestroy {

  /* UI Toggles */
  analysisLoaded: boolean;
  @Output() analysisView: boolean = true;

  /* Data */
  analysisTitle: string = ('');
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

  constructor(
    protected NavigationService: NavigationService,
    private route: ActivatedRoute,
    private ItemRepository: ItemRepository,
    private AnalysisService: AnalysisService,
    private _dialogService: DialogService,
    private title : Title
    ) {
    super(NavigationService);
    this.title.setTitle("Analysis");

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
          this.treeConfig = newConfig.config;
          this.itemProxy = this.treeConfig.getProxyFor(this.itemProxyId);
          this.analysisTitle = this.itemProxy.item.name;
          this.title.setTitle('Analysis | ' + this.analysisTitle);
          this.proxyStream = new BehaviorSubject(this.itemProxy);
          if (this.itemProxy) {
            this.AnalysisService.fetchAnalysis(this.itemProxy).then(() => {
              this.proxyStream.next(this.itemProxy);
            },(error: any) => {
              this._dialogService.openInformationDialog('Analysis Error',
                'An error occurred while attempting to analyze ' + this.
                itemProxy.item.name + '.');
              this.NavigationService.navigate('Explore', { id: params['id'] });
            });
          } else {
            this._dialogService.openInformationDialog('Invalid Reference',
              'The Item indicated by the URL was not found.');
            this.NavigationService.navigate('Explore', { id: '' });
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
