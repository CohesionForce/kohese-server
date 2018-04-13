import { Component, Input, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, OnInit } from '@angular/core'
import * as ItemProxy from '../../../../../../common/src/item-proxy';
import {NavigatableComponent} from '../../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { AssignmentCard } from '../AssignmentCard.class';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';

@Component({
  selector : 'completed-assignment',
  templateUrl: 'completed-assignment.component.html',
  styleUrls : ['../AssignmentCard.class.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompletedAssignmentComponent extends AssignmentCard implements OnInit ,OnDestroy {

  /* Data */
  @Input() 
  itemProxy : ItemProxy 

  constructor (navigationService : NavigationService,
              itemRepository : ItemRepository, 
              changeRef : ChangeDetectorRef) {
    super (navigationService, itemRepository, changeRef);
    console.log(this);
  }
  
  ngOnInit () {
    this.assignmentProxyStream.next(this.itemProxy);
  }

  ngOnDestroy () {
    this.destroy();
  }


}