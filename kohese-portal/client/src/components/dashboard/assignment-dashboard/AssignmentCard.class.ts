import { NavigatableComponent } from "../../../classes/NavigationComponent.class";
import { NavigationService } from "../../../services/navigation/navigation.service";
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

import * as ItemProxy from '../../../../../common/src/item-proxy';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { ChangeDetectorRef } from "@angular/core";

export class AssignmentCard extends NavigatableComponent {

  editable : boolean; 
  assignmentProxyStreamSub : Subscription;
  assignmentProxyStream : BehaviorSubject<ItemProxy>;
  assignment : ItemProxy;

  constructor (private navigationService : NavigationService ,
               private itemRepository : ItemRepository,
               protected changeRef : ChangeDetectorRef) {
    super (navigationService);
    this.changeRef = changeRef
    this.assignmentProxyStream = new BehaviorSubject<ItemProxy>(undefined);
    this.assignmentProxyStreamSub = this.assignmentProxyStream.subscribe((assignment)=>{
      this.assignment = assignment;
      
    }) 
  }

  toggleEdit (editable : boolean ) {
    this.editable = !editable
    this.changeRef.markForCheck();
  }

  stateChanged(stateName, value) {
    this.assignment[stateName] = value;
    this.changeRef.markForCheck();
  }

  upsertItem() {
    this.itemRepository.upsertItem(this.assignment)
      .then((newAssignment)=>{
        this.assignment = newAssignment;
        this.editable = false;
        this.changeRef.markForCheck();
      })
  }

  destroy() {
    this.assignmentProxyStreamSub.unsubscribe();
  }
}