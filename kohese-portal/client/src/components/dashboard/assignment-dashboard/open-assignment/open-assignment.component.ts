import { DialogService } from './../../../../services/dialog/dialog.service';
import { Component, Input, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { AssignmentCard } from '../AssignmentCard.class';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';

@Component({
  selector : 'open-assignment',
  templateUrl: 'open-assignment.component.html',
  styleUrls : ['../AssignmentCard.class.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpenAssignmentComponent extends AssignmentCard implements OnDestroy, OnInit {

  /* Data */
  @Input()
  itemProxy : ItemProxy

  constructor (dialogService : DialogService,
               itemRepository : ItemRepository,
               changeRef : ChangeDetectorRef) {
    super (itemRepository,dialogService, changeRef);

  }

  ngOnInit () {
    this.assignmentProxyStream.next(this.itemProxy);
  }

  ngOnDestroy() {
    this.destroy();
  }
}
