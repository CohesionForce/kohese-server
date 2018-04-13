import { Component, Input } from '@angular/core'
import * as ItemProxy from '../../../../../../common/src/item-proxy';
import { AssignmentCard } from '../AssignmentCard.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';

@Component({
  selector : 'active-assignment',
  templateUrl: 'active-assignment.component.html',
  styleUrls : ['../AssignmentCard.class.scss']
})
export class ActiveAssignmentComponent extends AssignmentCard {

  /* Data */
  @Input() 
  assignment : ItemProxy 

  constructor (navigationService : NavigationService,
               itemRepository : ItemRepository) {
    super (navigationService, itemRepository);
    console.log(this);
    
  }
}