import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';

import { ItemProxy } from '../../../../common/src/item-proxy.js';
import { SessionService } from '../../services/user/session.service';

import * as commonmark from 'commonmark';
import { HtmlRenderer, Parser } from 'commonmark';
import { Subscription ,  BehaviorSubject ,  Observable } from 'rxjs';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { ProxyDetailsComponent } from './ProxyDetails.Class';

/* This component serves as a manager for viewing proxy details in the explore view.
   It functions by retrieving an id from the route parameters and then retrieving
   the proxy from the current tree configuration object
*/

@Component({
  selector: 'details-view',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})

export class DetailsComponent extends ProxyDetailsComponent
  implements OnInit, OnDestroy {

  /* Subscriptions */
  routeSub: Subscription;

  // why are there two
  treeConfigSub: Subscription;
  currentTreeConfigSubscription: Subscription;

  /* Data */
  itemProxyId: string;
  itemProxyError: boolean;
  itemJson: string;
  itemVCStatusJson: string;
  treeConfig: any;
  relationIdMap: any;
  itemDescriptionRendered: string;
  initialized: boolean;
  repoConnected: boolean = false;

  constructor(protected navigationService: NavigationService,
    private route: ActivatedRoute,
    protected itemRepository: ItemRepository) {
    super(navigationService, itemRepository);
  }

  ngOnInit() {
    /* Subscriptions */
    this.routeSub = this.route.params.subscribe(params => {
      this.itemProxyId = params['id'];
      // If a new id has come in and the initial set up has been done
      if (this.initialized && this.repoConnected) {
        this.updateProxy();
      } else {
        this.treeConfigSub = this.currentTreeConfigSubscription = this.itemRepository.getTreeConfig()
          .subscribe((newConfig) => {
            this.treeConfig = newConfig.config;
            // Unsubscribe from old tree updates
            if (this.proxyUpdates) {
              this.proxyUpdates.unsubscribe();
              this.proxyUpdates = undefined;
            }
            this.repoConnected = true;
            this.updateProxy();
            this.proxyUpdates = this.treeConfig.getChangeSubject().subscribe((change) => {
              if (this.itemProxy === change.proxy) {
                this.proxyStream.next(change.proxy);
                this.relationIdMap = this.itemProxy.getRelationIdMap();
              }
            })
          })


        this.initialized = true;
      }
    })
    /* End Subscriptions */
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    if (this.treeConfigSub) {
      this.treeConfigSub.unsubscribe();
    }
    if (this.proxyUpdates) {
      this.proxyUpdates.unsubscribe();
    }
  }

  updateProxy() {
    this.editableStream.next(false);
    this.itemProxy = this.treeConfig.getProxyFor(this.itemProxyId);
    if (this.itemProxy) {
      this.itemRepository.registerRecentProxy(this.itemProxy);
      this.relationIdMap = this.itemProxy.getRelationIdMap();
      this.itemJson = this.itemProxy.document();
      this.itemVCStatusJson = JSON.stringify(this.itemProxy.vcStatus, null, '  ');
      this.itemProxyError = false;
    } else {
      // TODO : Throw error modal to the UI
      this.itemProxyError = true;
    }

    this.proxyStream.next(this.itemProxy);
  }

  getProxyFor(id): any {
    return this.treeConfig.getProxyFor(id);
  }

  getHistory = function (): void {
    this.itemRepository.getHistoryFor(this.itemProxy);
  };

  removeItem(proxy: ItemProxy): void {
    this.itemRepository.deleteItem(proxy, false)
      .then(function () {
        // TBD:  May need to do something special if the delete fails
      });
  };



}
