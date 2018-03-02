import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';

import * as ItemProxy from '../../../../common/models/item-proxy.js';
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
  parentProxy : ItemProxy;
  typeProxies : Array<ItemProxy>;

  /* Observables */
  showChildrenSubject : BehaviorSubject<boolean>
  detailsFormSubject : BehaviorSubject<FormGroup>;
  proxyStream : BehaviorSubject<ItemProxy>
  
  /* Subscriptions */
  routeSub : Subscription;
  repoReadySub : Subscription;
  detailsFormSubscription : Subscription;
  proxyUpdates : Observable<any>;

  /* UI Switches */
  enableEdit : boolean;
  defaultTab : object;
  uiTreeOptions : object;
  showChildren : boolean;

  /* Data */
  kindList : Array<string>;
  decisionStates : Array<string>;
  actionStates : Array<string>;
  issueStates : Array<string>;
  categoryTags : Array<string>;
  userList : Array<any>
  currentUser : any;
  proxyList : Array<any>;
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
    this.showChildren = false;
    this.showChildrenSubject = new BehaviorSubject(this.showChildren);

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
              if(change.id === this.itemProxy.item.id) {
                this.proxyStream.next(change.proxy);
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
    this.itemProxy = this.ItemRepository.getProxyFor(this.itemProxyId);
      if (!this.itemProxy) {
        // TODO : Throw error modal to the UI
        }

      this.ItemRepository.registerRecentProxy(this.itemProxy);

      // Is this defunct? TODO 
      let modelProxy : ItemProxy = this.ItemRepository.getProxyFor('Model-Definitions');
      this.typeProxies = modelProxy.getDescendants();

      this.proxyList = this.ItemRepository.getShortFormItemList();
      this.userList = this.SessionService.getUsers();
      this.updateParentProxy();

      this.enableEdit = false;
      this.defaultTab = {active: true }
      this.proxyStream.next(this.itemProxy);
  }

  updateParentProxy () : void {
        if (this.itemProxy && this.itemProxy.item.parentId) {
          this.parentProxy = this.ItemRepository.getProxyFor(this.itemProxy.item.parentId);
        } else {
          this.parentProxy = {};
        }
      };

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
      this.enableEdit = false;
    });
  }

  showChildrenToggled () : void {
      this.showChildrenSubject.next(this.showChildren);
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
}
