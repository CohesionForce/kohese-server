import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

import { ItemProxy } from '../../../../common/models/item-proxy.js';
import { SessionService } from '../../services/user/session.service';

import * as commonmark from 'commonmark';
import { HtmlRenderer, Parser } from 'commonmark';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector : 'details-view',
  templateUrl : './details.component.html'
})

export class DetailsComponent extends NavigatableComponent
                              implements OnInit, OnDestroy {
  itemProxyId : string;
  itemProxy : ItemProxy;
  parentProxy : ItemProxy;
  typeProxies : Array<ItemProxy>;

  /* Commonmark items */
  reader : Parser;
  writer : HtmlRenderer;

  /* Observables */
  showChildrenSubject : BehaviorSubject<boolean>
  detailsFormSubject : BehaviorSubject<FormGroup>;

  /* Subscriptions */
  routeSub : Subscription;
  repoReadySub : Subscription;
  detailsFormSubscription : Subscription;

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

  constructor (protected NavigationService : NavigationService,
               private route : ActivatedRoute,
               private ItemRepository : ItemRepository,
               private SessionService : SessionService) {
    super(NavigationService);
    }

  ngOnInit () {
    this.reader = new commonmark.Parser();
    this.writer = new commonmark.HtmlRenderer();
    this.showChildren = false;
    this.showChildrenSubject = new BehaviorSubject(this.showChildren);

    /* Subscriptions */
    this.routeSub = this.route.params.subscribe(params => {
      this.itemProxyId = params['id'];
      this.repoReadySub = this.ItemRepository.getRepoStatusSubject()
      .subscribe(update => {
        if (update.connected) {
          this.itemProxy = this.ItemRepository.getProxyFor(this.itemProxyId);
          if (!this.itemProxy) {
            // TODO : Throw error modal to the UI
          }
          this.ItemRepository.registerRecentProxy(this.itemProxy);
          let modelProxy : ItemProxy = this.ItemRepository.getProxyFor('Model-Definitions');
          this.typeProxies = modelProxy.getDescendants();
          this.proxyList = this.ItemRepository.getShortFormItemList();
          this.userList = this.SessionService.getUsers();
          this.updateParentProxy();
          if (this.itemProxy.item.description) {
            let parsed = this.reader.parse(this.itemProxy.item.description);
            this.itemDescriptionRendered = this.writer.render(parsed);
          }
        }
      })
    });

    /* End Subscriptions */


    this.enableEdit = false;
    this.defaultTab = {active: true }
  }

  ngOnDestroy () {
    this.routeSub.unsubscribe();
    this.repoReadySub.unsubscribe();

    // TODO - implement bundle logic here
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

  initializeItemStates (type : string) : void {
      // TODO - Don't know how I feel about this implementation
      // Revisit after initial port
      if (type === 'Action') {
        if (!this.itemProxy.item.hasOwnProperty('actionState')) {
          this.itemProxy.item.actionState = 'Proposed';
        }
        if (!this.itemProxy.item.hasOwnProperty('decisionState')) {
          this.itemProxy.item.decisionState = 'Proposed';
        }
      } else if (type === 'Decision') {
        if (!this.itemProxy.item.hasOwnProperty('decisionState')) {
          this.itemProxy.item.decisionState = 'Proposed';
        }
      } else if (type === 'Task') {
        if (!this.itemProxy.item.hasOwnProperty('taskState')) {
          this.itemProxy.item.taskState = 'Proposed';
        }
      } else if (type === 'Issue') {
        if (!this.itemProxy.item.hasOwnProperty('issueState')) {
          this.itemProxy.item.issueState = 'Observed';
        }
      }
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
    this.ItemRepository.upsertItem(this.itemProxy)
      .then((updatedItemProxy: ItemProxy) => {
      this.enableEdit = false;
    });
  }

  showChildrenToggled () : void {
      this.showChildrenSubject.next(this.showChildren);
    }

  cancel () : void {
    if (this.itemProxy.dirty) {
      this.ItemRepository.fetchItem(this.itemProxy)
        .then((fetchResults) => {
          // TODO - Get form and set pristine
        });
    }
  };

  removeItem (proxy : ItemProxy) : void {
    this.ItemRepository.deleteItem(proxy, false)
      .then(function () {
        // TBD:  May need to do something special if the delete fails
      });
  };

}
