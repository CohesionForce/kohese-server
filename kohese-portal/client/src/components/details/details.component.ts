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
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';

@Component({
  selector: 'details-view',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})

export class DetailsComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  itemProxyId: string;
  itemProxy: ItemProxy;
  itemProxyError: boolean;
  typeProxies: Array<ItemProxy>;
  private _itemJson: string;
  get itemJson() {
    return this._itemJson;
  }

  /* Observables */
  detailsFormSubject: BehaviorSubject<FormGroup>;
  proxyStream: BehaviorSubject<ItemProxy>;
  private _editableStream: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  get editableStream() {
    return this._editableStream;
  }

  /* Subscriptions */
  routeSub: Subscription;
  treeConfigSub: Subscription;
  detailsFormSubscription: Subscription;
  proxyUpdates: Subscription;
  currentTreeConfigSubscription: Subscription;

  /* UI Switches */
  defaultTab: object;
  uiTreeOptions: object;

  /* Data */
  treeConfig: any;
  relationIdMap: any;
  itemDescriptionRendered: string;
  detailsFormGroup: FormGroup;
  private nonFormFieldValueMap: any = {};
  initialized: boolean;
  repoConnected: boolean = false;

  constructor(protected NavigationService: NavigationService,
    private route: ActivatedRoute,
    private ItemRepository: ItemRepository,
    private SessionService: SessionService) {
    super(NavigationService);
  }

  ngOnInit() {

    this.proxyStream = new BehaviorSubject(undefined);

    /* Subscriptions */
    this.routeSub = this.route.params.subscribe(params => {
      this.itemProxyId = params['id'];

      if (this.initialized && this.repoConnected) {
        this.updateProxy();
      } else {
        this.treeConfigSub = this.currentTreeConfigSubscription = this.ItemRepository.getTreeConfig()
          .subscribe((newConfig) => {
            this.treeConfig = newConfig;
            // Unsubscribe from old tree updates
            if (this.proxyUpdates) {
              this.proxyUpdates.unsubscribe();
              this.proxyUpdates = undefined;
            }
            this.repoConnected = true;
            this.updateProxy();
            this.proxyUpdates = newConfig.getChangeSubject().subscribe((change) => {
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
    this._editableStream.next(false);
    this.defaultTab = { active: true };
    this.itemProxy = this.treeConfig.getProxyFor(this.itemProxyId);
    if (this.itemProxy) {
      this.ItemRepository.registerRecentProxy(this.itemProxy);
      this.relationIdMap = this.itemProxy.getRelationIdMap();
      this._itemJson = this.itemProxy.document();
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

  onFormGroupUpdated(newFormGroup: any) {
    this.detailsFormGroup = newFormGroup;
    console.log(newFormGroup);
  }

  generateHTMLReport(): void {
    this.ItemRepository.generateHTMLReportFor(this.itemProxy);
  };

  generateDOCXReport(): void {
    this.ItemRepository.generateDOCXReportFor(this.itemProxy);
  };

  getHistory = function (): void {
    this.ItemRepository.getHistoryFor(this.itemProxy);
  };

  upsertItem(item: any): void {
    for (let field in item) {
      this.itemProxy.item[field] = item[field];
    }
    for (let fieldName in this.nonFormFieldValueMap) {
      this.itemProxy.item[fieldName] = this.nonFormFieldValueMap[fieldName];
    }
    this.ItemRepository.upsertItem(this.itemProxy)
      .then((updatedItemProxy: ItemProxy) => {
        this._editableStream.next(false);
      });
  }

  removeItem(proxy: ItemProxy): void {
    this.ItemRepository.deleteItem(proxy, false)
      .then(function () {
        // TBD:  May need to do something special if the delete fails
      });
  };

  public whenNonFormFieldChanges(updatedField: any): void {
    this.nonFormFieldValueMap[updatedField.fieldName] = updatedField.fieldValue;
  }

  public cancelEditing(): void {
    this._editableStream.next(false);
    this.ItemRepository.fetchItem(this.itemProxy).then((proxy: ItemProxy) => {
      this.updateProxy();
    });
  }
}
