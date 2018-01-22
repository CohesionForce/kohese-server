import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigatableComponent } from '../../classes/NavigationComponent.class'
import { NavigationService } from '../../services/navigation/navigation.service';
import { TabService } from '../../services/tab/tab.service';

import { ItemProxy } from '../../../../common/models/item-proxy.js';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector : 'create-item',
  templateUrl : './create-item.component.html'
})
export class CreateItemComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  @Input()
  private itemProxy: ItemProxy;
  private repoStatusSubscription: Subscription;
  private types: Array<ItemProxy>;
  private uploader: FileUploader = new FileUploader({
    url: ''});

  constructor(protected NavigationService : NavigationService,
              protected TabService : TabService,
              private itemRepository: ItemRepository,
              private route: ActivatedRoute) {
    super(NavigationService, TabService);
  }

  ngOnInit(): void {
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
      .subscribe((update) => {
      if (update.connected) {
        this.types = this.itemRepository.getProxyFor('Model-Definitions').
          getDescendants().sort((first: ItemProxy, second: ItemProxy) => {
          return ((first.item.name > second.item.name) ?
            1 : ((first.item.name < second.item.name) ? -1 : 0));
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.repoStatusSubscription.unsubscribe();
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
