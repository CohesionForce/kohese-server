import { Component, Input } from '@angular/core'
import * as ItemProxy from '../../../../../../common/src/item-proxy';
import {NavigatableComponent} from '../../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { AssignmentCard } from '../AssignmentCard.class';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';

@Component({
  selector : 'due-assignment',
  templateUrl: 'due-assignment.component.html',
  styleUrls : ['../AssignmentCard.class.scss']
})
export class DueAssignmentComponent extends AssignmentCard {

  /* Data */
  @Input() 
  assignment : ItemProxy 

  constructor (navigationService : NavigationService,
               itemRepository : ItemRepository) {
    super (navigationService, itemRepository);
    
  }
}