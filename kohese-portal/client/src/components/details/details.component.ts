import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';

import * as ItemProxy from '../../../../common/src/item-proxy.js';
import { SessionService } from '../../services/user/session.service';

import * as commonmark from 'commonmark';
import { HtmlRenderer, Parser } from 'commonmark';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Component({
  selector : 'details-view',
  templateUrl : './details.component.html',
  styleUrls: ['./details.component.scss']
})

export class DetailsComponent extends NavigatableComponent
                              implements OnInit, OnDestroy {
  itemProxyId : string;
  itemProxy : ItemProxy;
  typeProxies : Array<ItemProxy>;
  private _itemJson: string;
  get itemJson() {
    return this._itemJson;
  }

  /* Observables */
  detailsFormSubject : BehaviorSubject<FormGroup>;
  proxyStream : BehaviorSubject<ItemProxy>;
  private _editableStream: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  get editableStream() {
    return this._editableStream;
  }

  /* Subscriptions */
  routeSub : Subscription;
  repoReadySub : Subscription;
  detailsFormSubscription : Subscription;
  proxyUpdates : Observable<any>;

  /* UI Switches */
  defaultTab : object;
  uiTreeOptions : object;

  /* Data */
  kindList : Array<string>;
  decisionStates : Array<string>;
  actionStates : Array<string>;
  issueStates : Array<string>;
  categoryTags : Array<string>;
  userList : Array<any>
  currentUser : any;
  proxyList : Array<any>;
  relationIdMap : any;
  itemDescriptionRendered : string;
  detailsFormGroup : FormGroup;
  private nonFormFieldValueMap: any = {};
  initialized : boolean;
  repoConnected : boolean = false;

  constructor (protected NavigationService : NavigationService,
               private route : ActivatedRoute,
               private ItemRepository : ItemRepository,
               private SessionService : SessionService) {
    super(NavigationService);
    }

  ngOnInit () {

    this.proxyStream = new BehaviorSubject({});

    /* Subscriptions */
    this.routeSub = this.route.params.subscribe(params => {
      this.itemProxyId = params['id'];

      if (this.initialized && this.repoConnected) {
        this.updateProxy();
      } else {
        this.repoReadySub = this.ItemRepository.getRepoStatusSubject()
        .subscribe(update => {
          if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
            this.repoConnected = true;
            this.updateProxy();
            this.proxyUpdates = ItemProxy.getChangeSubject().subscribe((change)=>{
              if(change.id === this.itemProxyId) {
                this.proxyStream.next(change.proxy);
                this.relationIdMap = this.itemProxy.getRelationIdMap();
              }
            })
          }
        })
        this.initialized = true;
      }
    })
    /* End Subscriptions */
  }

  ngOnDestroy () {
    this.routeSub.unsubscribe();
    this.repoReadySub.unsubscribe();
  }

  updateProxy () {
    // Is this defunct? TODO
    let modelProxy : ItemProxy = this.ItemRepository.getProxyFor('Model-Definitions');
    this.typeProxies = modelProxy.getDescendants();

    this.proxyList = this.ItemRepository.getShortFormItemList();
    this.userList = this.SessionService.getUsers();
    this._editableStream.next(false);
    this.defaultTab = { active: true };
    this.itemProxy = this.ItemRepository.getProxyFor(this.itemProxyId);
    if (this.itemProxy) {
      this.ItemRepository.registerRecentProxy(this.itemProxy);
      this.relationIdMap = this.itemProxy.getRelationIdMap();
      this._itemJson = this.itemProxy.document();
    } else {
      // TODO : Throw error modal to the UI
    }

    this.proxyStream.next(this.itemProxy);
  }

  getProxyFor(id) : any {
      return this.ItemRepository.getProxyFor(id);
    }

  onFormGroupUpdated(newFormGroup : any) {
    this.detailsFormGroup = newFormGroup;
    console.log(newFormGroup);
  }

  generateHTMLReport () : void {
        this.ItemRepository.generateHTMLReportFor(this.itemProxy);
      };

  generateDOCXReport () : void {
        this.ItemRepository.generateDOCXReportFor(this.itemProxy);
      };

  getHistory = function () : void {
        this.ItemRepository.getHistoryFor(this.itemProxy);
      };

  upsertItem(item: any) : void {
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

  removeItem (proxy : ItemProxy) : void {
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
