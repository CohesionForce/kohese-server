
import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { NavigatableComponent } from '../../classes/NavigationComponent.class'
import { NavigationService } from '../../services/navigation/navigation.service';
import { TabService } from '../../services/tab/tab.service';

import { ItemProxy } from '../../../../common/models/item-proxy.js'

@Component({
  selector : 'create-item',
  templateUrl : './create-item.component.html'
})
export class CreateItemComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy{
  @Input()
  itemProxy : ItemProxy;

  constructor(protected NavigationService : NavigationService,
              protected TabService : TabService) {
    super(NavigationService, TabService);
  }

  ngOnInit() {

  }

  ngOnDestroy () {

  }

}

// TODO - Implement

/* Harvested from details
  //   detailsCtrl.createItem = function (navigationType) {
  //     detailsCtrl.itemProxy.model = ItemRepository
  //       .getProxyFor(detailsCtrl.itemProxy.kind);
  //     ItemRepository.upsertItem(detailsCtrl.itemProxy)
  //       .then(function (updatedItemProxy) {
  //         if (!detailsCtrl.itemProxy.updateItem) {
  //           // This was a create, so replace the itemProxy
  //           detailsCtrl.itemProxy = updatedItemProxy;
  //         }
  //         // clear the state of the form
  //         detailsCtrl.itemForm.$setPristine();
  //         if (detailsCtrl.decisionForm) {
  //           detailsCtrl.decisionForm.$setPristine();
  //         }
  //         if (detailsCtrl.actionForm) {
  //           detailsCtrl.actionForm.$setPristine();
  //         }
  //         detailsCtrl.enableEdit = false;

  //         if (navigationType === 'parent') {
  //           detailsCtrl.updateTab('kohese.explore.edit', updatedItemProxy.item.parentId);
  //         } else if (navigationType === 'child') {
  //           detailsCtrl.updateTab('kohese.explore.edit', updatedItemProxy.item.id);
  //         }
  //       });
  //   };
*/
