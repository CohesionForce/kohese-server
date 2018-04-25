import { NavigatableComponent } from "../../classes/NavigationComponent.class";
import { NavigationService } from "../../services/navigation/navigation.service";
import { BehaviorSubject, Subscription } from "rxjs";

import * as ItemProxy from '../../../../common/src/item-proxy';
import { FormGroup } from "@angular/forms";
import { ItemRepository } from "../../services/item-repository/item-repository.service";

/* This class centralizes the logic pertaining to how the details managers feed
   information into the proxy detail subcomponents, it does not contain the logic 
   that determines how the specific proxy info is discovered */

export abstract class ProxyDetailsComponent extends NavigatableComponent {

  /* Data */
  detailsFormGroup : FormGroup;
  itemProxy : ItemProxy;
  nonFormFieldValueMap: any = {};
  /* UI Switches */

  /* Observables */
  detailsFormSubject : BehaviorSubject<FormGroup> = new BehaviorSubject<FormGroup>(undefined);
  proxyStream : BehaviorSubject<ItemProxy> = new BehaviorSubject<ItemProxy>(undefined);
  editableStream : BehaviorSubject<boolean> = new BehaviorSubject<ItemProxy>(false);

  /* Subscriptions */
  proxyUpdates : Subscription;
  detailsFormSubscription : Subscription;

  constructor (protected navigationService : NavigationService,
               protected itemRepository : ItemRepository) {
    super(navigationService)
  }

  upsertItem(item: any): void {
    for (let field in item) {
      this.itemProxy.item[field] = item[field];
    }
    for (let fieldName in this.nonFormFieldValueMap) {
      this.itemProxy.item[fieldName] = this.nonFormFieldValueMap[fieldName];
    }
    this.itemRepository.upsertItem(this.itemProxy)
      .then((updatedItemProxy: ItemProxy) => {
        this.editableStream.next(false);
      });
  }

  onFormGroupUpdated(newFormGroup: any) {
    this.detailsFormGroup = newFormGroup;
    console.log(this);
  }

  onNonFormFieldChanged(updatedField: any): void {
    this.nonFormFieldValueMap[updatedField.fieldName] = updatedField.fieldValue;
  }

  cancelEditing(): void {
    this.editableStream.next(false);
    this.itemRepository.fetchItem(this.itemProxy).then((proxy: ItemProxy) => {
      this.updateProxy();
    });
  }

  // Implement this method with the appropriate update strategy for the specific manager
  abstract updateProxy ();
}