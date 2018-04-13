import { Component, Input } from '@angular/core'
import * as ItemProxy from '../../../../../../common/src/item-proxy';
import {NavigatableComponent} from '../../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { AssignmentCard } from '../AssignmentCard.class';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';

@Component({
  selector : 'completed-assignment',
  templateUrl: 'completed-assignment.component.html',
  styleUrls : ['../AssignmentCard.class.scss']
})
export class CompletedAssignmentComponent extends AssignmentCard {

  /* Data */
  @Input() 
  assignment : ItemProxy 

  constructor (navigationService : NavigationService,
               itemRepository : ItemRepository) {
    super (navigationService, itemRepository);
    
  }
}