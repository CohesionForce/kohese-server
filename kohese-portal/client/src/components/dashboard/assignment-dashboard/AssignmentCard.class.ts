import { DetailsDialogComponent } from './../../details/details-dialog/details-dialog.component';
import { DialogService } from './../../../services/dialog/dialog.service';
import { NavigatableComponent } from "../../../classes/NavigationComponent.class";
import { NavigationService } from "../../../services/navigation/navigation.service";
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

import { ItemProxy } from '../../../../../common/src/item-proxy';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { ChangeDetectorRef } from "@angular/core";

export class AssignmentCard {

  editable : boolean;
  assignmentProxyStreamSub : Subscription;
  assignmentProxyStream : BehaviorSubject<ItemProxy>;
  assignment : ItemProxy;

  constructor (private itemRepository : ItemRepository,
               private dialogService : DialogService,
               protected changeRef : ChangeDetectorRef) {
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
    this.itemRepository.upsertItem(this.assignment.kind, this.assignment.item)
      .then((newAssignment)=>{
        this.assignment = newAssignment;
        this.editable = false;
        this.changeRef.markForCheck();
      })
  }

  destroy() {
    this.assignmentProxyStreamSub.unsubscribe();
  }

  openProxyDetails(proxy: ItemProxy) {
    this.dialogService.openComponentDialog(DetailsDialogComponent, {
      data : {
        itemProxy : proxy
      }
    }).updateSize('80%', '80%')
      .afterClosed().subscribe((results)=>{

      });
  }
}
