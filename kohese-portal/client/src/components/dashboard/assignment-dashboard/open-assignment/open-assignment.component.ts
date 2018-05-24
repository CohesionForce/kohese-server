import { Component, Input, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { NavigatableComponent } from '../../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { AssignmentCard } from '../AssignmentCard.class';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { BehaviorSubject } from 'rxjs';

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

  constructor (navigationService : NavigationService,
               itemRepository : ItemRepository,
               changeRef : ChangeDetectorRef) {
    super (navigationService, itemRepository, changeRef);

  }

  ngOnInit () {
    this.assignmentProxyStream.next(this.itemProxy);
  }

  ngOnDestroy() {
    this.destroy();
  }
}
