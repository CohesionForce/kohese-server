import { Component, OnInit, OnDestroy } from '@angular/core';
import { VersionControlService } from '../../../services/version-control/version-control.service';
import { RowComponent } from '../../../classes/RowComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

import { ItemProxy } from '../../../../../common/models/item-proxy.js';

Component({
  selector: 'version-control-row',
  templateUrl : './version-control-row.component.html'
})

export class VersionControlRowComponent extends RowComponent
                                        implements OnInit, OnDestroy {
  constructor (protected NavigationService : NavigationService,
               protected TabService : TabService,
               private ItemRepository : ItemRepository,
               private VersionControlService : VersionControlService) {
    super(NavigationService, TabService);

  }

  ngOnInit () {

  }

  ngOnDestroy () {

  }

  revertItem (itemProxy ) {
    if (itemProxy.vcState.Staged) {
      if (itemProxy.vcState.Staged === 'New') {
        this.showDiscardModal(itemProxy);
        return;
      }
    }
    if (itemProxy.vcState.Unstaged) {
      if (itemProxy.vcState.Unstaged === 'New') {
        this.showDiscardModal(itemProxy);
        return;
      }
    }
  }

  // TODO - check return type on these
  stageItem (itemProxy) : void {
    this.VersionControlService.stageItems([itemProxy]);
  }

  unstageItem (itemProxy) : void {
    this.VersionControlService.unstageItems([itemProxy], ()=> {
      console.log('Do something when this returns?') // TODO - find out what this callback needs to do
    });
  }

  // TODO - Angular 2 baseclass row methods


  /////////////////////////////////////////////////////////////////////////////
  // End Row Base component functions - TODO Angular 2
  /////////////////////////////////////////////////////////////////////////////

  // Private Implementations
  showDiscardModal (itemProxy) {
    var modalOptions = {
      closeButtonText: 'Cancel',
      actionButtonText: 'Discard Item',
      headerText: '"' + itemProxy.item.name + '" is a new item. ',
      bodyText: 'Reverting this to the last commit will delete it permanently. Are you sure you want to discard this item?'
    }

    // // TODO - Implement Modal integration
    // ModalService.showModal({}, modalOptions).then((result) => {
    //   ItemRepository
    //     .deleteItem(itemProxy).then((result) => {
    //       console.log('::: Item has been deleted: ' + result.itemId);
    //     });
    // })
  }
}
