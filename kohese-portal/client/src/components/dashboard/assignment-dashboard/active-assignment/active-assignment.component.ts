import { Component, Input, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { AssignmentCard } from '../AssignmentCard.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';

@Component({
  selector : 'active-assignment',
  templateUrl: 'active-assignment.component.html',
  styleUrls : ['../AssignmentCard.class.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActiveAssignmentComponent extends AssignmentCard implements OnInit ,OnDestroy {

  /* Data */
  @Input()
  itemProxy : ItemProxy


  constructor (navigationService : NavigationService,
              itemRepository : ItemRepository,
              changeRef : ChangeDetectorRef) {
    super (navigationService, itemRepository, changeRef);

}

  ngOnInit () {
    this.assignmentProxyStream.next(this.itemProxy);
  }

  ngOnDestroy () {
    this.destroy();
  }
}
